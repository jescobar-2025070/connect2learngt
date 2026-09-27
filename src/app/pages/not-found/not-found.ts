import { Component, inject } from '@angular/core';
import { DOCUMENT, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../core/session.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

/**
 * 404 de la aplicación. Un solo componente con dos entradas de ruta:
 *
 *  - `/app/**` (chrome `shell`): la URL era una sección que no existe. Se
 *    muestra dentro del shell, así el usuario conserva la navegación lateral.
 *  - `/**` (chrome `page`): la URL no existe en absoluto. Se muestra a
 *    pantalla completa con la marca y el interruptor de tema, igual que las
 *    pantallas de acceso.
 *
 * Sin sesión activa manda el `onboardingGuard` del shell, así que aquí nunca
 * se ven datos de la cuenta: no hay riesgo de exponer información.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './not-found.html',
})
export class NotFoundPage {
  private readonly session = inject(SessionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly document = inject(DOCUMENT);

  /** `true` cuando la pantalla se pinta dentro del shell (sidebar visible). */
  readonly withShell = this.route.snapshot.data['chrome'] === 'shell';

  /** A dónde lleva "Volver al inicio": al panel del rol o, sin sesión, al login. */
  readonly startRoute = this.session.isLoggedIn() ? this.session.startRoute() : '/login';

  /** "Regresar" usa el historial del navegador; sin historial, al inicio. */
  back(): void {
    const view = this.document.defaultView;
    if (view && view.history.length > 1) {
      this.location.back();
      return;
    }
    void this.router.navigateByUrl(this.startRoute);
  }
}
