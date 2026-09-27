import { Injectable, signal } from '@angular/core';

/** Acción opcional del aviso (por ejemplo, reintentar la operación). */
export interface ToastAction {
  label: string;
  run: () => void;
}

/**
 * Los cuatro tonos del sistema de avisos. `info` y `success` confirman algo
 * que ya ha pasado; `warning` y `error` requieren una decisión, y por eso el
 * componente los presenta centrados en lugar de en la esquina.
 */
export type ToastTone = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  /** Encabezado opcional: los avisos de error lo usan, los de éxito no. */
  title: string | null;
  text: string;
  tone: ToastTone;
  action: ToastAction | null;
}

const INFO_MS = 3200;
const ERROR_MS = 7000;
/** Tope de avisos a la vez: evita que una ráfaga de fallos tape la pantalla. */
const MAX_VISIBLE = 3;

/**
 * Avisos efímeros. También cubre los botones "Próximamente" del prototipo.
 * Los errores pasan por aquí con `error()`: el texto lo elige `ErrorService`,
 * nunca el servicio que falló.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(text: string, tone: Toast['tone'] = 'info'): void {
    this.push({ text, tone }, INFO_MS);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  /**
   * Aviso de advertencia: la acción se completó pero con una consecuencia
   * que conviene revisar. Comparte con los errores el tiempo de vida largo y
   * la colocación centrada, pero no el color: no es un fallo.
   */
  warning(title: string, text: string, action?: ToastAction): void {
    this.push({ title, text, tone: 'warning', action: action ?? null }, ERROR_MS);
  }

  /**
   * Aviso de error. Vive más tiempo que los informational para que se pueda
   * leer y, si la acción es segura, pulsar "Reintentar".
   */
  error(title: string, text: string, action?: ToastAction): void {
    this.push({ title, text, tone: 'error', action: action ?? null }, ERROR_MS);
  }

  /** Acción visible pero fuera del alcance del prototipo. */
  comingSoon(feature = 'Esta función'): void {
    this.show(`${feature} estará disponible próximamente.`);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(input: Omit<Toast, 'id' | 'title' | 'action' | 'tone'> & Partial<Toast>, ms: number): void {
    const id = this.nextId++;
    const toast: Toast = {
      id,
      title: input.title ?? null,
      text: input.text,
      tone: input.tone ?? 'info',
      action: input.action ?? null,
    };
    this.toasts.update((list) => [...list, toast].slice(-MAX_VISIBLE));
    setTimeout(() => this.dismiss(id), ms);
  }
}
