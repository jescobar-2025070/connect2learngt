import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';

@Component({
  selector: 'app-booking-confirmed',
  imports: [RouterLink, IconComponent],
  templateUrl: './booking-confirmed.html',
})
export class BookingConfirmedPage {
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly booking = this.session.nextBooking;

  /**
   * El padre no agenda para sí mismo: la sesión pertenece al hijo vinculado, y
   * tanto el titular como la frase de confirmación cambian en consecuencia.
   */
  readonly forChild = computed(() => {
    const booking = this.booking();
    return !!booking?.forChildId;
  });
  readonly headTitle = computed(() =>
    this.forChild()
      ? `¡La tutoría de ${this.booking()?.forName} está reservada!`
      : '¡Tu tutoría está reservada!',
  );
  readonly panelRoute = computed(() => (this.forChild() ? '/app/familia' : '/app/inicio'));
  readonly panelLabel = computed(() =>
    this.forChild() ? 'Volver al panel de tu hijo' : 'Ir a mi panel',
  );

  /** Simula la descarga de un archivo .ics / evento de Google Calendar. */
  readonly addingToCalendar = signal(false);
  readonly addedToCalendar = signal(false);

  addToCalendar(): void {
    if (this.addingToCalendar()) return;
    this.addingToCalendar.set(true);
    setTimeout(() => {
      this.addingToCalendar.set(false);
      this.addedToCalendar.set(true);
      this.toast.success('Sesión añadida a tu calendario.');
    }, 1100);
  }
}