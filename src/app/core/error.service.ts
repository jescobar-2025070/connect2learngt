import { Injectable, inject } from '@angular/core';
import { EMPTY, MonoTypeOperatorFunction, catchError } from 'rxjs';
import { ToastService } from './toast.service';
import { ErrorCopyOverrides, ErrorKind, UserErrorCopy, copyForKind, kindOf, statusOf } from './error-messages';

/**
 * Fallos que dependen de lo que hizo el usuario, no del estado del sistema.
 * Se anuncian como advertencia y no como error; el resto (red caída, sesión
 * caducada, fallo del servidor) sí es una avería y se anuncia como error.
 */
const ADVISORY: ReadonlySet<ErrorKind> = new Set<ErrorKind>([
  'validation',
  'forbidden',
  'conflict',
  'rateLimit',
]);

/** Opciones de `ErrorService.report`. */
export interface ReportOptions {
  /** Acción "Reintentar" del aviso: vuelve a lanzar la operación fallida. */
  retry?: () => void;
  /** Registra la traza pero no muestra aviso (la pantalla ya lo enseña). */
  silent?: boolean;
  /** Textos propios de la pantalla para algún tipo de error. */
  overrides?: ErrorCopyOverrides;
}

/**
 * Punto de entrada único de los errores de la aplicación.
 *
 * Hace dos cosas y solo dos, en este orden:
 *  1. Guarda la información técnica en la consola (contexto, status, nombre y
 *     mensaje original) para poder depurar.
 *  2. Muestra el mensaje amigable que corresponde, vía el `ToastService`.
 *
 * El detalle técnico nunca se pinta en la interfaz: el texto que ve el usuario
 * sale siempre de `error-messages.ts`, nunca del backend ni de la excepción.
 */
@Injectable({ providedIn: 'root' })
export class ErrorService {
  private readonly toast = inject(ToastService);

  /**
   * Operador para el `pipe` de una llamada: al fallar, avisa una sola vez y
   * corta la suscripción con `EMPTY` para que la vista no se quede a medias.
   * El `finalize` de la propia pantalla sigue ejecutándose, así que los
   * indicadores de carga siempre se limpian.
   *
   * ```ts
   * this.catalog.getStudyGroups(subject)
   *   .pipe(
   *     finalize(() => this.loading.set(false)),
   *     this.errors.catch('grupos.lista'),
   *   )
   *   .subscribe((list) => this.groups.set(list));
   * ```
   */
  catch<T>(context: string, retry?: () => void): MonoTypeOperatorFunction<T> {
    return catchError((err: unknown) => {
      this.report(err, context, retry ? { retry } : undefined);
      return EMPTY;
    });
  }

  /** Traduce cualquier valor lanzado al error que se le enseña al usuario. */
  toUserError(err: unknown, overrides?: ErrorCopyOverrides): UserErrorCopy {
    return copyForKind(kindOf(err), overrides);
  }

  /**
   * Registra el fallo y muestra el aviso amigable. Devuelve el texto elegido
   * para que la pantalla pueda reutilizarlo (por ejemplo en un error de campo).
   */
  report(err: unknown, context = 'app', options: ReportOptions = {}): UserErrorCopy {
    const copy = this.toUserError(err, options.overrides);
    this.log(copy, err, context);

    if (!options.silent) {
      const action = copy.retryable && options.retry ? { label: 'Reintentar', run: options.retry } : undefined;
      // No todo fallo es una alarma. Un 403, un 409 o un 429 significan que la
      // acción no se completó por una razón que el usuario puede corregir: se
      // presenta como advertencia, con el mismo peso y el mismo centro en
      // pantalla, pero sin la alarma de "algo está roto".
      if (ADVISORY.has(copy.kind)) {
        this.toast.warning(copy.title, copy.detail, action);
      } else {
        this.toast.error(copy.title, copy.detail, action);
      }
    }
    return copy;
  }

  /**
   * Traza técnica. A propósito no se registran cuerpos de respuesta, cabeceras
   * ni parámetros: solo estado, nombre y mensaje, que es lo que hace falta para
   * depurar sin arriesgar tokens o datos personales en la consola.
   */
  private log(copy: UserErrorCopy, err: unknown, context: string): void {
    const status = statusOf(err);
    const details = [status != null ? `status ${status}` : null, err instanceof Error ? err.name : typeof err]
      .filter(Boolean)
      .join(' · ');

    console.error(`[connect2learn] ${context} → ${copy.kind}${details ? ` (${details})` : ''}`, err);
  }
}
