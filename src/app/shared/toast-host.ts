import { Component, inject } from '@angular/core';
import { IconComponent } from './icon';
import { Toast, ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  template: `
    <div class="toast-wrap" role="status" aria-live="polite">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class.success]="t.tone === 'success'" [class.error]="t.tone === 'error'">
          <app-icon
            [name]="t.tone === 'success' ? 'check' : t.tone === 'error' ? 'alert' : 'spark'"
            [size]="18"
          />
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
  `,
  styles: [
    `
      .toast-wrap {
        position: fixed;
        right: 18px;
        bottom: 18px;
        z-index: 200;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: min(380px, calc(100vw - 36px));
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface);
        color: var(--ink);
        border: 1px solid var(--line-strong);
        border-left: 4px solid var(--brand);
        border-radius: var(--radius);
        padding: 12px 14px;
        box-shadow: var(--shadow-lg);
        font-size: 0.9375rem;
        font-weight: 550;
        animation: toast-in 0.2s ease-out;
      }
      .toast.success {
        border-left-color: var(--success);
      }
      .toast.error {
        border-left-color: var(--danger);
      }
      .toast app-icon:first-child {
        color: var(--brand);
        flex: none;
      }
      .toast.success app-icon:first-child {
        color: var(--success);
      }
      .toast.error app-icon:first-child {
        color: var(--danger);
      }
      .toast-body {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
      }
      .toast-body strong {
        font-weight: 750;
        line-height: 1.35;
      }
      .toast-body span {
        line-height: 1.4;
      }
      .toast-action {
        flex: none;
        border: 1px solid var(--line-strong);
        background: transparent;
        color: var(--brand);
        font: inherit;
        font-size: 0.8125rem;
        font-weight: 700;
        cursor: pointer;
        min-height: 32px;
        padding: 4px 10px;
        border-radius: var(--radius-sm);
      }
      .toast-action:hover {
        background: var(--surface-2);
      }
      .toast-close {
        border: 0;
        background: transparent;
        color: var(--muted);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm);
        display: grid;
        place-items: center;
      }
      .toast-close:hover {
        color: var(--ink);
      }
      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
      }
      @media (max-width: 760px) {
        .toast-wrap {
          right: 12px;
          left: 12px;
          bottom: 12px;
          max-width: none;
        }
      }
    `,
  ],
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);

  /** Ejecuta la acción del aviso y lo cierra: evita avisos que se solapan. */
  run(toast: Toast): void {
    toast.action?.run();
    this.toastService.dismiss(toast.id);
  }
}
