import { COPY, copyForKind, kindForStatus, kindOf, statusOf, type ErrorKind } from './error-messages';

/**
 * El mapeo de errores es la pieza que garantiza que el usuario nunca ve un
 * texto técnico, así que se fija con ejemplos: cada estado HTTP, los mensajes
 * que emite el navegador cuando no hay servidor, y la ausencia de jerga en los
 * textos.
 */

/** Error con la misma forma que un `HttpErrorResponse` de Angular. */
const httpError = (status: number, body = 'SQLSTATE[42S02]: relation "users" does not exist') => ({
  name: 'HttpErrorResponse',
  status,
  error: { message: body },
});

describe('error-messages', () => {
  describe('kindForStatus', () => {
    const MATRIX: Array<[number, ErrorKind]> = [
      [0, 'offline'],
      [400, 'validation'],
      [401, 'auth'],
      [403, 'forbidden'],
      [404, 'notFound'],
      [408, 'timeout'],
      [409, 'conflict'],
      [422, 'validation'],
      [429, 'rateLimit'],
      [500, 'server'],
      [502, 'server'],
      [503, 'server'],
      [504, 'timeout'],
    ];

    for (const [status, expected] of MATRIX) {
      it(`traduce ${status} a "${expected}"`, () => {
        expect(kindForStatus(status)).toBe(expected);
        expect(kindOf(httpError(status))).toBe(expected);
        expect(statusOf(httpError(status))).toBe(status);
      });
    }

    it('agrupa cualquier otro 5xx como fallo del servidor', () => {
      expect(kindForStatus(501)).toBe('server');
      expect(kindForStatus(599)).toBe('server');
    });

    it('deja en inesperado cualquier otro 4xx sin código propio', () => {
      expect(kindForStatus(418)).toBe('unknown');
      expect(kindForStatus(451)).toBe('unknown');
    });
  });

  describe('kindOf', () => {
    it('detecta la caída del backend por el mensaje del navegador', () => {
      expect(kindOf(new TypeError('Failed to fetch'))).toBe('offline');
      expect(kindOf(new Error('NetworkError when attempting to fetch resource.'))).toBe('offline');
      expect(kindOf(new Error('Load failed'))).toBe('offline');
      expect(kindOf(httpError(0))).toBe('offline');
    });

    it('distingue un timeout de una caída', () => {
      const timeout = new Error('Timeout has occurred');
      timeout.name = 'TimeoutError';
      expect(kindOf(timeout)).toBe('timeout');
      const aborted = new Error('The user aborted a request.');
      aborted.name = 'AbortError';
      expect(kindOf(aborted)).toBe('timeout');
    });

    it('acepta un tipo declarado por el servicio que falló', () => {
      expect(kindOf({ kind: 'conflict', message: 'Ya estás en el grupo' })).toBe('conflict');
    });

    it('cae en inesperado ante valores que no son errores', () => {
      expect(kindOf(new SyntaxError('Unexpected token < in JSON at position 0'))).toBe('unknown');
      expect(kindOf(new TypeError("Cannot read properties of undefined (reading 'id')"))).toBe('unknown');
      expect(kindOf('boom')).toBe('unknown');
      expect(kindOf(undefined)).toBe('unknown');
      expect(kindOf({ kind: 'inventado' })).toBe('unknown');
    });

    it('no inventa un estado HTTP donde no lo hay', () => {
      expect(statusOf(new Error('boom'))).toBeNull();
      expect(statusOf('boom')).toBeNull();
      expect(statusOf(null)).toBeNull();
    });
  });

  describe('textos', () => {
    // Nada de esto puede llegar a la interfaz: son exactamente las palabras que
    // un desarrollador dejaría en un mensaje de error.
    const TECH = /stack|exception|undefined|null|http|status|sql|error:|json|class |function |\d{3}\b|token|password/i;

    for (const kind of Object.keys(COPY) as ErrorKind[]) {
      it(`"${kind}" está escrito para el usuario`, () => {
        const copy = COPY[kind];
        expect(copy.title.length).toBeGreaterThan(0);
        expect(copy.detail.length).toBeGreaterThan(0);
        expect(copy.title).not.toMatch(TECH);
        expect(copy.detail).not.toMatch(TECH);
        expect(copy.title).not.toMatch(/^\s|\s$/);
        expect(copy.detail).not.toMatch(/^\s|\s$/);
        // Títulos cortos: el aviso vive en una esquina de la pantalla.
        expect(copy.title.length).toBeLessThanOrEqual(40);
        expect(copy.detail.length).toBeLessThanOrEqual(90);
        expect(typeof copy.retryable).toBe('boolean');
      });
    }

    it('da un texto propio a cada tipo, sin repetir el mismo mensaje', () => {
      const kinds = Object.keys(COPY) as ErrorKind[];
      expect(new Set(kinds.map((k) => COPY[k].detail)).size).toBe(kinds.length);
      expect(new Set(kinds.map((k) => COPY[k].title)).size).toBe(kinds.length);
    });

    it('solo marca como reintentable lo que se puede repetir', () => {
      const notWorthRepeating: ErrorKind[] = ['auth', 'forbidden', 'notFound', 'conflict'];
      for (const kind of notWorthRepeating) {
        expect(COPY[kind].retryable).withContext(kind).toBe(false);
      }
      for (const kind of ['offline', 'timeout', 'server', 'rateLimit', 'validation', 'unknown'] as ErrorKind[]) {
        expect(COPY[kind].retryable).withContext(kind).toBe(true);
      }
    });
  });

  describe('copyForKind', () => {
    it('usa el texto propio de la pantalla cuando lo hay', () => {
      const overrides = {
        auth: {
          kind: 'auth' as const,
          title: 'No pudimos entrar',
          detail: 'Revisa tu correo y contraseña.',
          retryable: false,
        },
      };
      expect(copyForKind('auth', overrides).detail).toBe('Revisa tu correo y contraseña.');
      expect(copyForKind('server', overrides)).toEqual(COPY.server);
      expect(copyForKind('auth')).toEqual(COPY.auth);
    });
  });
});
