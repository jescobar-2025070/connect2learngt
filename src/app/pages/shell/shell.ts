import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { roleOption } from '../../core/models';
import { SectionKey, canAccessSection } from '../../core/permissions';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

interface NavItem {
  section: SectionKey;
  path: string;
  label: string;
  icon: string;
}

/**
 * El menú lateral no decide a quién le corresponde cada sección: solo aporta su
 * presentación (ruta, etiqueta e icono). Quién puede ver qué lo dice
 * `core/permissions`, la misma tabla que consulta `sectionGuard`, así que una
 * sección no puede quedar oculta en el menú y abierta en la URL.
 */
const NAV_ITEMS: NavItem[] = [
  { section: 'inicio', path: '/app/inicio', label: 'Inicio', icon: 'home' },
  { section: 'tutores', path: '/app/tutores', label: 'Tutorías', icon: 'tutors' },
  { section: 'comunidad', path: '/app/comunidad', label: 'Comunidad', icon: 'community' },
  { section: 'recursos', path: '/app/recursos', label: 'Recursos', icon: 'resources' },
  { section: 'grupos', path: '/app/grupos', label: 'Grupos de estudio', icon: 'users' },
  { section: 'mensajes', path: '/app/mensajes', label: 'Mensajes', icon: 'messages' },
  { section: 'reputacion', path: '/app/reputacion', label: 'Reputación', icon: 'star' },
  { section: 'familia', path: '/app/familia', label: 'Supervisión familiar', icon: 'shield' },
  { section: 'perfil', path: '/app/perfil', label: 'Mi perfil', icon: 'profile' },
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

  /** Ruta de arranque del rol activo: el padre no tiene panel propio. */
  readonly startRoute = this.session.startRoute;

  /** Solo se muestran las secciones permitidas para el rol activo. */
  readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => canAccessSection(this.role(), item.section)),
  );

  /** Etiqueta bajo el nombre: el padre no tiene grado, así que va su rol. */
  readonly sideSubtitle = computed(() => this.student()?.grade || this.roleLabel());

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
