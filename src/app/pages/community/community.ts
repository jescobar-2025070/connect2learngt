import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { CommunityPost } from '../../core/models';
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

  draft = '';
  topic = 'General';

  constructor() {
    this.load();
  }

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
      this.toast.comingSoon('El filtro "Mis publicaciones"');
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

    setTimeout(() => {
      this.posts.update((list) => [newPost, ...list]);
      this.draft = '';
      this.posting.set(false);
      this.toast.success('Tu publicación ya es visible para la comunidad.');
    }, 1100);
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

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
