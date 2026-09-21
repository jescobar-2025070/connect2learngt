import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { CommunityPost, CommunityReply } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

const TOPICS = ['General', 'Matemáticas', 'Ciencias', 'Inglés', 'Literatura', 'Programación'];

@Component({
  selector: 'app-community',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './community.html',
})
export class CommunityPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly student = this.session.student;
  readonly posts = signal<CommunityPost[]>([]);
  readonly loading = signal(true);
  readonly posting = signal(false);
  readonly filter = signal<'recent' | 'mine'>('recent');
  readonly topics = TOPICS;
  readonly trending = this.catalog.getTrendingTopics();
  readonly likedIds = signal<Set<string>>(new Set());

  readonly repliesByPost = signal<Record<string, CommunityReply[]>>({});
  readonly openReplies = signal<Set<string>>(new Set());
  readonly loadingReplies = signal<string | null>(null);
  readonly replyingPostId = signal<string | null>(null);
  readonly replyDrafts: Record<string, string> = {};

  draft = '';
  topic = 'General';

  constructor() {
    this.load();
  }

  /** Lista visible según el filtro activo ("Recientes" o "Mis publicaciones"). */
  readonly visiblePosts = computed(() => {
    if (this.filter() === 'mine') {
      const me = this.student()?.name;
      return this.posts().filter((p) => p.author === me);
    }
    return this.posts();
  });

  load(): void {
    this.loading.set(true);
    this.catalog.getPosts().subscribe((posts) => {
      this.posts.set(posts);
      this.loading.set(false);
    });
  }

  setFilter(value: 'recent' | 'mine'): void {
    this.filter.set(value);
    if (value === 'mine') {
      const mine = this.posts().filter((p) => p.author === this.student()?.name);
      if (mine.length === 0) {
        this.toast.show('Aún no tienes publicaciones: escribe la primera arriba.');
      }
    }
  }

  publish(): void {
    const text = this.draft.trim();
    if (!text || this.posting()) return;

    this.posting.set(true);
    const student = this.student();
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: student?.name ?? 'Tú',
      initials: student?.initials ?? 'TU',
      role: 'Estudiante',
      topic: this.topic,
      timeAgo: 'justo ahora',
      content: text,
      likes: 0,
      replies: 0,
    };

    this.catalog.addPost(newPost).subscribe(() => {
      this.posts.update((list) => [newPost, ...list]);
      this.draft = '';
      this.posting.set(false);
      this.toast.success('Tu publicación ya es visible para la comunidad.');
    });
  }

  toggleLike(post: CommunityPost): void {
    const liked = new Set(this.likedIds());
    const isLiked = liked.has(post.id);
    isLiked ? liked.delete(post.id) : liked.add(post.id);
    this.likedIds.set(liked);
    this.posts.update((list) =>
      list.map((p) => (p.id === post.id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p)),
    );
  }

  isLiked(post: CommunityPost): boolean {
    return this.likedIds().has(post.id);
  }

  isOpen(post: CommunityPost): boolean {
    return this.openReplies().has(post.id);
  }

  repliesOf(post: CommunityPost): CommunityReply[] {
    return this.repliesByPost()[post.id] ?? [];
  }

  toggleReplies(post: CommunityPost): void {
    const open = new Set(this.openReplies());
    if (open.has(post.id)) {
      open.delete(post.id);
      this.openReplies.set(open);
      return;
    }
    open.add(post.id);
    this.openReplies.set(open);
    this.loadingReplies.set(post.id);
    this.catalog.getPostReplies(post.id).subscribe((list) => {
      this.repliesByPost.update((map) => ({ ...map, [post.id]: list }));
      this.loadingReplies.set(null);
    });
  }

  sendReply(post: CommunityPost): void {
    const text = (this.replyDrafts[post.id] ?? '').trim();
    if (!text || this.replyingPostId() === post.id) return;

    this.replyingPostId.set(post.id);
    const student = this.student();
    this.catalog
      .addReply(post.id, {
        author: student?.name ?? 'Tú',
        initials: student?.initials ?? 'TU',
        text,
      })
      .subscribe((reply) => {
        this.repliesByPost.update((map) => ({ ...map, [post.id]: [...(map[post.id] ?? []), reply] }));
        this.replyDrafts[post.id] = '';
        this.posts.update((list) =>
          list.map((p) => (p.id === post.id ? { ...p, replies: p.replies + 1 } : p)),
        );
        this.replyingPostId.set(null);
        this.toast.success('Tu respuesta se publicó en el hilo.');
      });
  }
}