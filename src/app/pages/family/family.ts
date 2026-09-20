import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { Guardian, SharingPreference } from '../../core/models';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-family',
  imports: [FormsModule, ThemeToggleComponent],
  templateUrl: './family.html',
})
export class FamilyPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly guardians = signal<Guardian[]>([]);
  readonly preferences = signal<SharingPreference[]>([]);
  readonly loading = signal(true);
  readonly revokingId = signal<string | null>(null);
  readonly confirmingRevokeId = signal<string | null>(null);
  readonly savingPrefId = signal<string | null>(null);

  inviteEmail = '';
  readonly inviting = signal(false);
  readonly inviteError = signal<string | null>(null);

  constructor() {
    let guardiansReady = false;
    let prefsReady = false;
    const checkDone = () => {
      if (guardiansReady && prefsReady) this.loading.set(false);
    };

    this.catalog.getGuardians().subscribe((list) => {
      this.guardians.set(list);
      guardiansReady = true;
      checkDone();
    });
    this.catalog.getSharingPreferences().subscribe((list) => {
      this.preferences.set(list);
      prefsReady = true;
      checkDone();
    });
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
    this.catalog.inviteGuardian(email).subscribe((guardian) => {
      this.guardians.update((list) => [...list, guardian]);
      this.inviting.set(false);
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
    this.catalog.revokeGuardian(guardian.id).subscribe(() => {
      this.guardians.update((list) => list.filter((g) => g.id !== guardian.id));
      this.revokingId.set(null);
      this.confirmingRevokeId.set(null);
      this.toast.show(`Se revocó el acceso de ${guardian.name}.`);
    });
  }

  togglePreference(pref: SharingPreference): void {
    this.savingPrefId.set(pref.id);
    this.catalog.setSharingPreference(pref.id, !pref.enabled).subscribe((updated) => {
      if (updated) {
        this.preferences.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
      }
      this.savingPrefId.set(null);
    });
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
