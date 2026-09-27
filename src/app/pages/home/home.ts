import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import {
  AppNotification,
  CommunityPost,
  HomeSummary,
  ResourceItem,
  StudyGroup,
  Tutor,
} from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';
import { VideoCallComponent } from '../../shared/video-call';

interface CallTarget {
  name: string;
  initials: string;
}

interface SearchResults {
  tutors: Tutor[];
  resources: ResourceItem[];
  groups: StudyGroup[];
  posts: CommunityPost[];
  total: number;
}

@Component({
  selector: 'app-home',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent, ModalComponent, VideoCallComponent],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly errors = inject(ErrorService);

  readonly student = this.session.student;
  readonly summary = signal<HomeSummary | null>(null);
  readonly loading = signal(true);

  // Búsqueda global simulada
  readonly searchOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchLoading = signal(false);
  readonly searchTutors = signal<Tutor[]>([]);
  readonly searchResources = signal<ResourceItem[]>([]);
  readonly searchGroups = signal<StudyGroup[]>([]);
  readonly searchPosts = signal<CommunityPost[]>([]);

  // Centro de notificaciones
  readonly notifOpen = signal(false);
  readonly notifLoading = signal(false);
  readonly notifications = signal<AppNotification[]>([]);

  // Videollamada y materiales de la sesión
  readonly callOpen = signal(false);
  readonly callTarget = signal<CallTarget | null>(null);
  readonly materialsOpen = signal(false);
  readonly materials = signal<ResourceItem[]>([]);

  private pendingSearches = 0;

  constructor() {
    this.catalog
      .getHomeSummary()
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('inicio.resumen'),
      )
      .subscribe((data) => this.summary.set(data));
  }

  get firstName(): string {
    return this.student()?.name.split(' ')[0] ?? 'Alex';
  }

  // ---------------------------------------------------------------
  // Búsqueda global
  // ---------------------------------------------------------------
  openSearch(): void {
    this.searchQuery.set('');
    this.searchLoading.set(true);
    this.searchTutors.set([]);
    this.searchResources.set([]);
    this.searchGroups.set([]);
    this.searchPosts.set([]);
    this.pendingSearches = 4;
    this.searchOpen.set(true);

    // Las cuatro búsquedas vuelan en paralelo: `finalize` las cuenta tanto si
    // terminan como si fallan, así el spinner del modal nunca se queda colgado.
    this.catalog
      .getTutors()
      .pipe(
        finalize(() => this.countSearch()),
        this.errors.catch('inicio.busqueda.tutores'),
      )
      .subscribe((list) => this.searchTutors.set(list));
    this.catalog
      .getResources()
      .pipe(
        finalize(() => this.countSearch()),
        this.errors.catch('inicio.busqueda.recursos'),
      )
      .subscribe((list) => this.searchResources.set(list));
    this.catalog
      .getStudyGroups()
      .pipe(
        finalize(() => this.countSearch()),
        this.errors.catch('inicio.busqueda.grupos'),
      )
      .subscribe((list) => this.searchGroups.set(list));
    this.catalog
      .getPosts()
      .pipe(
        finalize(() => this.countSearch()),
        this.errors.catch('inicio.busqueda.publicaciones'),
      )
      .subscribe((list) => this.searchPosts.set(list));
  }

  private countSearch(): void {
    this.pendingSearches -= 1;
    if (this.pendingSearches <= 0) this.searchLoading.set(false);
  }

  readonly searchResults = computed<SearchResults | null>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return null;
    const tutors = this.searchTutors().filter((t) =>
      `${t.name} ${t.headline} ${t.subjects.join(' ')}`.toLowerCase().includes(q),
    );
    const resources = this.searchResources().filter((r) =>
      `${r.title} ${r.subject} ${r.description}`.toLowerCase().includes(q),
    );
    const groups = this.searchGroups().filter((g) =>
      `${g.name} ${g.subject} ${g.description}`.toLowerCase().includes(q),
    );
    const posts = this.searchPosts().filter((p) =>
      `${p.author} ${p.topic} ${p.content}`.toLowerCase().includes(q),
    );
    return { tutors, resources, groups, posts, total: tutors.length + resources.length + groups.length + posts.length };
  });

  goTutor(id: string): void {
    this.searchOpen.set(false);
    this.router.navigate(['/app/tutores', id]);
  }

  goGroup(id: string): void {
    this.searchOpen.set(false);
    this.router.navigate(['/app/grupos', id]);
  }

  goSection(path: string): void {
    this.searchOpen.set(false);
    this.router.navigate([path]);
  }

  // ---------------------------------------------------------------
  // Notificaciones
  // ---------------------------------------------------------------
  openNotifications(): void {
    this.notifLoading.set(true);
    this.notifOpen.set(true);
    this.catalog
      .getNotifications()
      .pipe(
        finalize(() => this.notifLoading.set(false)),
        this.errors.catch('inicio.notificaciones'),
      )
      .subscribe((list) => this.notifications.set(list));
  }

  get hasUnread(): boolean {
    return this.notifications().some((n) => n.unread);
  }

  markAllRead(): void {
    this.catalog
      .markNotificationsRead()
      .pipe(this.errors.catch('inicio.notificaciones.marcarLeidas'))
      .subscribe((list) => {
        this.notifications.set(list);
        this.toast.success('Todas las notificaciones marcadas como leídas.');
      });
  }

  // ---------------------------------------------------------------
  // Videollamada / materiales
  // ---------------------------------------------------------------
  openCall(booking: NonNullable<HomeSummary['nextSession']>): void {
    this.callTarget.set({ name: booking.tutorName, initials: booking.tutorInitials });
    this.callOpen.set(true);
  }

  closeCall(): void {
    this.callOpen.set(false);
  }

  openMaterials(): void {
    this.materials.set([]);
    this.materialsOpen.set(true);
    const summary = this.summary();
    if (!summary) return;
    this.catalog
      .getResources()
      .pipe(this.errors.catch('inicio.materiales'))
      .subscribe((resources) => {
        const subject = summary.recommendedResource.subject;
        const related = resources.filter((r) => r.subject === subject).slice(0, 3);
        this.materials.set(related.length ? related : resources.slice(0, 3));
      });
  }
}