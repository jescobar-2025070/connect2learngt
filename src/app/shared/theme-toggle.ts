import { Component, inject } from '@angular/core';
import { IconComponent } from './icon';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="icon-btn"
      (click)="theme.toggle()"
      [attr.aria-label]="isDark() ? 'Activar modo claro' : 'Activar modo oscuro'"
      [attr.aria-pressed]="isDark()"
      title="Cambiar tema"
    >
      <app-icon [name]="isDark() ? 'sun' : 'moon'" [size]="19" />
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
  isDark = () => this.theme.theme() === 'dark';
}
