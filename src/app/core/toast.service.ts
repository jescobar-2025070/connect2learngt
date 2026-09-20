import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'success';
}

/** Avisos efímeros. También cubre los botones "Próximamente" del prototipo. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(text: string, tone: Toast['tone'] = 'info'): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, text, tone }]);
    setTimeout(() => this.dismiss(id), 3200);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  /** Acción visible pero fuera del alcance del prototipo. */
  comingSoon(feature = 'Esta función'): void {
    this.show(`${feature} estará disponible próximamente.`);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
