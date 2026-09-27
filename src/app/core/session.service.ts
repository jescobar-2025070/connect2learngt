import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DEMO_PARENT, DEMO_STUDENT, DEMO_TUTOR } from './mock-data';
import { Booking, UserProfile, UserRole, roleOption } from './models';

const STORAGE_KEY = 'c2l-session';

interface PersistedSession {
  student: UserProfile;
  bookings: Booking[];
}

/** Perfil demo que corresponde a cada rol, usado como base del registro. */
function demoBase(role: UserRole): UserProfile {
  if (role === 'tutor') return DEMO_TUTOR;
  if (role === 'padre') return DEMO_PARENT;
  return DEMO_STUDENT;
}

/**
 * Estado de sesión del prototipo. No hay autenticación real: se valida el
 * formato del formulario y se devuelve el estudiante demo tras un retardo
 * simulado, para que el login muestre su spinner como en producción.
 *
 * Se persiste en sessionStorage (no localStorage: se limpia al cerrar la
 * pestaña, como una sesión real) para que un refresh o un enlace directo a
 * /app/* no cierre la sesión — antes cualquier F5 volvía a /login porque
 * el estado solo vivía en memoria.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _student = signal<UserProfile | null>(null);
  private readonly _bookings = signal<Booking[]>([]);

  readonly student = this._student.asReadonly();
  readonly bookings = this._bookings.asReadonly();
  readonly isLoggedIn = computed(() => this._student() !== null);
  readonly hasInterests = computed(() => (this._student()?.interests.length ?? 0) > 0);
  readonly nextBooking = computed<Booking | null>(() => this._bookings()[0] ?? null);

  /** Rol de la sesión activa; `estudiante` si aún no hay sesión o es antigua. */
  readonly role = computed<UserRole>(() => this._student()?.role ?? 'estudiante');
  readonly isStudent = computed(() => this.role() === 'estudiante');
  readonly isTutor = computed(() => this.role() === 'tutor');
  readonly isParent = computed(() => this.role() === 'padre');

  /** Pantalla de inicio según el rol. */
  readonly startRoute = computed(() => roleOption(this.role()).startRoute);

  /**
   * El padre se vincula a su hijo con un código, así que no pasa por el
   * onboarding de intereses: puede entrar directo a su panel.
   */
  readonly needsOnboarding = computed(() => roleOption(this.role()).onboarding !== 'vinculacion');

  constructor() {
    this.restore();
  }

  /** Login simulado (1–1.5 s de "red"). El rol se deduce del correo demo. */
  login(email: string): Observable<UserProfile> {
    const name = this.nameFromEmail(email);
    const role = this.roleFromEmail(email);
    const student: UserProfile = {
      ...demoBase(role),
      email,
      name,
      initials: this.initialsOf(name),
      interests: [],
    };
    return of(student).pipe(delay(1200));
  }

  /** Registro simulado: reutiliza los datos del formulario y el rol elegido. */
  register(data: Partial<UserProfile>): Observable<UserProfile> {
    const role = data.role ?? 'estudiante';
    const base = demoBase(role);
    const name = data.name?.trim() || base.name;
    const student: UserProfile = {
      ...base,
      ...data,
      role,
      name,
      initials: this.initialsOf(name),
      interests: [],
    };
    return of(student).pipe(delay(1400));
  }

  setStudent(student: UserProfile): void {
    this._student.set(student);
    this.persist();
  }

  /** Guarda los intereses del onboarding (paso 2 del camino feliz). */
  saveInterests(interests: string[]): Observable<string[]> {
    return new Observable<string[]>((subscriber) => {
      const timer = setTimeout(() => {
        this._student.update((s) => (s ? { ...s, interests } : s));
        this.persist();
        subscriber.next(interests);
        subscriber.complete();
      }, 1100);
      return () => clearTimeout(timer);
    });
  }

  /** Edita los datos personales del perfil (nombre, edad, institución, grado). */
  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return new Observable<UserProfile>((subscriber) => {
      const timer = setTimeout(() => {
        this._student.update((s) => {
          if (!s) return s;
          const next = { ...s, ...data };
          if (data.name) next.initials = this.initialsOf(data.name);
          return next;
        });
        this.persist();
        const updated = this._student();
        if (updated) subscriber.next(updated);
        subscriber.complete();
      }, 1100);
      return () => clearTimeout(timer);
    });
  }

  /** Confirma una reserva de tutoría y la deja disponible en el panel. */
  confirmBooking(booking: Booking): Observable<Booking> {
    return new Observable<Booking>((subscriber) => {
      const timer = setTimeout(() => {
        this._bookings.update((list) => [booking, ...list]);
        this.persist();
        subscriber.next(booking);
        subscriber.complete();
      }, 1400);
      return () => clearTimeout(timer);
    });
  }

  logout(): void {
    this._student.set(null);
    this._bookings.set([]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* almacenamiento no disponible */
    }
  }

  private persist(): void {
    const student = this._student();
    if (!student) return;
    try {
      const payload: PersistedSession = { student, bookings: this._bookings() };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* almacenamiento no disponible: la sesión solo vive en memoria */
    }
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as PersistedSession;
      if (data?.student) {
        // Sesiones guardadas antes del soporte de roles: se asume estudiante.
        const student: UserProfile = { ...data.student, role: data.student.role ?? 'estudiante' };
        this._student.set(student);
        this._bookings.set(data.bookings ?? []);
      }
    } catch {
      /* dato corrupto o almacenamiento no disponible: se ignora */
    }
  }

  /** Detecta el rol por el dominio del correo demo (@docente / @familia). */
  private roleFromEmail(email: string): UserRole {
    const domain = email.split('@')[1]?.toLowerCase() ?? '';
    if (domain.includes('docente') || domain.includes('tutor')) return 'tutor';
    if (domain.includes('familia') || domain.includes('padre')) return 'padre';
    return 'estudiante';
  }

  private nameFromEmail(email: string): string {
    const local = email.split('@')[0] ?? 'Alex Rivera';
    const parts = local.split(/[._-]+/).filter(Boolean);
    if (!parts.length) return DEMO_STUDENT.name;
    return parts
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(' ');
  }

  private initialsOf(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join('');
  }
}
