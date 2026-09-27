import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';
import { AppErrorHandler } from './core/error.handler';
import { ErrorService } from './core/error.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Errores no controlados: los captura el ErrorHandler nativo de Angular,
    // que los deriva a ErrorService (traza en consola + aviso amigable).
    { provide: ErrorHandler, useClass: AppErrorHandler },
    provideRouter(
      routes,
      // Fallos de navegación: guard que lanza, `loadComponent` que no baja el
      // chunk (red caída) o datos que no se pueden resolver. Se centralizan
      // aquí; con esto el router deja de propagarlos a la consola en crudo.
      withNavigationErrorHandler((e) => inject(ErrorService).report(e.error, 'navegación')),
    ),
  ],
};
