import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';

interface PrivacyOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent, ModalComponent],
  templateUrl: './profile.html',
})
export class ProfilePage {
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly student = this.session.student;

  // Editar información personal
  readonly showEdit = signal(false);
  readonly savingEdit = signal(false);
  editName = '';
  editAge: number | null = null;
  editInstitution = '';
  editGrade = '';

  // Cambiar contraseña
  readonly showPassword = signal(false);
  readonly savingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Privacidad
  readonly showPrivacy = signal(false);
  readonly savingPrivacyId = signal<string | null>(null);
  readonly privacyOptions = signal<PrivacyOption[]>([
    {
      id: 'prv-profile',
      label: 'Perfil visible para la comunidad',
      description: 'Otros estudiantes pueden ver tu nombre, institución y logros.',
      enabled: true,
    },
    {
      id: 'prv-activity',
      label: 'Mostrar mi actividad reciente',
      description: 'Publicaciones, me gusta y recursos que compartes.',
      enabled: true,
    },
    {
      id: 'prv-contact',
      label: 'Permitir mensajes de desconocidos',
      description: 'Cualquier estudiante podrá escribirte sin ser contacto.',
      enabled: false,
    },
  ]);

  openEdit(): void {
    const s = this.student();
    if (!s) return;
    this.editName = s.name;
    this.editAge = s.age;
    this.editInstitution = s.institution;
    this.editGrade = s.grade;
    this.showEdit.set(true);
  }

  saveEdit(): void {
    const name = this.editName.trim();
    if (name.length < 3 || this.savingEdit()) {
      this.toast.show('El nombre debe tener al menos 3 caracteres.');
      return;
    }
    this.savingEdit.set(true);
    this.session
      .updateProfile({
        name,
        age: this.editAge ?? this.student()?.age ?? 17,
        institution: this.editInstitution.trim() || 'Sin especificar',
        grade: this.editGrade.trim() || 'Sin especificar',
      })
      .subscribe(() => {
        this.savingEdit.set(false);
        this.showEdit.set(false);
        this.toast.success('Tu información se actualizó correctamente.');
      });
  }

  openPassword(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError.set(null);
    this.showPassword.set(true);
  }

  savePassword(): void {
    if (this.savingPassword()) return;
    if (this.currentPassword.length < 6) {
      this.passwordError.set('Escribe tu contraseña actual (mínimo 6 caracteres).');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Las contraseñas nuevas no coinciden.');
      return;
    }
    this.savingPassword.set(true);
    setTimeout(() => {
      this.savingPassword.set(false);
      this.showPassword.set(false);
      this.toast.success('Contraseña actualizada correctamente.');
    }, 1100);
  }

  togglePrivacy(option: PrivacyOption): void {
    this.savingPrivacyId.set(option.id);
    setTimeout(() => {
      this.privacyOptions.update((list) =>
        list.map((o) => (o.id === option.id ? { ...o, enabled: !o.enabled } : o)),
      );
      this.savingPrivacyId.set(null);
      this.toast.show(`Privacidad actualizada: "${option.label}".`);
    }, 500);
  }
}