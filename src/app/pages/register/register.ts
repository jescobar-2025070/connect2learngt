import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ROLE_OPTIONS, RoleOption, UserRole, roleOption } from '../../core/models';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

const GOOGLE_PROFILE: Record<UserRole, { name: string; email: string; age: number }> = {
  estudiante: {
    name: 'Camila Rojas',
    email: 'camila.rojas@gmail.com',
    age: 17,
  },
  tutor: { name: 'Miguel Torres', email: 'miguel.torres@gmail.com', age: 34 },
  padre: { name: 'Patricia Vega', email: 'patricia.vega@gmail.com', age: 44 },
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

  readonly roles = ROLE_OPTIONS;
  /** Signal (no campo simple): los computed de abajo dependen de él. */
  readonly role = signal<UserRole>('estudiante');

  name = '';
  email = '';
  password = '';
  age: number | null = null;
  institution = '';
  grade = '';
  childCode = '';
  terms = false;

  readonly loading = signal(false);
  readonly googleLoading = signal(false);
  readonly submitted = signal(false);

  readonly roleInfo = computed<RoleOption>(() => roleOption(this.role()));
  readonly isParent = computed(() => this.role() === 'padre');
  readonly isTutor = computed(() => this.role() === 'tutor');
  /** El docente informa la materia que más imparte en lugar del grado. */
  readonly gradeLabel = computed(() => (this.isTutor() ? 'Materia principal' : 'Grado / curso'));
  readonly gradePlaceholder = computed(() =>
    this.isTutor() ? 'Ej. Matemáticas' : 'Ej. 5to Bachillerato',
  );
  readonly title = computed(() => {
    if (this.isParent()) return 'Crea tu cuenta de familia';
    if (this.isTutor()) return 'Crea tu cuenta de docente';
    return 'Crea tu cuenta de estudiante';
  });
  readonly subtitle = computed(() => {
    if (this.isParent()) return 'Vincúla a tu hijo y acompaña su progreso desde aquí.';
    if (this.isTutor())
      return 'Publica tu disponibilidad, gestiona tu agenda y desarrolla tu reputación.';
    return 'Participa, publica y aprende con tu comunidad.';
  });

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
    if (!this.submitted()) return false;
    const { ageMin, ageMax } = this.roleInfo();
    return this.age == null || this.age < ageMin || this.age > ageMax;
  }
  get ageHint(): string {
    const { ageMin, ageMax } = this.roleInfo();
    return this.isParent()
      ? 'Tu edad nos ayuda a proteger la cuenta de tu hijo.'
      : `La edad mínima para este rol es de ${ageMin} años.`;
  }
  get childCodeInvalid(): boolean {
    return this.submitted() && this.isParent() && !/^[A-Za-z0-9-]{6,}$/.test(this.childCode.trim());
  }
  get termsInvalid(): boolean {
    return this.submitted() && !this.terms;
  }

  selectRole(role: UserRole): void {
    if (this.role() === role) return;
    this.role.set(role);
    // El rango de edad y los textos cambian por rol: se limpian los errores.
    this.submitted.set(false);
  }

  submit(): void {
    this.submitted.set(true);
    if (
      this.nameInvalid ||
      this.emailInvalid ||
      this.passwordInvalid ||
      this.ageInvalid ||
      this.childCodeInvalid ||
      this.termsInvalid
    ) {
      return;
    }

    this.loading.set(true);
    const { ageMin } = this.roleInfo();
    this.session
      .register({
        role: this.role(),
        name: this.name.trim(),
        email: this.email.trim(),
        age: this.age ?? ageMin,
        institution: this.institution.trim() || 'Sin especificar',
        grade: this.grade.trim() || this.defaultGrade(),
        childCode: this.isParent() ? this.childCode.trim().toUpperCase() : undefined,
      })
      .subscribe((profile) => {
        this.session.setStudent(profile);
        this.loading.set(false);
        this.toast.success(`¡Cuenta creada como ${roleOption(this.role()).label.toLowerCase()}!`);
        // El padre no tiene onboarding: entra directo a su panel.
        const target = this.session.needsOnboarding() ? '/intereses' : this.session.startRoute();
        this.router.navigate([target]);
      });
  }

  /** Valor por defecto del campo "grado / materia" según el rol. */
  private defaultGrade(): string {
    if (this.isTutor()) return 'Materia por definir';
    if (this.isParent()) return 'Padre de familia';
    return 'Sin especificar';
  }

  /** Registro simulado con Google: rellena el formulario con la cuenta demo del rol. */
  googleRegister(): void {
    if (this.googleLoading()) return;
    this.googleLoading.set(true);
    const profile = GOOGLE_PROFILE[this.role()];
    setTimeout(() => {
      this.googleLoading.set(false);
      this.name = profile.name;
      this.email = profile.email;
      this.password = 'google-secreto';
      this.age = profile.age;
      this.institution = 'Colegio San Marcos';
      this.grade = this.isTutor() ? 'Matemáticas' : '5to Bachillerato';
      this.childCode = this.isParent() ? 'C2L-4F7K-2Q' : '';
      this.terms = true;
      this.toast.success(`Cuenta de Google de ${profile.name} seleccionada.`);
      this.submit();
    }, 1200);
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
