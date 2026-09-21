import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { IconComponent } from './icon';
import { ToastService } from '../core/toast.service';

/**
 * Sala de videollamada simulada del prototipo: pantalla completa con el
 * "video" del participante (avatar estático), el contador de tiempo y los
 * controles clásicos (micrófono, cámara y colgar). Al colgar muestra un
 * aviso para no romper la ilusión de flujo.
 */
@Component({
  selector: 'app-video-call',
  imports: [IconComponent],
  template: `
    @if (open) {
      <div class="vcall" role="dialog" aria-modal="true" [attr.aria-label]="'Videollamada con ' + name">
        <div class="vcall-backdrop"></div>

        <div class="vcall-camera">
          @if (connecting()) {
            <div class="vcall-connecting" aria-live="polite">
              <span class="avatar xl" aria-hidden="true">{{ initials }}</span>
              <p class="muted"><strong>{{ name }}</strong></p>
              <p class="mini muted mt-0">Conectando…</p>
            </div>
          } @else {
            <div class="vcall-live" aria-live="polite">
              <span class="vcall-cam-badge">
                <app-icon [name]="camOn() ? 'video' : 'micOff'" [size]="16" />
              </span>
              <span class="avatar xl" aria-hidden="true">{{ initials }}</span>
              <p><strong>{{ name }}</strong></p>
              <p class="mini muted mt-0">En vivo · {{ elapsed() }}</p>
            </div>
          }

          @if (connecting()) {
            <p class="vcall-tip mini muted">
              Usa unos auriculares y busca un espacio sin ruido para una llamada con mejor
              calidad.
            </p>
          }
        </div>

        <div class="vcall-controls" role="toolbar" aria-label="Controles de la llamada">
          <button
            type="button"
            class="icon-btn"
            [class.active]="muted()"
            [attr.aria-pressed]="muted()"
            [attr.aria-label]="muted() ? 'Activar micrófono' : 'Silenciar micrófono'"
            (click)="toggleMute()"
          >
            <app-icon [name]="muted() ? 'micOff' : 'mic'" [size]="20" />
          </button>
          <button
            type="button"
            class="icon-btn"
            [class.active]="!camOn()"
            [attr.aria-pressed]="!camOn()"
            [attr.aria-label]="camOn() ? 'Apagar cámara' : 'Encender cámara'"
            (click)="setCamOn(!camOn())"
          >
            <app-icon name="video" [size]="20" />
          </button>
          <button
            type="button"
            class="icon-btn hang"
            aria-label="Colgar la llamada"
            (click)="hangUp()"
          >
            <app-icon name="callEnd" [size]="22" />
          </button>
        </div>
      </div>
    }
  `,
})
export class VideoCallComponent {
  private readonly toast = inject(ToastService);

  @Input() open = false;
  @Input() name = 'Tutor';
  @Input() initials = 'TU';
  @Input() subject = 'Tutoría';
  @Output() close = new EventEmitter<void>();

  connecting = signal(true);
  muted = signal(false);
  camOn = signal(true);
  elapsed = signal('00:00');

  private timer: ReturnType<typeof setInterval> | null = null;
  private seconds = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      if (this.open) this.start();
      else this.stopTimer();
    }
  }

  start(): void {
    this.connecting.set(true);
    this.muted.set(false);
    this.camOn.set(true);
    this.elapsed.set('00:00');
    this.seconds = 0;
    setTimeout(() => {
      this.connecting.set(false);
      this.toast.show(`Iniciaste la videollamada con ${this.name}.`);
    }, 1300);
    this.timer = setInterval(() => {
      this.seconds += 1;
      const m = String(Math.floor(this.seconds / 60)).padStart(2, '0');
      const s = String(this.seconds % 60).padStart(2, '0');
      this.elapsed.set(`${m}:${s}`);
    }, 1000);
  }

  toggleMute(): void {
    this.muted.update((m) => !m);
    this.toast.show(this.muted() ? 'Micrófono silenciado.' : 'Micrófono activado.');
  }

  setCamOn(on: boolean): void {
    this.camOn.set(on);
    this.toast.show(on ? 'Cámara encendida.' : 'Cámara apagada.');
  }

  hangUp(): void {
    this.stopTimer();
    this.toast.success(`Llamada con ${this.name} finalizada.`);
    this.close.emit();
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}