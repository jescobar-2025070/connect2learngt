import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { ChatMessage, Conversation } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { VideoCallComponent } from '../../shared/video-call';

@Component({
  selector: 'app-messages',
  imports: [FormsModule, IconComponent, ThemeToggleComponent, VideoCallComponent],
  templateUrl: './messages.html',
})
export class MessagesPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly activeId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  draft = '';

  // Hilos generados al llegar por enlace (chat de grupo o de tutor).
  private externalThreads = new Map<string, ChatMessage[]>();

  // Videollamada
  readonly callOpen = signal(false);
  readonly callTarget = signal<{ name: string; initials: string } | null>(null);

  constructor() {
    this.catalog.getConversations().subscribe((list) => {
      this.conversations.set(list.map((c) => ({ ...c })));
      const params = this.route.snapshot.queryParamMap;
      const tutorId = params.get('tutor');
      const groupId = params.get('grupo');

      if (tutorId) {
        this.catalog.getTutorConversation(tutorId).subscribe(({ conversation, messages }) => {
          this.embedExternal(conversation, messages);
        });
      } else if (groupId) {
        this.catalog.getGroupConversation(groupId).subscribe(({ conversation, messages }) => {
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
    if (this.activeId() === id) return;
    this.activeId.set(id);
    this.loadMessages();
  }

  private loadMessages(): void {
    const id = this.activeId();
    if (!id) return;

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
    this.catalog.getMessages(id).subscribe((list) => {
      // Los mensajes propios llegan marcados con el sentinela "__me__";
      // se sustituyen aquí por el nombre real de la sesión (dinámico según
      // el correo usado para acceder), en vez de un nombre fijo en el mock.
      this.messages.set(
        list.map((m) =>
          m.mine ? { ...m, author: this.myName, authorInitials: this.myInitials } : m,
        ),
      );
      this.loading.set(false);
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

    this.catalog.sendMessage(message).subscribe((sent) => {
      this.messages.update((list) => [...list, sent]);
      // Si el hilo es generado (grupo/tutor), guarda el envío para el re-render.
      const thread = this.externalThreads.get(conversationId);
      if (thread) this.externalThreads.set(conversationId, [...thread, sent]);
      this.draft = '';
      this.sending.set(false);
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