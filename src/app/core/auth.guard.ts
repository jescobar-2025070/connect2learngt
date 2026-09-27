import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from './session.service';

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
