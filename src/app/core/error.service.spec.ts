import { Injector } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { finalize } from 'rxjs';
import { ErrorService } from './error.service';
import { ToastService } from './toast.service';

/**
 * Lo que garantiza `ErrorService.catch()`:
 *  - el fallo no llega al `subscribe` (una vista sin manejador no se rompe),
 *  - se avisa una sola vez y el aviso es el texto amigable, no el técnico,
 *  - el `finalize` de la pantalla sigue ejecutándose,
 *  - "Reintentar" solo se ofrece cuando repetir tiene sentido.
 */
describe('ErrorService', () => {
  let errors: ErrorService;
  let toasts: ToastService;
  let shown: Array<{ title: string; text: string; action?: { label: string; run: () => void } }>;

  beforeEach(() => {
    // `Injector.create` basta: el servicio solo depende del de avisos y no
    // necesita DOM ni componentes.
    const injector = Injector.create({ providers: [ErrorService, ToastService] });
    errors = injector.get(ErrorService);
    toasts = injector.get(ToastService);
    shown = [];
    // Se espía el aviso en vez de leer el signal para no depender del render.
    spyOn(toasts, 'error').and.callFake((title: string, text: string, action?: any) =>
      shown.push({ title, text, action }),
    );
    // `report` registra la traza: en una prueba eso sería ruido.
    spyOn(console, 'error');
  });

  it('traduce el fallo y avisa una sola vez con texto amigable', () => {
    errors.catch('grupos.lista')(throwError(() => ({ name: 'HttpErrorResponse', status: 503 }))).subscribe();

    expect(shown.length).toBe(1);
    expect(shown[0].title).not.toContain('503');
    expect(shown[0].text).not.toMatch(/503|HttpErrorResponse/);
    expect(console.error).toHaveBeenCalled();
  });

  it('no propaga el fallo al subscribe y ejecuta el finalize', () => {
    const failed = new Error('boom');
    let finalized = 0;
    let handlerCalls = 0;
    let nextCalls = 0;

    new Observable<string>((sub) => sub.error(failed))
      .pipe(
        finalize(() => finalized++),
        errors.catch('tutor.perfil'),
      )
      .subscribe({
        next: () => nextCalls++,
        error: () => handlerCalls++,
      });

    // El error no debe escapar: sin esto, un `subscribe` sin manejador
    // llevaría el fallo al ErrorHandler global y rompería la vista.
    expect(handlerCalls).toBe(0);
    expect(nextCalls).toBe(0);
    expect(finalized).toBe(1);
  });

  it('ofrece "Reintentar" y ejecuta el callback de la pantalla', () => {
    let retries = 0;
    errors.catch('comunidad.publicar', () => retries++)(throwError(() => new Error('boom'))).subscribe();

    expect(shown.length).toBe(1);
    expect(shown[0].action?.label).toBe('Reintentar');
    shown[0].action?.run();
    expect(retries).toBe(1);
  });

  it('no propone reintentar un error que volvería a fallar igual', () => {
    for (const status of [401, 403, 404, 409]) {
      shown = [];
      errors.catch('pantalla', () => {})(throwError(() => ({ name: 'HttpErrorResponse', status }))).subscribe();
      expect(shown[0].action).withContext(`status ${status}`).toBeUndefined();
    }
  });

  it('sin callback de reintento el aviso sigue, pero sin acción', () => {
    errors.catch('recursos.descargar')(throwError(() => new Error('boom'))).subscribe();

    expect(shown.length).toBe(1);
    expect(shown[0].action).toBeUndefined();
  });

  it('un fallo por suscripción, también en un flujo que no termina', () => {
    const stream = new Subject<number>();
    stream.pipe(errors.catch('chat')).subscribe({ error: () => fail('no debe llegar al handler') });
    stream.error({ status: 500 });

    expect(shown.length).toBe(1);
  });

  it('`silent` registra el fallo sin molestar al usuario', () => {
    errors.report(new Error('detalle interno'), 'ficha.estudiante', { silent: true });

    expect(shown.length).toBe(0);
    expect(console.error).toHaveBeenCalled();
  });

  it('`toUserError` devuelve el texto de usuario sin registrar nada', () => {
    const user = errors.toUserError({ name: 'HttpErrorResponse', status: 422 });

    expect(user.kind).toBe('validation');
    expect(user.title).not.toBe('');
    expect(console.error).not.toHaveBeenCalled();
  });
});
