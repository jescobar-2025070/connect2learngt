import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { IconComponent } from './icon';

/**
 * Diálogo modal reutilizable del prototipo: backdrop clicable, cierre con
 * Escape, `aria-modal` y bloqueo del scroll de fondo. El contenido se
 * proyecta dentro del cuerpo.
 */
@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="closeRequested()" aria-hidden="true"></div>
      <div
        class="modal"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        #dialog
        tabindex="-1"
      >
        <div class="modal-head">
          <h2 class="mt-0">{{ title }}</h2>
          <button
            type="button"
            class="icon-btn sm"
            (click)="closeRequested()"
            aria-label="Cerrar ventana"
          >
            <app-icon name="close" [size]="16" />
          </button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  @ViewChild('dialog') private readonly dialog!: ElementRef<HTMLElement>;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closeRequested();
  }

  closeRequested(): void {
    this.close.emit();
  }
}