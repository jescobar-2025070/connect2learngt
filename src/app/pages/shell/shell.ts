import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { roleOption } from '../../core/models';
import { SectionKey, canAccessSection } from '../../core/permissions';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

/** Elementos que pueden recibir foco dentro del cajón de navegación. */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

  private readonly side = viewChild<ElementRef<HTMLElement>>('side');
  private readonly menuBtn = viewChild<ElementRef<HTMLButtonElement>>('menuBtn');
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  /**
   * El cajón solo se solapa con el contenido por debajo de 760 px, que es el
   * mismo punto de corte que usa `.side` en la hoja de estilos. Saberlo aquí
   * evita mover el foco o atrapar el tabulado en un menú que no se solapa con
   * nada, porque en escritorio el menú siempre está visible.
   */
  private readonly narrowQuery = window.matchMedia('(max-width: 760px)');
  private readonly isNarrow = signal(this.narrowQuery.matches);

  constructor() {
    const onChange = (e: MediaQueryListEvent) => {
      this.isNarrow.set(e.matches);
      // Al pasar a escritorio el cajón deja de ser superposición: se cierra.
      if (!e.matches) this.menuOpen.set(false);
    };
    this.narrowQuery.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => this.narrowQuery.removeEventListener('change', onChange));
  }

  /** El cajón está superpuesto: solo entonces se queda el foco dentro. */
  private get drawerIsOverlay(): boolean {
    return this.isNarrow() && this.menuOpen();
  }

  toggleMenu(): void {
    if (this.menuOpen()) {
      this.closeMenu();
      return;
    }
    this.menuOpen.set(true);
    // El foco entra en el primer enlace: sin esto, el teclado sigue en el
    // botón del menú y el usuario no tiene forma de alcanzar la navegación.
    // Se espera al render porque el cajón cerrado es `visibility: hidden`, y
    // sobre un elemento así el foco se pierde en silencio.
    afterNextRender(() => this.focusFirstInDrawer(), { injector: this.injector });
  }

  /**
   * @param restoreFocus `true` cuando el cierre no viene de pulsar un enlace
   *   (Escape o el propio botón). Si el menú se cierra porque el usuario ha
   *   elegido una sección, devolverle el foco al botón lo sacaría de la página
   *   que acaba de abrir.
   */
  closeMenu(restoreFocus = false): void {
    this.menuOpen.set(false);
    if (restoreFocus) this.menuBtn()?.nativeElement.focus();
  }

  /**
   * Se escucha en el documento, no en el cajón: Escape debe cerrar el menú
   * aunque el foco esté en el velo, en un enlace o en el propio botón. Y Tab
   * queda atrapado mientras el menú se solapa con el contenido; si no, el
   * tabulador se pasea por una página que sigue visible detrás.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.drawerIsOverlay) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeMenu(true);
      return;
    }
    if (event.key !== 'Tab') return;

    const root = this.side()?.nativeElement;
    if (!root) return;

    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private focusFirstInDrawer(): void {
    const root = this.side()?.nativeElement;
    root?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
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
