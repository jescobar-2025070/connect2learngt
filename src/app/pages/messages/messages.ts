import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { ChatMessage, Conversation } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-messages',
  imports: [FormsModule, IconComponent, ThemeToggleComponent],
  templateUrl: './messages.html',
})
export class MessagesPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly conversations = signal<Conversation[]>([]);
  readonly messages = signal<ChatMessage[]>([]);
  readonly activeId = signal<string | null>(null);
  readonly loading = signal(true);
  readonly sending = signal(false);
  draft = '';

  constructor() {
    this.catalog.getConversations().subscribe((list) => {
      this.conversations.set(list);
      this.activeId.set(list[0]?.id ?? null);
      this.loadMessages();
    });
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
      this.draft = '';
      this.sending.set(false);
    });
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
