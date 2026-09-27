import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { DEMO_PARENT, DEMO_STUDENT, DEMO_TUTOR } from './mock-data';
import { Booking, UserProfile, UserRole, roleOption } from './models';

const STORAGE_KEY = 'c2l-session';

/**
 * Formato del código de vinculación: `C2L-XXXX-XXX`, con cuatro y tres
 * caracteres alfanuméricos. Vive aquí porque es la sesión la que lo emite
 * (registro y restauración) y la que lo consume el panel del padre: una sola
 * definición evita que el registro acepte un formato que el panel rechaza.
 */
export const LINKED_CODE_PATTERN = /^C2L-[A-Z0-9]{4}-[A-Z0-9]{3}$/;

/** Emite un código de vinculación nuevo para una cuenta de estudiante. */
export function generateLinkedCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = (n: number): string =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  return `C2L-${block(4)}-${block(3)}`;
}

/** Normaliza lo que escribe un padre: mayúsculas y sin espacios sobrantes. */
export function normalizeLinkedCode(code: string): string {
  return code.trim().toUpperCase();
}

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

  /**
   * Código de vinculación de la cuenta activa. Solo el estudiante lo tiene: es
   * el código que comparte con su familia para que un padre pueda supervisarlo.
   * Para el padre la vía de entrada son `linkedChildCodes`.
   */
  readonly childCode = computed<string | null>(() => {
    const code = this._student()?.childCode;
    return code ? normalizeLinkedCode(code) : null;
  });

  /**
   * Códigos de los hijos que administra la cuenta de familia activa. Puede
   * haber más de uno: el padre vincula el primero al registrarse y despues
   * añade los demás desde su panel, y todos coexisten.
   */
  readonly linkedChildCodes = computed<string[]>(() => this._student()?.linkedChildCodes ?? []);

  /** Sesiones que el padre agendó para un hijo, no para sí mismo. */
  readonly childBookings = computed(() => this._bookings().filter((b) => !!b.forChildId));

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

  /**
   * Registro simulado: reutiliza los datos del formulario y el rol elegido.
   *
   * El estudiante recibe un código de vinculación recién generado (es lo que
   * comparte con su familia), aunque el perfil base de la demo traiga el suyo.
   * El padre hace lo contrario: no tiene código propio, escribe el de su hijo.
   * El tutor no participa de esta vinculación.
   */
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
    if (role === 'estudiante') {
      student.childCode = generateLinkedCode();
      delete student.linkedChildCodes;
    } else if (role === 'padre' && data.childCode) {
      // El padre entra con el código de su primer hijo ya vinculado; los demás
      // los añade después desde el panel.
      student.linkedChildCodes = [normalizeLinkedCode(data.childCode)];
      delete student.childCode;
    } else {
      delete student.childCode;
      delete student.linkedChildCodes;
    }
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

  /**
   * Añade un hijo a la cuenta de familia. Es idempotente: vincular dos veces el
   * mismo código no duplica nada.
   *
   * El vínculo vive en el perfil del padre porque es su cuenta la que lo
   * autoriza. Para quitarlo está `removeChildCode`, que opera sobre el hijo
   * concreto: cuando ya no queda ninguno, el panel vuelve al estado "sin hijo
   * vinculado" en vez de quedarse en blanco.
   */
  addChildCode(code: string): void {
    const normalized = normalizeLinkedCode(code);
    this.updateLinkedCodes((codes) =>
      codes.includes(normalized) ? codes : [...codes, normalized],
    );
  }

  removeChildCode(code: string): void {
    const normalized = normalizeLinkedCode(code);
    this.updateLinkedCodes((codes) => codes.filter((c) => c !== normalized));
  }

  private updateLinkedCodes(change: (codes: string[]) => string[]): void {
    this._student.update((s) => {
      if (!s) return s;
      const next: string[] = change(s.linkedChildCodes ?? []);
      const updated = { ...s };
      if (next.length) updated.linkedChildCodes = next;
      else delete updated.linkedChildCodes;
      return updated;
    });
    this.persist();
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
        // Una cuenta de estudiante creada antes de que existiera el código se
        // queda sin él, y su perfil no tendría nada que mostrar. Se le emite
        // uno al vuelo: es la misma cuenta con su código definitivo.
        if (student.role === 'estudiante' && !student.childCode) {
          student.childCode = generateLinkedCode();
        }
        // El padre antes guardaba un único `childCode`. Ese vínculo no se
        // pierde: se traslada a la lista, y a partir de ahí conviven varios.
        if (student.role === 'padre' && student.childCode) {
          const previous = normalizeLinkedCode(student.childCode);
          student.linkedChildCodes = [previous, ...(student.linkedChildCodes ?? [])].filter(
            (code, i, all) => all.indexOf(code) === i,
          );
          delete student.childCode;
        }
        this._student.set(student);
        this._bookings.set((data.bookings ?? []).map((b) => this.normalizeBooking(b)));
      }
    } catch {
      /* dato corrupto o almacenamiento no disponible: se ignora */
    }
  }

  /**
   * Las reservas guardadas antes de que existiera el hijo no traen `forName` ni
   * `bookedByRole`. Se completan como sesiones propias de quien las agendó: es
   * lo único que se puede afirmar sin inventar datos, y evita que una sesión
   * vieja rompa la pantalla de confirmación al leer `forName`.
   */
  private normalizeBooking(booking: Booking): Booking {
    const name = this._student()?.name ?? 'Estudiante';
    return {
      ...booking,
      forName: booking.forName ?? name,
      bookedByRole: booking.bookedByRole ?? 'estudiante',
    };
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
