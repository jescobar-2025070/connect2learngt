import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { LINKED_CODE_PATTERN, SessionService, normalizeLinkedCode } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { AccessEntry, Booking, ChildAccount, SharingPreference, Tutor } from '../../core/models';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';
import { IconComponent } from '../../shared/icon';

/**
 * Panel del padre de familia: todo lo que puede ver de su hijo vinculado.
 *
 * Es una pantalla distinta a la del estudiante, no la misma con otros textos.
 * El estudiante administra a sus familiares; el padre no administra a nadie:
 * acompaña a un menor. Por eso aquí no hay invitaciones, ni revocaciones, ni
 * interruptores para decidir qué se comparte: eso lo autoriza el hijo, y lo que
 * el padre ve es exactamente lo que el hijo dejó activo, en solo lectura.
 *
 * Los datos salen de tres sitios y ninguno se inventa:
 *  - el hijo se resuelve por su código de vinculación (`getLinkedChildren`),
 *  - sus sesiones mock son de su cuenta (`getChildSessions`), y las que el padre
 *    agendó en esta sesión se leen de `SessionService.childBookings`,
 *  - lo que el hijo comparte son las preferencias de su cuenta.
 */
@Component({
  selector: 'app-child-panel',
  imports: [FormsModule, RouterLink, ThemeToggleComponent, ModalComponent, IconComponent],
  templateUrl: './child-panel.html',
})
export class ChildPanelComponent {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);
  private readonly errors = inject(ErrorService);

  readonly children = signal<ChildAccount[]>([]);
  readonly childId = signal<string | null>(null);
  readonly sessions = signal<Booking[]>([]);
  readonly tutors = signal<Tutor[]>([]);
  readonly sharing = signal<SharingPreference[]>([]);
  readonly loading = signal(true);
  readonly linking = signal(false);
  readonly unlinking = signal(false);

  // Historial de accesos: el padre consulta qué se ha visto de su hijo.
  readonly showHistory = signal(false);
  readonly historyLoading = signal(false);
  readonly history = signal<AccessEntry[]>([]);

  childCode = '';
  readonly codeError = signal<string | null>(null);

  constructor() {
    this.loadChildren();
    this.loadSharing();
  }

  /**
   * Lo que el hijo tiene activo en "Compartir con la familia" en su cuenta. Se
   * lee, no se modifica: los interruptores viven en la cuenta del hijo.
   */
  private loadSharing(): void {
    this.catalog
      .getSharingPreferences()
      .pipe(this.errors.catch('familia.compartir'))
      .subscribe((list) => this.sharing.set(list));
  }

  /** Hijo seleccionado: con un solo hijo vinculado es siempre el mismo. */
  readonly child = computed<ChildAccount | null>(() => {
    const list = this.children();
    return list.find((c) => c.id === this.childId()) ?? list[0] ?? null;
  });

  /**
   * Sesiones del hijo, de su cuenta y de las que agendó el padre en esta
   * sesión. Se ordenan por fecha solo si ambas traen el mismo formato: el mock
   * usa "jueves, 23 de abril" y el alta local "23 de abril de 2026", así que
   * se dejan en el orden de llegada en lugar de inventar una comparación.
   */
  readonly upcoming = computed<Booking[]>(() => {
    const childId = this.child()?.id;
    if (!childId) return [];
    const own = this.sessions().filter((b) => b.forChildId === childId);
    const bookedHere = this.session.childBookings().filter((b) => b.forChildId === childId);
    return [...own, ...bookedHere];
  });

  /** Quién agendó cada sesión, para que el padre distinga lo suyo de lo del hijo. */
  bookedByLabel(booking: Booking): string {
    return booking.bookedByRole === 'padre' ? 'La agendaste tú' : 'La agendó el estudiante';
  }

  private loadChildren(): void {
    this.loading.set(true);
    this.catalog
      .getLinkedChildren()
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('familia.hijos', () => this.loadChildren()),
      )
      .subscribe((list) => {
        this.children.set(list);
        const first = list[0]?.id ?? null;
        this.childId.set(first);
        if (first) this.loadChildDetail(first);
      });
  }

  private loadChildDetail(id: string): void {
    this.catalog
      .getChildSessions(id)
      .pipe(this.errors.catch('familia.sesiones', () => this.loadChildDetail(id)))
      .subscribe((list) => this.sessions.set(list));

    const child = this.children().find((c) => c.id === id);
    if (child) this.tutors.set(this.catalog.getChildTutors(child));
  }

  /**
   * Vincula un hijo con su código. El código es lo que el hijo generó, así que
   * un código equivocado no vincula a nadie: se explica el fallo en línea y el
   * panel sigue en "sin hijo vinculado".
   */
  link(): void {
    const code = this.childCode.trim();
    this.codeError.set(null);
    if (!LINKED_CODE_PATTERN.test(normalizeLinkedCode(code))) {
      this.codeError.set('El código tiene el formato C2L-XXXX-XXX.');
      return;
    }
    if (this.linking()) return;

    this.linking.set(true);
    this.catalog
      .linkChildByCode(code)
      .pipe(
        finalize(() => this.linking.set(false)),
        this.errors.catch('familia.vincular', () => this.link()),
      )
      .subscribe((child) => {
        if (!child) {
          this.codeError.set('Ese código no corresponde a ningún hijo vinculado.');
          return;
        }
        this.childCode = '';
        this.toast.success(`Ahora sigues el progreso de ${child.name}.`);
        this.loadChildren();
      });
  }

  /** Corta el vínculo: el padre deja de ver los datos del hijo. */
  askUnlink(): void {
    if (this.unlinking() || !this.child()) return;
    this.unlinking.set(true);
    this.catalog
      .unlinkChild()
      .pipe(
        finalize(() => this.unlinking.set(false)),
        this.errors.catch('familia.desvincular', () => this.askUnlink()),
      )
      .subscribe(() => {
        this.children.set([]);
        this.sessions.set([]);
        this.tutors.set([]);
        this.childId.set(null);
        this.toast.show('Desvinculaste a tu hijo. Ya no ves sus datos.');
      });
  }

  openHistory(): void {
    this.historyLoading.set(true);
    this.showHistory.set(true);
    this.catalog
      .getAccessHistory()
      .pipe(
        finalize(() => this.historyLoading.set(false)),
        this.errors.catch('familia.historial'),
      )
      .subscribe((list) => this.history.set(list));
  }
}
