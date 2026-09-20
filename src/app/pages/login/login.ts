import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted = signal(false);

  get emailInvalid(): boolean {
    return this.submitted() && !/^\S+@\S+\.\S+$/.test(this.email.trim());
  }

  get passwordInvalid(): boolean {
    return this.submitted() && this.password.length < 6;
  }

  submit(): void {
    this.submitted.set(true);
    this.error.set(null);
    if (this.emailInvalid || this.passwordInvalid) return;

    this.loading.set(true);
    this.session.login(this.email.trim()).subscribe({
      next: (student) => {
        this.session.setStudent(student);
        this.loading.set(false);
        this.router.navigate(['/intereses']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No pudimos iniciar sesión. Inténtalo de nuevo.');
      },
    });
  }

  /** Atajo para la demo del pitch: entra sin escribir credenciales. */
  demoLogin(): void {
    this.email = 'alex.rivera@estudiante.edu';
    this.password = 'demo1234';
    this.submit();
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
