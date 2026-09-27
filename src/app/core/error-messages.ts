/**
 * Catálogo único de mensajes de error para el usuario.
 *
 * Aquí vive el "vocabulario" del error: cada tipo de fallo tiene un título
 * corto, una explicación en lenguaje natural y si conviene ofrecer reintento.
 * Es la única fuente de la que salen los textos que ve el usuario, para que
 * la aplicación sea coherente y ningún error técnico llegue a la pantalla.
 *
 * Módulo puro (sin Angular) a propósito: no depende de nada del framework y
 * se puede reutilizar tal cual desde servicios, guards o componentes.
 */

export type ErrorKind =
  | 'validation'
  | 'auth'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'offline'
  | 'timeout'
  | 'rateLimit'
  | 'server'
  | 'unknown';

export interface UserErrorCopy {
  kind: ErrorKind;
  /** Encabezado corto: sirve de título del aviso y de etiqueta en línea. */
  title: string;
  /** Explicación en lenguaje natural, con el siguiente paso si lo hay. */
  detail: string;
  /** `true` cuando repetir exactamente la misma acción tiene sentido. */
  retryable: boolean;
}

export const COPY: Record<ErrorKind, UserErrorCopy> = {
  validation: {
    kind: 'validation',
    title: 'Revisa los datos',
    detail: 'Faltan datos o alguno no es válido. Corrige lo marcado e inténtalo de nuevo.',
    retryable: true,
  },
  auth: {
    kind: 'auth',
    title: 'Tu sesión expiró',
    detail: 'Vuelve a iniciar sesión para continuar donde lo dejaste.',
    retryable: false,
  },
  forbidden: {
    kind: 'forbidden',
    title: 'Acción no permitida',
    detail: 'No tienes permisos para realizar esta acción.',
    retryable: false,
  },
  notFound: {
    kind: 'notFound',
    title: 'No encontramos lo que buscas',
    detail: 'Es posible que se haya movido o que ya no esté disponible.',
    retryable: false,
  },
  conflict: {
    kind: 'conflict',
    title: 'Ya está registrado',
    detail: 'Este elemento ya existe. Revisa la información antes de continuar.',
    retryable: false,
  },
  offline: {
    kind: 'offline',
    title: 'Sin conexión',
    detail: 'No pudimos conectarnos con el servidor. Verifica tu conexión e inténtalo de nuevo.',
    retryable: true,
  },
  timeout: {
    kind: 'timeout',
    title: 'Demasiado lento',
    detail: 'El servidor tardó mucho en responder. Inténtalo de nuevo en un momento.',
    retryable: true,
  },
  rateLimit: {
    kind: 'rateLimit',
    title: 'Demasiadas solicitudes',
    detail: 'Estás haciendo demasiadas acciones seguidas. Espera un momento e inténtalo de nuevo.',
    retryable: true,
  },
  server: {
    kind: 'server',
    title: 'Algo salió mal',
    detail: 'No pudimos completar esta acción en este momento. Inténtalo de nuevo más tarde.',
    retryable: true,
  },
  unknown: {
    kind: 'unknown',
    title: 'Ocurrió un problema inesperado',
    detail: 'Inténtalo de nuevo. Si el problema continúa, recarga la página.',
    retryable: true,
  },
};

/** Permite a una pantalla ajustar el texto de un tipo de error concreto. */
export type ErrorCopyOverrides = Partial<Record<ErrorKind, UserErrorCopy>>;

export function copyForKind(kind: ErrorKind, overrides?: ErrorCopyOverrides): UserErrorCopy {
  return overrides?.[kind] ?? COPY[kind];
}

/**
 * Respuestas con significado propio. El resto se agrupa: cualquier otro 5xx
 * es un fallo del servidor y cualquier otro 4xx queda como inesperado. El `0`
 * no es un código real: es la respuesta "no hubo respuesta" (red caída, CORS
 * o la petición nunca llegó), que para el usuario es lo mismo que estar sin
 * conexión.
 */
const STATUS_KINDS: Record<number, ErrorKind> = {
  0: 'offline',
  400: 'validation',
  401: 'auth',
  403: 'forbidden',
  404: 'notFound',
  408: 'timeout',
  409: 'conflict',
  422: 'validation',
  429: 'rateLimit',
  502: 'server',
  503: 'server',
  504: 'timeout',
};

export function kindForStatus(status: number): ErrorKind {
  const mapped = STATUS_KINDS[status];
  if (mapped) return mapped;
  if (status >= 500) return 'server';
  return 'unknown';
}

/**
 * Estado HTTP del fallo, o `null` si no es una respuesta HTTP.
 * Compatible con `HttpErrorResponse` sin importar `@angular/common/http`
 * (el prototipo no usa `HttpClient`, pero el contrato se mantiene para que el
 * día que haya backend real no haya que tocar nada).
 */
export function statusOf(err: unknown): number | null {
  if (typeof err !== 'object' || err === null) return null;
  const status = (err as { status?: unknown }).status;
  return typeof status === 'number' && Number.isFinite(status) ? status : null;
}

const KINDS: readonly ErrorKind[] = Object.keys(COPY) as ErrorKind[];

/** Un `kind` explícito en el error gana: así un servicio puede tipar un fallo. */
function declaredKind(err: unknown): ErrorKind | null {
  if (typeof err !== 'object' || err === null) return null;
  const kind = (err as { kind?: unknown }).kind;
  return typeof kind === 'string' && (KINDS as string[]).includes(kind)
    ? (kind as ErrorKind)
    : null;
}

function nameOf(err: unknown): string {
  return err instanceof Error ? err.name : '';
}

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return '';
}

/** Mensajes que el navegador emite cuando no hay servidor o se corta la red. */
const NETWORK_HINTS = [
  'failed to fetch',
  'networkerror',
  'network request failed',
  'load failed',
  'err_internet_disconnected',
  'err_connection',
];

function isNetworkFailure(err: unknown): boolean {
  const message = messageOf(err).toLowerCase();
  return NETWORK_HINTS.some((hint) => message.includes(hint));
}

function isOffline(): boolean {
  try {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
  } catch {
    return false;
  }
}

/** Clasifica cualquier valor lanzado en el tipo de error que entiende la UI. */
export function kindOf(err: unknown): ErrorKind {
  const declared = declaredKind(err);
  if (declared) return declared;

  const status = statusOf(err);
  if (status != null) return kindForStatus(status);

  const name = nameOf(err);
  if (name === 'TimeoutError' || name === 'AbortError') return 'timeout';

  if (isNetworkFailure(err) || isOffline()) return 'offline';

  return 'unknown';
}
