import {
  Achievement,
  ChatMessage,
  CommunityPost,
  Conversation,
  GroupMember,
  Guardian,
  ResourceItem,
  RewardEntry,
  SharingPreference,
  StudentProfile,
  StudyGroup,
  SubjectProgress,
  Tutor,
  TutorSlot,
} from './models';

/* ------------------------------------------------------------------
   Datos simulados (mock). No hay backend: todo vive en memoria.
   ------------------------------------------------------------------ */

export const INTEREST_TOPICS: string[] = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Literatura',
  'Historia',
  'Inglés',
  'Programación',
  'Diseño',
  'Emprendimiento',
  'Psicología',
  'Música',
];

export const DEMO_STUDENT: StudentProfile = {
  id: 'stu-001',
  name: 'Alex Rivera',
  email: 'alex.rivera@estudiante.edu',
  age: 17,
  institution: 'Colegio San Marcos',
  grade: '5to Bachillerato',
  interests: [],
  initials: 'AR',
};

export const TUTORS: Tutor[] = [
  {
    id: 'tut-001',
    name: 'Laura Gómez',
    initials: 'LG',
    headline: 'Matemáticas avanzadas y Física',
    bio: 'Ingeniera con 6 años enseñando cálculo y álgebra a estudiantes de bachillerato. Clases con ejemplos visuales y ejercicios guiados paso a paso.',
    subjects: ['Matemáticas', 'Física'],
    rating: 4.9,
    reviews: 128,
    pricePerHour: 25,
    languages: ['Español', 'Inglés'],
    responseTime: 'Responde en ~2 h',
    sessionsGiven: 430,
    verified: true,
  },
  {
    id: 'tut-002',
    name: 'Carlos Ruiz',
    initials: 'CR',
    headline: 'Inglés académico · TOEFL y Cambridge',
    bio: 'Profesor bilingüe certificado. Preparación de exámenes internacionales y conversación para estudiantes que quieren aplicar a universidades.',
    subjects: ['Inglés', 'Literatura'],
    rating: 4.7,
    reviews: 85,
    pricePerHour: 30,
    languages: ['Español', 'Inglés'],
    responseTime: 'Responde en ~4 h',
    sessionsGiven: 260,
    verified: true,
  },
  {
    id: 'tut-003',
    name: 'Ana Martínez',
    initials: 'AM',
    headline: 'Literatura y escritura creativa',
    bio: 'Licenciada en Letras. Acompaño ensayos, análisis literario y técnicas de escritura para que entregues trabajos con voz propia.',
    subjects: ['Literatura', 'Historia'],
    rating: 5.0,
    reviews: 210,
    pricePerHour: 20,
    languages: ['Español'],
    responseTime: 'Responde en ~1 h',
    sessionsGiven: 512,
    verified: true,
  },
  {
    id: 'tut-004',
    name: 'Diego Paredes',
    initials: 'DP',
    headline: 'Programación · Python y web',
    bio: 'Desarrollador full-stack. Enseño desde cero con proyectos reales: tu primera página, tu primer script, tu primer portafolio.',
    subjects: ['Programación', 'Matemáticas'],
    rating: 4.8,
    reviews: 96,
    pricePerHour: 28,
    languages: ['Español'],
    responseTime: 'Responde en ~3 h',
    sessionsGiven: 188,
    verified: true,
  },
  {
    id: 'tut-005',
    name: 'Sofía Mendoza',
    initials: 'SM',
    headline: 'Química y Biología',
    bio: 'Estudiante de Medicina en último año. Explico ciencias con mapas mentales y trucos de memorización que sí funcionan en exámenes.',
    subjects: ['Química', 'Biología'],
    rating: 4.9,
    reviews: 143,
    pricePerHour: 22,
    languages: ['Español'],
    responseTime: 'Responde en ~2 h',
    sessionsGiven: 305,
    verified: true,
  },
];

export function buildSlots(): TutorSlot[] {
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const times = ['09:00', '11:00', '15:00', '17:00'];
  const slots: TutorSlot[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);

  for (let d = 0; d < 6; d++) {
    const date = new Date(start);
    date.setDate(start.getDate() + d);
    const iso = date.toISOString().slice(0, 10);
    times.forEach((time, i) => {
      slots.push({
        id: `slot-${d}-${i}`,
        date: iso,
        dayLabel: days[date.getDay() === 0 ? 5 : date.getDay() - 1] ?? days[d % 6],
        dayNumber: String(date.getDate()).padStart(2, '0'),
        time,
        // Un patrón fijo de ocupación para que el prototipo se sienta real.
        available: !((d + i) % 3 === 0 && i !== 1),
      });
    });
  }
  return slots;
}

