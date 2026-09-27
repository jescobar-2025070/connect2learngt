import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { canAccessSection } from './permissions';
import { SessionService } from './session.service';
import { ToastService } from './toast.service';

/** Solo el camino feliz: sin sesión simulada, vuelve al login. */
export const authGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

/**
 * Tras el registro/login el estudiante y el docente pasan por el onboarding
 * (intereses/materias). El padre se vincula a su hijo con un código, así que
 * entra directo a su panel.
 */
export const onboardingGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  if (!session.isLoggedIn()) return router.createUrlTree(['/login']);
  if (!session.needsOnboarding()) return true;
  return session.hasInterests() ? true : router.createUrlTree(['/intereses']);
};

/**
 * Cierra la sección al rol que no le corresponde.
 *
 * El menú lateral ya ocultaba Tutorías, Grupos o Mensajes al padre, pero la
 * ruta seguía abierta: cualquiera podía llegar por URL, por un enlace de la
 * búsqueda global o por el historial del navegador y operar como si fuera
 * estudiante. El guard lee la tabla de `core/permissions`, que es la misma que
 * genera el menú, así que ocultar y bloquear no pueden separarse.
 */
export const sectionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (!session.isLoggedIn()) return router.createUrlTree(['/login']);

  const section = route.data['section'] as string | undefined;
  if (!section || canAccessSection(session.role(), section)) return true;

  // No hay página de "no autorizado": se devuelve al panel del rol con un aviso
  // que explique el motivo, en lugar de mostrar un error genérico.
  inject(ToastService).show('Esa sección no está disponible para tu tipo de cuenta.');
  return router.createUrlTree([session.startRoute()]);
};
