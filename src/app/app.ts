import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme.service';
import { ToastHostComponent } from './shared/toast-host';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHostComponent],
  template: `
    <a class="skip-link" href="#main">Saltar al contenido principal</a>
    <router-outlet />
    <app-toast-host />
  `,
})
export class App {
  constructor() {
    inject(ThemeService).init();
  }
}
