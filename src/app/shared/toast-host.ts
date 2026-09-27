import { Component, computed, inject } from '@angular/core';
import { IconComponent } from './icon';
import { Toast, ToastService, ToastTone } from '../core/toast.service';

/**
 * Icono por tono. El círculo informa, el triángulo avisa y la marca confirma:
 * el aviso y el error comparten triángulo y se distinguen por el color y por el
 * tono de voz, porque comparten además la misma urgencia (leerlo y actuar).
 */
const ICON: Record<ToastTone, string> = {
  info: 'info',
  success: 'check',
  warning: 'alert',
  error: 'alert',
};

/** Tonos que exigen atención inmediata y, por tanto, se presentan centrados. */
const ATTENTION: ReadonlySet<ToastTone> = new Set<ToastTone>(['warning', 'error']);

/**
 * Contenedor único de avisos de toda la aplicación.
 *
 * Reparte los avisos en dos grupos según su gravedad, no según quién los lanza:
 * `error` y `warning` van centrados en la pantalla, `info` y `success` a la
 * esquina inferior. Cada grupo es una región viva propia, para que un
 * aterrizaje suave en la esquina no interrumpa la lectura de un error.
 *
 * Los estilos viven en `styles.css` (`.toast*`), no aquí: así los avisos
 * comparten tokens, tonos y zonas táctiles con el resto del sistema visual.
 */
@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  template: `
    <!--
      Los avisos de esquina no interrumpen: se anuncian como "status".
      Los centrados sí requieren actuar, así que el contenedor usa role="alert",
      que un lector de pantalla interrumpe de inmediato.
    -->
    @if (attention().length) {
      <div class="toast-wrap centered" role="alert">
        @for (t of attention(); track t.id) {
          <div [class]="'toast ' + t.tone">
            <app-icon [name]="iconOf(t)" [size]="20" />
            <div class="toast-body">
              @if (t.title) {
                <strong>{{ t.title }}</strong>
              }
              <span>{{ t.text }}</span>
            </div>
            @if (t.action; as action) {
              <button type="button" class="toast-action" (click)="run(t)">{{ action.label }}</button>
            }
            <button
              type="button"
              class="toast-close"
              (click)="toastService.dismiss(t.id)"
              aria-label="Cerrar aviso"
            >
              <app-icon name="close" [size]="15" />
            </button>
          </div>
        }
      </div>
    }

    @if (ambient().length) {
      <div class="toast-wrap" role="status" aria-live="polite">
        @for (t of ambient(); track t.id) {
          <div [class]="'toast ' + t.tone">
            <app-icon [name]="iconOf(t)" [size]="18" />
            <div class="toast-body">
              @if (t.title) {
                <strong>{{ t.title }}</strong>
              }
              <span>{{ t.text }}</span>
            </div>
            @if (t.action; as action) {
              <button type="button" class="toast-action" (click)="run(t)">{{ action.label }}</button>
            }
            <button
              type="button"
              class="toast-close"
              (click)="toastService.dismiss(t.id)"
              aria-label="Cerrar aviso"
            >
              <app-icon name="close" [size]="15" />
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);

  /** Avisos centrados: requieren una decisión del usuario. */
  readonly attention = computed(() => this.toastService.toasts().filter((t) => ATTENTION.has(t.tone)));

  /** Avisos de esquina: confirman que algo ya ha ocurrido. */
  readonly ambient = computed(() => this.toastService.toasts().filter((t) => !ATTENTION.has(t.tone)));

  iconOf(toast: Toast): string {
    return ICON[toast.tone] ?? ICON.info;
  }

  /** Ejecuta la acción del aviso y lo cierra: evita avisos que se solapan. */
  run(toast: Toast): void {
    toast.action?.run();
    this.toastService.dismiss(toast.id);
  }
}