export const RESOURCES: ResourceItem[] = [
  {
    id: 'res-001',
    subject: 'Física',
    title: 'Guía visual: Movimiento rectilíneo uniforme',
    description:
      'Fórmulas, gráficas explicadas y 12 ejercicios resueltos paso a paso para el primer parcial.',
    author: 'Laura Gómez',
    type: 'PDF',
    downloads: '1.2k',
    minutes: 25,
  },
  {
    id: 'res-002',
    subject: 'Matemáticas',
    title: 'Derivadas sin miedo: reglas básicas',
    description:
      'Resumen de la regla de la cadena, producto y cociente con ejemplos cortos y errores comunes.',
    author: 'Diego Paredes',
    type: 'Guía',
    downloads: '980',
    minutes: 18,
  },
  {
    id: 'res-003',
    subject: 'Literatura',
    title: 'Cómo estructurar un ensayo argumentativo',
    description:
      'Plantilla de introducción, desarrollo y conclusión, con un ejemplo completo comentado.',
    author: 'Ana Martínez',
    type: 'PDF',
    downloads: '3.4k',
    minutes: 30,
  },
  {
    id: 'res-004',
    subject: 'Química',
    title: 'Tabla periódica: trucos de memorización',
    description: 'Video de 15 minutos con reglas mnemotécnicas para grupos y propiedades.',
    author: 'Sofía Mendoza',
    type: 'Video',
    downloads: '2.1k',
    minutes: 15,
  },
  {
    id: 'res-005',
    subject: 'Inglés',
    title: 'Writing Task 2: conectores que suman puntos',
    description: 'Lista de conectores por función y cómo usarlos sin sonar repetitivo.',
    author: 'Carlos Ruiz',
    type: 'Guía',
    downloads: '1.7k',
    minutes: 12,
  },
  {
    id: 'res-006',
    subject: 'Programación',
    title: 'Tu primer proyecto en Python: 10 ejercicios',
    description: 'Ejercicios progresivos desde variables hasta un mini juego de consola.',
    author: 'Diego Paredes',
    type: 'Ejercicios',
    downloads: '760',
    minutes: 45,
  },
];

export const POSTS: CommunityPost[] = [
  {
    id: 'post-001',
    author: 'Valentina Ortiz',
    initials: 'VO',
    role: 'Estudiante · 4to Bach',
    topic: 'Matemáticas',
    timeAgo: 'hace 12 min',
    content:
      '¿Alguien tiene un truco para acordarse de cuándo usar la regla de la cadena? Siempre la confundo con la del producto en los exámenes 😅',
    likes: 24,
    replies: 8,
  },
  {
    id: 'post-002',
    author: 'Mateo Salas',
    initials: 'MS',
    role: 'Estudiante · 5to Bach',
    topic: 'Programación',
    timeAgo: 'hace 1 h',
    content:
      'Terminé mi primer proyecto en Python: una calculadora de notas. Si alguien quiere el código para practicar, lo comparto en los comentarios.',
    likes: 57,
    replies: 14,
  },
  {
    id: 'post-003',
    author: 'Camila Reyes',
    initials: 'CR',
    role: 'Estudiante · 1er año Univ.',
    topic: 'Técnicas de estudio',
    timeAgo: 'hace 3 h',
    content:
      'Llevo 3 semanas con el método Pomodoro (25/5) y por fin dejé de procrastinar. Lo mejor: estudiar con alguien en videollamada aunque sea en silencio.',
    likes: 112,
    replies: 23,
  },
  {
    id: 'post-004',
    author: 'Joaquín Vera',
    initials: 'JV',
    role: 'Estudiante · 6to Bach',
    topic: 'Literatura',
    timeAgo: 'hace 5 h',
    content:
      'Para quienes rinden literatura la próxima semana: hice un resumen de los temas de la generación del 27. Lo subí a Recursos por si les sirve.',
    likes: 38,
    replies: 6,
  },
];

export const TRENDING_TOPICS: string[] = [
  '#PreparaciónExámenes',
  '#HábitosDeEstudio',
  '#Matemáticas',
  '#Programación',
  '#Becas2026',
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-001',
    icon: '🔥',
    title: 'Racha de estudio',
    description: '14 días seguidos conectándote.',
    unlocked: true,
  },
  {
    id: 'ach-002',
    icon: '📖',
    title: 'Ratón de biblioteca',
    description: 'Leíste 5 recursos compartidos.',
    unlocked: true,
  },
  {
    id: 'ach-003',
    icon: '👥',
    title: 'Trabajo en equipo',
    description: 'Te uniste a 3 grupos de estudio.',
    unlocked: true,
  },
  {
    id: 'ach-004',
    icon: '💡',
    title: 'Innovador',
    description: 'Publica una guía original para desbloquear.',
    unlocked: false,
  },
  {
    id: 'ach-005',
    icon: '🎙️',
    title: 'Mentor',
    description: 'Da 5 sesiones de tutoría para desbloquear.',
    unlocked: false,
  },
  {
    id: 'ach-006',
    icon: '🏅',
    title: 'Maratón',
    description: 'Completa 20 h de estudio en un mes.',
    unlocked: false,
  },
];

