import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

const GOOGLE_PROFILE = {
  name: 'Camila Rojas',
  email: 'camila.rojas@gmail.com',
};

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './register.html',
})
export class RegisterPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  name = '';
  email = '';
  password = '';
  age: number | null = null;
  institution = '';
  grade = '';
  terms = false;

  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly submitted = signal(false);

  get nameInvalid(): boolean {
    return this.submitted() && this.name.trim().length < 3;
  }
  get emailInvalid(): boolean {
    return this.submitted() && !/^\S+@\S+\.\S+$/.test(this.email.trim());
  }
  get passwordInvalid(): boolean {
    return this.submitted() && this.password.length < 6;
  }
  get ageInvalid(): boolean {
    return this.submitted() && (this.age == null || this.age < 15 || this.age > 25);
  }
  get termsInvalid(): boolean {
    return this.submitted() && !this.terms;
  }

  submit(): void {
    this.submitted.set(true);
    if (
      this.nameInvalid ||
      this.emailInvalid ||
      this.passwordInvalid ||
      this.ageInvalid ||
      this.termsInvalid
    ) {
      return;
    }

    this.loading.set(true);
    this.session
      .register({
        name: this.name.trim(),
        email: this.email.trim(),
        age: this.age ?? 17,
        institution: this.institution.trim() || 'Sin especificar',
        grade: this.grade.trim() || 'Sin especificar',
      })
      .subscribe((student) => {
        this.session.setStudent(student);
        this.loading.set(false);
        this.toast.success('¡Cuenta creada! Personalicemos tu experiencia.');
        this.router.navigate(['/intereses']);
      });
  }

  /** Registro simulado con Google: rellena el formulario con la cuenta demo. */
  googleRegister(): void {
    if (this.googleLoading()) return;
    this.googleLoading.set(true);
    setTimeout(() => {
      this.googleLoading.set(false);
      this.name = GOOGLE_PROFILE.name;
      this.email = GOOGLE_PROFILE.email;
      this.password = 'google-secreto';
      this.age = 17;
      this.institution = 'Colegio San Marcos';
      this.grade = '5to Bachillerato';
      this.terms = true;
      this.toast.success(`Cuenta de Google de ${GOOGLE_PROFILE.name} seleccionada.`);
      this.submit();
    }, 1200);
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
