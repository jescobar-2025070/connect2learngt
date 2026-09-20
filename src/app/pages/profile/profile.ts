import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, ThemeToggleComponent],
  templateUrl: './profile.html',
})
export class ProfilePage {
  private readonly toast = inject(ToastService);
  readonly student = inject(SessionService).student;

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
