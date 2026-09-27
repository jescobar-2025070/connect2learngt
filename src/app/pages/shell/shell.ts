import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserRole, roleOption } from '../../core/models';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  /** Roles que ven esta sección. Si se omite, es visible para todos. */
  roles?: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/app/inicio', label: 'Inicio', icon: 'home' },
  { path: '/app/tutores', label: 'Tutorías', icon: 'tutors', roles: ['estudiante'] },
  { path: '/app/comunidad', label: 'Comunidad', icon: 'community' },
  { path: '/app/recursos', label: 'Recursos', icon: 'resources' },
  { path: '/app/grupos', label: 'Grupos de estudio', icon: 'users', roles: ['estudiante', 'tutor'] },
  { path: '/app/mensajes', label: 'Mensajes', icon: 'messages' },
  { path: '/app/reputacion', label: 'Reputación', icon: 'star', roles: ['estudiante', 'tutor'] },
  {
    path: '/app/familia',
    label: 'Supervisión familiar',
    icon: 'shield',
    roles: ['estudiante', 'padre'],
  },
  { path: '/app/perfil', label: 'Mi perfil', icon: 'profile' },
];

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, ThemeToggleComponent],
  templateUrl: './shell.html',
})
export class ShellPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly student = this.session.student;
  readonly menuOpen = signal(false);

  readonly role = this.session.role;
  readonly roleLabel = computed(() => roleOption(this.role()).label);

  /** Solo se muestran las secciones permitidas para el rol activo. */
  readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(this.role())),
  );

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  comingSoon(feature: string): void {
    this.closeMenu();
    this.toast.comingSoon(feature);
  }

  logout(): void {
    this.session.logout();
    this.router.navigate(['/login']);
  }
}
