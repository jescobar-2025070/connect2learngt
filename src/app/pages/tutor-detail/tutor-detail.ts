import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { Booking, Tutor, TutorSlot } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-tutor-detail',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './tutor-detail.html',
})
export class TutorDetailPage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly tutor = signal<Tutor | null>(null);
  readonly slots = signal<TutorSlot[]>([]);
  readonly loading = signal(true);
  readonly booking = signal(false);
  readonly selectedSlotId = signal<string | null>(null);

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

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.catalog.getTutor(id).subscribe((tutor) => {
      if (!tutor) {
        this.toast.show('No encontramos ese tutor.');
        this.router.navigate(['/app/tutores']);
        return;
      }
      this.tutor.set(tutor);
      this.catalog.getSlots().subscribe((slots) => {
        this.slots.set(slots);
        this.loading.set(false);
      });
    });
  }

  selectSlot(slot: TutorSlot): void {
    if (!slot.available) return;
    this.selectedSlotId.set(slot.id);
  }

  confirm(): void {
    const tutor = this.tutor();
    const slot = this.selectedSlot();
    if (!tutor || !slot || this.booking()) return;

    this.booking.set(true);
    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      tutorName: tutor.name,
      tutorInitials: tutor.initials,
      subject: tutor.subjects[0] ?? 'Tutoría',
      date: this.formatDate(slot.date),
      time: slot.time,
      modality: this.modality,
      goal: this.goal.trim() || 'Reforzar los temas del próximo examen',
    };

    this.session.confirmBooking(newBooking).subscribe(() => {
      this.booking.set(false);
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
