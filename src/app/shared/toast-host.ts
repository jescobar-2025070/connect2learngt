import { Component, inject } from '@angular/core';
import { IconComponent } from './icon';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [IconComponent],
  template: `
    <div class="toast-wrap" role="status" aria-live="polite">
      @for (t of toastService.toasts(); track t.id) {
        <div class="toast" [class.success]="t.tone === 'success'">
          <app-icon [name]="t.tone === 'success' ? 'check' : 'spark'" [size]="18" />
          <span>{{ t.text }}</span>
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
      .toast app-icon:first-child {
        color: var(--brand);
        flex: none;
      }
      .toast.success app-icon:first-child {
        color: var(--success);
      }
      .toast span {
        flex: 1;
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
}
