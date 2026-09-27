import { Component, Injector, afterNextRender, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { ChatMessage, Conversation } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { VideoCallComponent } from '../../shared/video-call';

@Component({
  selector: 'app-messages',
  imports: [FormsModule, IconComponent, VideoCallComponent],
  templateUrl: './messages.html',
})
export class MessagesPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly errors = inject(ErrorService);
  private readonly injector = inject(Injector);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly activeId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  draft = '';

  /**
   * Qué panel se ve en móvil. En escritorio los dos caben de uno al lado del
   * otro y la hoja de estilos muestra ambos, así que el valor solo cuenta por
   * debajo de 760 px. Arranca en la lista: entrar en Mensajes debe permitir
   * elegir conversación, no dejar caer al usuario dentro de un hilo al azar.
   */
  readonly mobilePane = signal<'list' | 'thread'>('list');

  // Hilos generados al llegar por enlace (chat de grupo o de tutor).
  private externalThreads = new Map<string, ChatMessage[]>();

  // Videollamada
  readonly callOpen = signal(false);
  readonly callTarget = signal<{ name: string; initials: string } | null>(null);

  constructor() {
    this.catalog
      .getConversations()
      .pipe(
        // Aquí no se usa `finalize`: el indicador lo enciende y apaga
        // `loadMessages()`, que se llama desde este mismo `next`. Si la lista
        // falla, no hay hilo que abrir, así que se apaga a mano.
        tap({ error: () => this.loading.set(false) }),
        this.errors.catch('mensajes.conversaciones'),
      )
      .subscribe((list) => {
        this.conversations.set(list.map((c) => ({ ...c })));
        const params = this.route.snapshot.queryParamMap;
        const tutorId = params.get('tutor');
        const groupId = params.get('grupo');

        if (tutorId) {
          this.catalog
            .getTutorConversation(tutorId)
            .pipe(this.errors.catch('mensajes.hiloTutor'))
            .subscribe(({ conversation, messages }) => {
              this.embedExternal(conversation, messages);
            });
        } else if (groupId) {
          this.catalog
            .getGroupConversation(groupId)
            .pipe(this.errors.catch('mensajes.hiloGrupo'))
            .subscribe(({ conversation, messages }) => {
              this.embedExternal(conversation, messages);
            });
        } else {
          this.activeId.set(list[0]?.id ?? null);
          this.loadMessages();
        }
      });
  }

  private embedExternal(conversation: Conversation, thread: ChatMessage[]): void {
    this.externalThreads.set(conversation.id, thread.map((m) => ({ ...m })));
    if (!this.conversations().some((c) => c.id === conversation.id)) {
      this.conversations.update((list) => [...list, conversation]);
    }
    this.activeId.set(conversation.id);
    // Se llega aquí desde un enlace a un grupo o tutor concreto: el usuario ya
    // ha elegido con qué hablar, así que en móvil se abre directamente el hilo.
    this.mobilePane.set('thread');
    this.loadMessages();
  }

  get activeConversation(): Conversation | null {
    return this.conversations().find((c) => c.id === this.activeId()) ?? null;
  }

  /** El grupo es la única conversación con varios remitentes distintos. */
  get isGroupThread(): boolean {
    return this.activeConversation?.name.startsWith('Grupo') ?? false;
  }

  /** Nombre real de la sesión (derivado del correo con el que se inició sesión). */
  private get myName(): string {
    return this.session.student()?.name ?? 'Tú';
  }

  private get myInitials(): string {
    return this.session.student()?.initials ?? 'TU';
  }

  selectConversation(id: string): void {
    if (this.activeId() === id) {
      // Reabrir la conversación ya activa en móvil también debe sacar del
      // panel de la lista: si no, el segundo toque parece no hacer nada.
      this.mobilePane.set('thread');
      return;
    }
    this.activeId.set(id);
    this.mobilePane.set('thread');
    this.loadMessages();
  }

  /** Vuelve al panel de conversaciones y devuelve el foco al hilo abierto. */
  showList(): void {
    this.mobilePane.set('list');
    const id = this.activeId();
    if (!id) return;
    // Sin esto, el foco se pierde en un nodo suelto al desaparecer el hilo.
    afterNextRender(
      () => {
        document.querySelector<HTMLElement>(`[data-conversation="${CSS.escape(id)}"]`)?.focus();
      },
      { injector: this.injector },
    );
  }

  private loadMessages(): void {
    const id = this.activeId();
    if (!id) {
      // Sin conversaciones no hay hilo que cargar: sin esto el indicador
      // quedaría encendido para siempre.
      this.loading.set(false);
      return;
    }

    const external = this.externalThreads.get(id);
    if (external) {
      this.loading.set(true);
      setTimeout(() => {
        this.messages.set(
          external.map((m) =>
            m.mine ? { ...m, author: this.myName, authorInitials: this.myInitials } : m,
          ),
        );
        this.loading.set(false);
      }, 600);
      return;
    }

    this.loading.set(true);
    this.catalog
      .getMessages(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('mensajes.hilo', () => this.loadMessages()),
      )
      .subscribe((list) => {
        // Los mensajes propios llegan marcados con el sentinela "__me__";
        // se sustituyen aquí por el nombre real de la sesión (dinámico según
        // el correo usado para acceder), en vez de un nombre fijo en el mock.
        this.messages.set(
          list.map((m) =>
            m.mine ? { ...m, author: this.myName, authorInitials: this.myInitials } : m,
          ),
        );
      });
  }

  send(): void {
    const text = this.draft.trim();
    const conversationId = this.activeId();
    if (!text || this.sending() || !conversationId) return;

    this.sending.set(true);
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      author: this.myName,
      authorInitials: this.myInitials,
      text,
      time: new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }),
      mine: true,
    };

    this.catalog
      .sendMessage(message)
      .pipe(
        finalize(() => this.sending.set(false)),
        this.errors.catch('mensajes.enviar', () => this.send()),
      )
      .subscribe((sent) => {
        this.messages.update((list) => [...list, sent]);
        // Si el hilo es generado (grupo/tutor), guarda el envío para el re-render.
        const thread = this.externalThreads.get(conversationId);
        if (thread) this.externalThreads.set(conversationId, [...thread, sent]);
        this.draft = '';
      });
  }

  openCall(): void {
    const conv = this.activeConversation;
    if (!conv) return;
    this.callTarget.set({ name: conv.name, initials: conv.initials });
    this.callOpen.set(true);
  }

  closeCall(): void {
    this.callOpen.set(false);
  }
}