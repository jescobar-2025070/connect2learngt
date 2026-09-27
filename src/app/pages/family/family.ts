import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { AccessEntry, Guardian, SharingPreference } from '../../core/models';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';
import { IconComponent } from '../../shared/icon';

@Component({
  selector: 'app-family',
  imports: [FormsModule, ThemeToggleComponent, ModalComponent, IconComponent],
  templateUrl: './family.html',
})
export class FamilyPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly session = inject(SessionService);
  private readonly errors = inject(ErrorService);

  /**
   * La pantalla cambia de sentido según el rol: el estudiante vincula a sus
   * tutores legales, el padre ve a los hijos que ya están vinculados a su cuenta.
   */
  readonly isParent = this.session.isParent;

  readonly pageTitle = computed(() =>
    this.isParent() ? 'Mis hijos' : 'Supervisión familiar',
  );
  readonly pageSubtitle = computed(() =>
    this.isParent()
      ? 'Acompaña el progreso de los menores vinculados a tu cuenta.'
      : 'Controla qué comparte tu cuenta con tus padres o tutores.',
  );
  readonly listTitle = computed(() =>
    this.isParent() ? 'Hijos vinculados' : 'Familiares vinculados',
  );
  readonly listHint = computed(() =>
    this.isParent()
      ? 'Cada hijo autoriza por separado qué información puedes ver desde aquí.'
      : 'Las personas vinculadas pueden ver la información que actives en "Qué compartimos", a la derecha.',
  );
  readonly emptyHint = computed(() =>
    this.isParent()
      ? 'Aún no tienes hijos vinculados. Pide a tu hijo su código de vinculación e ingrésalo abajo.'
      : 'Aún no tienes familiares vinculados. Invita a tu padre, madre o tutor abajo.',
  );

  readonly guardians = signal<Guardian[]>([]);

  readonly preferences = signal<SharingPreference[]>([]);
  readonly loading = signal(true);
  readonly revokingId = signal<string | null>(null);
  readonly confirmingRevokeId = signal<string | null>(null);
  readonly savingPrefId = signal<string | null>(null);

  // Historial de accesos
  readonly showHistory = signal(false);
  readonly historyLoading = signal(false);
  readonly history = signal<AccessEntry[]>([]);

  inviteEmail = '';
  readonly inviting = signal(false);
  readonly inviteError = signal<string | null>(null);

  constructor() {
    let guardiansReady = false;
    let prefsReady = false;
    const checkDone = () => {
      if (guardiansReady && prefsReady) this.loading.set(false);
    };

    // Las dos listas se marcan como recibidas en `finalize` (no en `next`) para
    // que el indicador se apague también cuando una de ellas falla.
    this.catalog
      .getGuardians()
      .pipe(
        finalize(() => {
          guardiansReady = true;
          checkDone();
        }),
        this.errors.catch('familia.familiares'),
      )
      .subscribe((list) => this.guardians.set(list));
    this.catalog
      .getSharingPreferences()
      .pipe(
        finalize(() => {
          prefsReady = true;
          checkDone();
        }),
        this.errors.catch('familia.permisos'),
      )
      .subscribe((list) => this.preferences.set(list));
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

  invite(): void {
    const email = this.inviteEmail.trim();
    this.inviteError.set(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      this.inviteError.set('Escribe un correo válido.');
      return;
    }
    if (this.guardians().some((g) => g.email.toLowerCase() === email.toLowerCase())) {
      this.inviteError.set('Ese familiar ya está vinculado a tu cuenta.');
      return;
    }

    this.inviting.set(true);
    this.catalog
      .inviteGuardian(email)
      .pipe(
        finalize(() => this.inviting.set(false)),
        this.errors.catch('familia.invitar', () => this.invite()),
      )
      .subscribe((guardian) => {
        this.guardians.update((list) => [...list, guardian]);
        this.inviteEmail = '';
        this.toast.success(`Invitación enviada a ${guardian.email}.`);
      });
  }

  /** Revocar el acceso de un familiar es una acción sensible: pide confirmación inline. */
  askRevoke(id: string): void {
    this.confirmingRevokeId.set(id);
  }

  cancelRevoke(): void {
    this.confirmingRevokeId.set(null);
  }

  confirmRevoke(guardian: Guardian): void {
    this.revokingId.set(guardian.id);
    this.catalog
      .revokeGuardian(guardian.id)
      .pipe(
        finalize(() => {
          this.revokingId.set(null);
          this.confirmingRevokeId.set(null);
        }),
        this.errors.catch('familia.revocar'),
      )
      .subscribe(() => {
        this.guardians.update((list) => list.filter((g) => g.id !== guardian.id));
        this.toast.show(`Se revocó el acceso de ${guardian.name}.`);
      });
  }

  togglePreference(pref: SharingPreference): void {
    this.savingPrefId.set(pref.id);
    this.catalog
      .setSharingPreference(pref.id, !pref.enabled)
      .pipe(
        finalize(() => this.savingPrefId.set(null)),
        this.errors.catch('familia.permisos'),
      )
      .subscribe((updated) => {
        if (updated) {
          this.preferences.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
        }
      });
  }
}
