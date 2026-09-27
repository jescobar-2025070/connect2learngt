import { UserRole } from './models';

/**
 * Permisos por rol, en un solo sitio.
 *
 * Antes esta información vivía duplicada: `NAV_ITEMS` en el shell declaraba qué
 * roles veían cada sección, y las rutas no comprobaban nada. El padre tenía
 * Tutorías, Grupos y Reputación ocultos en el menú, pero podía entrar por URL
 * (o desde la búsqueda de Inicio) y agendar una tutoría, escribir en un chat o
 * unirse a un grupo.
 *
 * Aquí vive la respuesta: qué roles alcanzan cada sección y qué puede hacer
 * cada rol dentro de ella. La consumen el menú lateral, el guard de rutas y las
 * propias pantallas, así que ocultar una sección y bloquearla ya no pueden
 * desincronizarse.
 */

/** Clave de sección: coincide con el `data.section` de cada ruta. */
export type SectionKey =
  | 'intereses'
  | 'inicio'
  | 'tutores'
  | 'comunidad'
  | 'recursos'
  | 'grupos'
  | 'mensajes'
  | 'reputacion'
  | 'familia'
  | 'perfil';

/** Qué roles alcanzan cada sección. Sin entrada, la sección no existe. */
export const SECTION_ROLES: Record<SectionKey, readonly UserRole[]> = {
  // El onboarding elige qué aprendes o qué impartes: el padre no estudia para sí
  // mismo, se vincula a su hijo con un código.
  intereses: ['Estudiante', 'Tutor'],
  // El panel personal es del estudiante y del docente. El padre no tiene
  // actividad propia que ver: su panel es el de su hijo (`familia`).
  inicio: ['Estudiante', 'Tutor'],
  // El padre entra para agendar sesiones a nombre del hijo, nunca para sí
  // mismo: la reserva se atribuye al hijo vinculado (`Booking.forChildId`).
  tutores: ['Estudiante', 'Tutor', 'Padre'],
  // Solo lectura para el padre: sin compositor, sin "me gusta", sin respuestas.
  comunidad: ['Estudiante', 'Tutor', 'Padre'],
  // El padre descarga los materiales del hijo, pero no publica recursos.
  recursos: ['Estudiante', 'Tutor', 'Padre'],
  grupos: ['Estudiante', 'Tutor'],
  mensajes: ['Estudiante', 'Tutor'],
  reputacion: ['Estudiante', 'Tutor'],
  familia: ['Estudiante', 'Padre'],
  perfil: ['Estudiante', 'Tutor', 'Padre'],
};

/** Qué puede hacer un rol dentro de la aplicación. */
export interface Capabilities {
  /** Escribir en la comunidad: publicar, responder y reaccionar. */
  publish: boolean;
  /** Publicar recursos nuevos en la biblioteca. */
  upload: boolean;
  /** Abrir chats con tutores o grupos. */
  chat: boolean;
  /** Unirse a grupos de estudio. */
  joinGroups: boolean;
  /** Reservar una tutoría para sí mismo. */
  bookForSelf: boolean;
  /** Reservar una tutoría para un hijo vinculado. */
  bookForChild: boolean;
  /** Agendar los permisos de "Qué compartimos" de la cuenta propia. */
  manageSharing: boolean;
  /** Ver los datos del hijo: progreso, sesiones y tutores. */
  viewChild: boolean;
}

const FULL: Capabilities = {
  publish: true,
  upload: true,
  chat: true,
  joinGroups: true,
  bookForSelf: true,
  bookForChild: false,
  manageSharing: true,
  viewChild: false,
};

export const ROLE_CAPABILITIES: Record<UserRole, Capabilities> = {
  'Estudiante': { ...FULL },
  'Tutor': { ...FULL },
  'Padre': {
    publish: false,
    upload: false,
    chat: false,
    joinGroups: false,
    // Nunca una tutoría para sí mismo: solo para el hijo vinculado.
    bookForSelf: false,
    bookForChild: true,
    // Lo que el padre ve de su hijo lo autoriza el hijo, no el padre.
    manageSharing: false,
    viewChild: true,
  },
};

/** `true` si el rol puede entrar en la sección. */
export function canAccessSection(role: UserRole, section: string): boolean {
  const allowed = SECTION_ROLES[section as SectionKey];
  return !!allowed && allowed.includes(role);
}

/** Capacidades del rol, para leerlas desde una pantalla. */
export function capabilitiesOf(role: UserRole): Capabilities {
  return ROLE_CAPABILITIES[role];
}
