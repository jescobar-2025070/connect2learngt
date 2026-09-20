import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'c2l-theme';

/**
 * Tema claro/oscuro. Escribe `data-theme` en <html>; toda la transición
 * de color vive en CSS (styles.css), por eso el cambio es suave.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>('light');

  init(): void {
    let initial: Theme = 'light';
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'light' || saved === 'dark') {
        initial = saved;
      } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        initial = 'dark';
      }
    } catch {
      /* almacenamiento no disponible: se queda en claro */
    }
    this.apply(initial);
  }

  toggle(): void {
    this.apply(this.theme() === 'light' ? 'dark' : 'light');
  }

  private apply(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* sin persistencia */
    }
  }
}
