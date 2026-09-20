import { Component, inject } from '@angular/core';
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

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
