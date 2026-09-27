import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorService } from './error.service';

/**
 * `ErrorHandler` global de Angular (mecanismo nativo del framework).
 *
 * Es el último punto donde caen las excepciones que nadie espera: un
 * `subscribe` sin tratar, un listener, un ciclo de detección de cambios o el
 * fallo del propio bootstrap. En lugar de dejar la pantalla a medias con el
 * error crudo en consola, delega en `ErrorService`: la consola conserva la
 * traza técnica y el usuario recibe un aviso amigable. La aplicación sigue
 * viva.
 */
@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly errors = inject(ErrorService);

  handleError(error: unknown): void {
    this.errors.report(error, 'inesperado');
  }
}
