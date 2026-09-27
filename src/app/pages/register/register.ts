import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import {
  LINKED_CODE_PATTERN,
  SessionService,
  generateLinkedCode,
  normalizeLinkedCode,
} from '../../core/session.service';
import { ROLE_OPTIONS, RoleOption, UserRole, roleOption } from '../../core/models';
import { ErrorService } from '../../core/error.service';
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
  private readonly errors = inject(ErrorService);

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
  /**
   * `min` del input de edad. Con `ageMin: null` (docente) el atributo se
   * omite: escribir 0 en el DOM haría el campo inválido para el navegador.
   */
  readonly ageMinAttr = computed<number | null>(() => this.roleInfo().ageMin);
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
    if (this.age == null) return true;
    const { ageMin, ageMax } = this.roleInfo();
    if (ageMin != null && this.age < ageMin) return true;
    return this.age > ageMax;
  }
  get ageHint(): string {
    const { ageMin, ageMax } = this.roleInfo();
    if (this.isParent()) return 'Tu edad nos ayuda a proteger la cuenta de tu hijo.';
    if (ageMin == null) return `Docentes de cualquier edad, hasta los ${ageMax} años.`;
    return `La edad mínima para este rol es de ${ageMin} años.`;
  }
  get childCodeInvalid(): boolean {
    return this.submitted() && this.isParent() && !LINKED_CODE_PATTERN.test(normalizeLinkedCode(this.childCode));
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
    const fallbackAge = this.roleInfo().ageMin ?? 18;
    this.session
      .register({
        role: this.role(),
        name: this.name.trim(),
        email: this.email.trim(),
        age: this.age ?? fallbackAge,
        // El padre solo aporta sus datos y el código: institution y grade
        // describen al hijo, no a él, así que no se preguntan.
        institution: this.isParent() ? '' : this.institution.trim() || 'Sin especificar',
        grade: this.isParent() ? '' : this.grade.trim() || this.defaultGrade(),
        childCode: this.isParent() ? normalizeLinkedCode(this.childCode) : undefined,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('registro.crearCuenta', () => this.submit()),
      )
      .subscribe((profile) => {
        this.session.setStudent(profile);
        this.toast.success(`¡Cuenta creada como ${roleOption(this.role()).label.toLowerCase()}!`);
        // El padre no tiene onboarding: entra directo a su panel.
        const target = this.session.needsOnboarding() ? '/intereses' : this.session.startRoute();
        this.router.navigate([target]);
      });
  }

  /** Valor por defecto del campo "grado / materia" según el rol. */
  private defaultGrade(): string {
    if (this.isTutor()) return 'Materia por definir';
    return 'Sin especificar';
  }

  /**
   * Registro simulado con Google: rellena el formulario con la cuenta demo del
   * rol y continúa el alta.
   *
   * Para el padre se emite un código de vinculación nuevo, no uno fijo: así el
   * alta con Google no ata a la demo al único hijo de los datos de ejemplo, y
   * sirve para enseñar de un vistazo que un padre entra con su hijo ya
   * vinculado.
   */
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
      // El padre no tiene institución ni grado en el formulario.
      this.institution = this.isParent() ? '' : 'Colegio San Marcos';
      this.grade = this.isParent() ? '' : this.isTutor() ? 'Matemáticas' : '5to Bachillerato';
      this.childCode = this.isParent() ? generateLinkedCode() : '';
      this.terms = true;
      this.toast.success(`Cuenta de Google de ${profile.name} seleccionada.`);
      this.submit();
    }, 1200);
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
