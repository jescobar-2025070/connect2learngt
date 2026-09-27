import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, tap } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { Booking, ChildAccount, Tutor, TutorReview, TutorSlot } from '../../core/models';
import { capabilitiesOf } from '../../core/permissions';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';

@Component({
  selector: 'app-tutor-detail',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent, ModalComponent],
  templateUrl: './tutor-detail.html',
})
export class TutorDetailPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errors = inject(ErrorService);

  readonly tutor = signal<Tutor | null>(null);
  readonly slots = signal<TutorSlot[]>([]);
  readonly loading = signal(true);
  readonly booking = signal(false);
  readonly selectedSlotId = signal<string | null>(null);

  /**
   * Quién agenda. El padre no puede reservarse una tutoría a sí mismo: entra
   * aquí para agendarle a su hijo, y la reserva sale a nombre del menor.
   */
  readonly caps = capabilitiesOf(this.session.role());
  readonly children = signal<ChildAccount[]>([]);
  readonly childId = signal<string | null>(null);

  /** Hijo al que se le agenda; `null` si quien agenda es el dueño de la cuenta. */
  readonly bookingFor = computed<ChildAccount | null>(() => {
    if (!this.caps.bookForChild) return null;
    return this.children().find((c) => c.id === this.childId()) ?? null;
  });

  /** Se puede confirmar solo si hay beneficiario válido: el padre, su hijo. */
  readonly canConfirm = computed(
    () => this.caps.bookForSelf || this.bookingFor() !== null,
  );

  // Reseñas completas
  readonly showReviews = signal(false);
  readonly reviewsLoading = signal(false);
  readonly reviewsFailed = signal(false);
  readonly reviews = signal<TutorReview[]>([]);
  private reviewsId = '';

  goal = '';
  modality = 'Videollamada';

  readonly selectedSlot = computed(
    () => this.slots().find((s) => s.id === this.selectedSlotId()) ?? null,
  );

  /** Agrupa los horarios por día para pintar el calendario. */
  readonly slotsByDay = computed(() => {
    const groups = new Map<string, { label: string; number: string; slots: TutorSlot[] }>();
    for (const slot of this.slots()) {
      const group = groups.get(slot.date) ?? {
        label: slot.dayLabel,
        number: slot.dayNumber,
        slots: [],
      };
      group.slots.push(slot);
      groups.set(slot.date, group);
    }
    return [...groups.entries()].map(([date, g]) => ({ date, ...g }));
  });

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    this.load();
    if (this.caps.bookForChild) this.loadChildren();
  }

  /**
   * Hijos vinculados, para agendarles una sesión. Si el padre no tiene ninguno
   * vinculado, la reserva queda deshabilitada: no se puede agendar "para ti"
   * solo porque el rol lo permita en abstracto.
   */
  private loadChildren(): void {
    this.catalog
      .getLinkedChildren()
      .pipe(this.errors.catch('tutor.hijos', () => this.loadChildren()))
      .subscribe((list) => {
        this.children.set(list);
        this.childId.set(list[0]?.id ?? null);
      });
  }

  /**
   * Carga el perfil y sus horarios. Se separa del constructor para poder
   * reutilizarla como acción de reintento cuando la llamada falla.
   */
  private load(): void {
    this.loading.set(true);
    this.catalog
      .getTutor(this.id)
      .pipe(
        // `finalize` apaga el indicador aunque la llamada falle: si no, la
        // pantalla se quedaría con el esqueleto de carga para siempre.
        finalize(() => this.loading.set(false)),
        this.errors.catch('tutor.perfil'),
      )
      .subscribe((tutor) => {
        // El id existe en la URL pero no en el catálogo: no es un fallo, es un
        // enlace roto, así que se avisa y se vuelve al listado.
        if (!tutor) {
          this.toast.show('No encontramos ese tutor.');
          this.router.navigate(['/app/tutores']);
          return;
        }
        this.tutor.set(tutor);
        this.loadSlots();
      });
  }

  /** Reintenta la carga del perfil desde el estado de error. */
  retry(): void {
    if (this.loading()) return;
    this.load();
  }

  private loadSlots(): void {
    this.catalog
      .getSlots()
      .pipe(this.errors.catch('tutor.horarios', () => this.loadSlots()))
      .subscribe((slots) => this.slots.set(slots));
  }

  selectSlot(slot: TutorSlot): void {
    if (!slot.available) return;
    this.selectedSlotId.set(slot.id);
  }

  /** Abre el chat con el tutor (simulado con un hilo por defecto). */
  chatWithTutor(id: string): void {
    this.router.navigate(['/app/mensajes'], { queryParams: { tutor: id } });
  }

  openReviews(id: string): void {
    this.reviewsId = id;
    this.reviewsFailed.set(false);
    this.reviewsLoading.set(true);
    this.showReviews.set(true);
    this.catalog
      .getTutorReviews(id)
      .pipe(
        finalize(() => this.reviewsLoading.set(false)),
        tap({ error: () => this.reviewsFailed.set(true) }),
        this.errors.catch('tutor.reseñas', () => this.retryReviews()),
      )
      .subscribe((list) => this.reviews.set(list));
  }

  /** Reintenta el modal de reseñas tras un fallo de carga. */
  retryReviews(): void {
    if (this.reviewsLoading()) return;
    this.openReviews(this.reviewsId);
  }

  /** Iniciales del autor de una reseña (no viajan en el mock). */
  initialsOf(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }

  confirm(): void {
    const tutor = this.tutor();
    const slot = this.selectedSlot();
    if (!tutor || !slot || this.booking()) return;
    // El padre solo puede agendar para un hijo vinculado: nunca para sí mismo.
    if (!this.canConfirm()) {
      this.toast.show('Vincula a un hijo para poder agendar una tutoría.');
      return;
    }

    this.booking.set(true);
    const child = this.bookingFor();
    const account = this.session.student();
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      tutorName: tutor.name,
      tutorInitials: tutor.initials,
      subject: tutor.subjects[0] ?? 'Tutoría',
      date: this.formatDate(slot.date),
      time: slot.time,
      modality: this.modality,
      goal: this.goal.trim() || 'Reforzar los temas del próximo examen',
      forName: child?.name ?? account?.name ?? 'Estudiante',
      forChildId: child?.id,
      bookedByRole: this.session.role(),
    };

    this.session
      .confirmBooking(newBooking)
      .pipe(
        finalize(() => this.booking.set(false)),
        this.errors.catch('tutor.reservar', () => this.confirm()),
      )
      .subscribe(() => {
        this.router.navigate(['/app/reserva-confirmada']);
      });
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }

  private formatDate(iso: string): string {
    const date = new Date(`${iso}T00:00:00`);
    const formatted = date.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }
}
