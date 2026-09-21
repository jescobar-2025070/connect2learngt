import { Component, inject, signal } from '@angular/core';
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