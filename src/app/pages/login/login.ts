import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, finalize } from 'rxjs';
import { ErrorCopyOverrides, UserErrorCopy } from '../../core/error-messages';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';

/** Cuenta simulada de Google de la demo. */
const GOOGLE_ACCOUNT = 'alex.rivera@gmail.com';

/**
 * En el formulario de acceso, un fallo de autenticación o de validación no es
 * "tu sesión expiró" (todavía no hay sesión): el texto tiene que hablar de
 * credenciales. Los fallos de red o de servidor sí usan el texto centralizado.
 */
const LOGIN_FAILURE: UserErrorCopy = {
  kind: 'auth',
  title: 'No pudimos iniciar sesión',
  detail: 'Revisa tu correo y tu contraseña e inténtalo de nuevo.',
  retryable: true,
};

const LOGIN_OVERRIDES: ErrorCopyOverrides = {
  auth: LOGIN_FAILURE,
  validation: { ...LOGIN_FAILURE, kind: 'validation' },
};

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent, ModalComponent],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errors = inject(ErrorService);

  email = '';
  password = '';
  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly submitted = signal(false);

  // Recuperación de contraseña
  readonly showRecovery = signal(false);
  readonly recoverySending = signal(false);
  readonly recoverySent = signal(false);
  readonly recoveryError = signal<string | null>(null);
  recoveryEmail = '';

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
    this.session
      .login(this.email.trim())
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((err: unknown) => {
          // El aviso se pinta en el propio formulario (`error`), no como toast:
          // `silent` deja la traza técnica en consola y evita el aviso duplicado.
          const copy = this.errors.report(err, 'login', { silent: true, overrides: LOGIN_OVERRIDES });
          this.error.set(copy.detail);
          return EMPTY;
        }),
      )
      .subscribe((student) => {
        this.session.setStudent(student);
        this.router.navigate(['/intereses']);
      });
  }

  /** Atajo para la demo del pitch: entra sin escribir credenciales. */
  demoLogin(): void {
    this.email = 'alex.rivera@estudiante.edu';
    this.password = 'demo1234';
    this.submit();
  }

  /** Acceso con Google simulado: elige la cuenta demo y entra. */
  googleLogin(): void {
    if (this.googleLoading()) return;
    this.googleLoading.set(true);
    setTimeout(() => {
      this.googleLoading.set(false);
      this.email = GOOGLE_ACCOUNT;
      this.password = 'google-secreto';
      this.toast.success('Cuenta de Google conectada.');
      this.submit();
    }, 1200);
  }

  openRecovery(): void {
    this.recoveryEmail = '';
    this.recoveryError.set(null);
    this.recoverySent.set(false);
    this.showRecovery.set(true);
  }

  sendRecovery(): void {
    const email = this.recoveryEmail.trim();
    if (this.recoverySending()) return;
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.recoveryError.set('Escribe un correo válido, por ejemplo ana@correo.com.');
      return;
    }
    this.recoverySending.set(true);
    setTimeout(() => {
      this.recoverySending.set(false);
      this.recoverySent.set(true);
      this.toast.success('Te enviamos un enlace para restablecer tu contraseña.');
    }, 1300);
  }

  closeRecovery(): void {
    this.showRecovery.set(false);
    this.recoverySent.set(false);
  }
}