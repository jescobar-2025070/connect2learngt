import {
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  Output,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { IconComponent } from './icon';

/** Elementos que pueden recibir foco dentro del diálogo. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bloqueo del scroll de fondo con contador: pueden convivir un diálogo y la
 * videollamada, y cada uno suelta el bloqueo que le corresponde. Sin el
 * contador, el primero en cerrarse desbloquearía la página con la otra capa
 * todavía abierta.
 */
let scrollLocks = 0;

function lockScroll(): void {
  if (scrollLocks++ === 0) document.body.classList.add('scroll-locked');
}

function unlockScroll(): void {
  if (scrollLocks > 0 && --scrollLocks === 0) {
    document.body.classList.remove('scroll-locked');
  }
}

/**
 * Diálogo modal reutilizable del prototipo: fondo desenfocado, cierre con
 * Escape o clic en el velo, foco atrapado dentro del panel y devuelto al
 * elemento que lo abrió al cerrarse.
 *
 * El atrapado de foco y el bloqueo de scroll no son adornos de accesibilidad:
 * sin ellos el teclado se pasea por detrás de un diálogo que sigue visible, y
 * en móvil la página sigue desplazándose bajo el dedo.
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
        [attr.aria-labelledby]="titleId"
        #dialog
        tabindex="-1"
        (keydown)="onKeydown($event)"
      >
        <div class="modal-head">
          <h2 class="mt-0" [id]="titleId">{{ title }}</h2>
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
export class ModalComponent implements OnChanges {
  @Input() open = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();

  /** Contador de instancias: dos diálogos a la vez no colisionan. */
  private static seq = 0;
  protected readonly titleId = `modal-title-${++ModalComponent.seq}`;

  private readonly panel = viewChild<ElementRef<HTMLElement>>('dialog');
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  /** Elemento que tenía el foco al abrirse: ahí vuelve al cerrarse. */
  private restoreFocusTo: HTMLElement | null = null;

  constructor() {
    // Si el diálogo se destruye abierto, su bloqueo debe soltarse igual.
    this.destroyRef.onDestroy(() => {
      if (this.open) unlockScroll();
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closeRequested();
  }

  ngOnChanges(): void {
    if (this.open) {
      this.restoreFocusTo = document.activeElement as HTMLElement | null;
      lockScroll();
      // El foco entra en el panel, no en el primer campo: así quien abre un
      // diálogo con teclado oye el título antes de empezar a escribir.
      afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
    } else {
      unlockScroll();
      this.restoreFocusTo?.focus();
      this.restoreFocusTo = null;
    }
  }

  /** Mantiene el recorrido de tabulación dentro del panel mientras está abierto. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const root = this.panel()?.nativeElement;
    if (!root) return;

    const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || active === root)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeRequested(): void {
    this.close.emit();
  }
}