export const REWARDS: RewardEntry[] = [
  { id: 'rw-001', icon: '🏆', label: 'Mejor aporte de la semana', points: '+150 Rep' },
  { id: 'rw-002', icon: '✅', label: 'Semana perfecta', points: '+300 XP' },
  { id: 'rw-003', icon: '🤝', label: 'Compañero servicial', points: '+50 Rep' },
  { id: 'rw-004', icon: '📚', label: 'Recurso más descargado', points: '+120 Rep' },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-001',
    name: 'Laura Gómez',
    initials: 'LG',
    preview: 'Perfecto, nos vemos mañana a las 10:00.',
    timeAgo: '10:24',
    unread: 2,
  },
  {
    id: 'conv-002',
    name: 'Grupo: Cálculo I',
    initials: 'GC',
    preview: 'Mateo: subí los ejercicios del capítulo 3',
    timeAgo: 'Ayer',
    unread: 3,
  },
  {
    id: 'conv-003',
    name: 'Ana Martínez',
    initials: 'AM',
    preview: 'Te dejé comentarios en tu ensayo 👌',
    timeAgo: 'Lun',
    unread: 0,
  },
];

/**
 * Hilos de mensajes por conversación. Antes, cambiar de conversación en la
 * lista no cambiaba el contenido del chat (siempre se veía el mismo guion
 * con Laura Gómez); ahora cada conversación tiene sus propios mensajes y
 * remitentes reales — importante sobre todo en el grupo, donde varias
 * personas distintas escriben. El mensaje "mine: true" se re-etiqueta en
 * tiempo de ejecución con el nombre real de la sesión (ver messages.ts).
 */
export const MESSAGES_BY_CONVERSATION: Record<string, ChatMessage[]> = {
  'conv-001': [
    {
      id: 'msg-001',
      author: 'Laura Gómez',
      authorInitials: 'LG',
      text: '¡Hola! Vi que reservaste la sesión de mañana. ¿Qué tema quieres reforzar?',
      time: '10:02',
      mine: false,
    },
    {
      id: 'msg-002',
      author: '__me__',
      authorInitials: '__me__',
      text: 'Hola profe. Sobre todo derivadas, me cuesta la regla de la cadena.',
      time: '10:15',
      mine: true,
    },
    {
      id: 'msg-003',
      author: 'Laura Gómez',
      authorInitials: 'LG',
      text: 'Genial. Te preparo 5 ejercicios de menor a mayor dificultad y los vemos juntos.',
      time: '10:20',
      mine: false,
    },
    {
      id: 'msg-004',
      author: 'Laura Gómez',
      authorInitials: 'LG',
      text: 'Perfecto, nos vemos mañana a las 10:00.',
      time: '10:24',
      mine: false,
    },
  ],
  'conv-002': [
    {
      id: 'msg-101',
      author: 'Mateo Salas',
      authorInitials: 'MS',
      text: 'Subí los ejercicios del capítulo 3 a Recursos, por si quieren practicar antes del parcial.',
      time: 'Ayer 18:40',
      mine: false,
    },
    {
      id: 'msg-102',
      author: 'Valentina Ortiz',
      authorInitials: 'VO',
      text: 'Gracias! ¿Alguien entendió el ejercicio 7? Me da un resultado distinto al del libro.',
      time: 'Ayer 19:02',
      mine: false,
    },
    {
      id: 'msg-103',
      author: '__me__',
      authorInitials: '__me__',
      text: 'Yo también me trabé ahí. Creo que hay que aplicar la regla del cociente primero.',
      time: 'Ayer 19:10',
      mine: true,
    },
    {
      id: 'msg-104',
      author: 'Mateo Salas',
      authorInitials: 'MS',
      text: 'Exacto, ese es el truco. Mañana antes de la sesión con Laura lo repasamos juntos.',
      time: 'Ayer 19:15',
      mine: false,
    },
  ],
  'conv-003': [
    {
      id: 'msg-201',
      author: 'Ana Martínez',
      authorInitials: 'AM',
      text: 'Hola! Te dejé comentarios en tu ensayo sobre la generación del 27 👌',
      time: 'Lun 09:12',
      mine: false,
    },
    {
      id: 'msg-202',
      author: '__me__',
      authorInitials: '__me__',
      text: '¡Genial, gracias! ¿Lo reviso y te lo reenvío esta semana?',
      time: 'Lun 09:30',
      mine: true,
    },
    {
      id: 'msg-203',
      author: 'Ana Martínez',
      authorInitials: 'AM',
      text: 'Perfecto, sin apuro. La estructura ya está muy bien encaminada.',
      time: 'Lun 09:33',
      mine: false,
    },
  ],
};

export const SUBJECT_PROGRESS: SubjectProgress[] = [
  { subject: 'Matemáticas', percent: 85 },
  { subject: 'Física', percent: 72 },
  { subject: 'Literatura', percent: 64 },
  { subject: 'Inglés', percent: 91 },
];

export const STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'grp-001',
    name: 'Cálculo I — Repaso semanal',
    subject: 'Matemáticas',
    description:
      'Repasamos límites, derivadas e integrales antes de cada parcial. Compartimos ejercicios resueltos y dudas.',
    memberCount: 18,
    memberInitials: ['MS', 'VO', 'JV', 'CR'],
    meetingSchedule: 'Martes y jueves, 19:00',
    isPrivate: false,
    joined: true,
  },
  {
    id: 'grp-002',
    name: 'Club de lectura: Generación del 27',
    subject: 'Literatura',
    description: 'Leemos y comentamos un poema por semana. Ideal si rindes literatura este semestre.',
    memberCount: 12,
    memberInitials: ['AM', 'JV', 'CR'],
    meetingSchedule: 'Viernes, 17:00',
    isPrivate: false,
    joined: false,
  },
  {
    id: 'grp-003',
    name: 'Física para el examen de admisión',
    subject: 'Física',
    description:
      'Grupo enfocado en mecánica y ondas para quienes preparan examen de admisión a la universidad.',
    memberCount: 9,
    memberInitials: ['LG', 'MS'],
    meetingSchedule: 'Lunes, 18:30',
    isPrivate: false,
    joined: false,
  },
  {
    id: 'grp-004',
    name: 'Proyectos en Python',
    subject: 'Programación',
    description: 'Compartimos proyectos personales y nos ayudamos a debuggear. Todos los niveles.',
    memberCount: 24,
    memberInitials: ['DP', 'MS', 'VO', 'JV', 'CR'],
    meetingSchedule: 'Miércoles, 20:00',
    isPrivate: false,
    joined: true,
  },
  {
    id: 'grp-005',
    name: 'Inglés conversacional B2',
    subject: 'Inglés',
    description: 'Practicamos conversación en videollamada. Ambiente relajado, sin miedo a equivocarse.',
    memberCount: 15,
    memberInitials: ['CR', 'AM'],
    meetingSchedule: 'Sábados, 11:00',
    isPrivate: true,
    joined: false,
  },
];

export const GROUP_MEMBERS: Record<string, GroupMember[]> = {
  'grp-001': [
    { id: 'mem-1', name: 'Mateo Salas', initials: 'MS', role: 'admin' },
    { id: 'mem-2', name: 'Valentina Ortiz', initials: 'VO', role: 'member' },
    { id: 'mem-3', name: 'Joaquín Vera', initials: 'JV', role: 'member' },
    { id: 'mem-4', name: 'Camila Reyes', initials: 'CR', role: 'member' },
  ],
  'grp-004': [
    { id: 'mem-5', name: 'Diego Paredes', initials: 'DP', role: 'admin' },
    { id: 'mem-2', name: 'Valentina Ortiz', initials: 'VO', role: 'member' },
    { id: 'mem-3', name: 'Joaquín Vera', initials: 'JV', role: 'member' },
    { id: 'mem-4', name: 'Camila Reyes', initials: 'CR', role: 'member' },
    { id: 'mem-1', name: 'Mateo Salas', initials: 'MS', role: 'member' },
  ],
};

export const GUARDIANS: Guardian[] = [
  {
    id: 'gd-001',
    name: 'Marcela Rivera',
    initials: 'MR',
    email: 'marcela.rivera@gmail.com',
    relationship: 'Madre',
    status: 'active',
    linkedSince: 'Marzo 2025',
  },
];

export const SHARING_PREFERENCES: SharingPreference[] = [
  {
    id: 'pref-progress',
    label: 'Progreso académico',
    description: 'Avance por materia y metas semanales.',
    enabled: true,
  },
  {
    id: 'pref-tutoring',
    label: 'Sesiones de tutoría',
    description: 'Fechas, tutores y temas de cada sesión agendada.',
    enabled: true,
  },
  {
    id: 'pref-summary',
    label: 'Resumen semanal por correo',
    description: 'Un correo cada domingo con lo más destacado de la semana.',
    enabled: false,
  },
  {
    id: 'pref-community',
    label: 'Actividad en la comunidad',
    description: 'Publicaciones y participación en grupos de estudio.',
    enabled: false,
  },
];
