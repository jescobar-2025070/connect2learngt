import {
  AccessEntry,
  Achievement,
  AppNotification,
  ChatMessage,
  CommunityPost,
  CommunityReply,
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
  TutorReview,
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
  {
    id: 'tut-006',
    name: 'Andrés Luna',
    initials: 'AL',
    headline: 'Historia moderna y ciencias sociales',
    bio: 'Historiador y docente. Hago líneas de tiempo y análisis de fuentes para que dejes de memorizar y empieces a conectar las ideas.',
    subjects: ['Historia', 'Literatura'],
    rating: 4.6,
    reviews: 54,
    pricePerHour: 18,
    languages: ['Español', 'Portugués'],
    responseTime: 'Responde en ~5 h',
    sessionsGiven: 144,
    verified: false,
  },
  {
    id: 'tut-007',
    name: 'Natalia Ferrer',
    initials: 'NF',
    headline: 'Matemáticas desde cero · cálculo, álgebra y geometría',
    bio: 'Ingeniera industrial. Si las matemáticas se te hicieron bola, empezamos desde donde estés: sin vergüenza y a tu ritmo.',
    subjects: ['Matemáticas'],
    rating: 4.8,
    reviews: 71,
    pricePerHour: 24,
    languages: ['Español'],
    responseTime: 'Responde en ~1 h',
    sessionsGiven: 220,
    verified: true,
  },
  {
    id: 'tut-008',
    name: 'Ricardo Ochoa',
    initials: 'RO',
    headline: 'Inglés conversacional y académico',
    bio: 'TEFL certificado. Conversación para perder el miedo y escritura académica para aplicar a universidades en el extranjero.',
    subjects: ['Inglés'],
    rating: 4.7,
    reviews: 63,
    pricePerHour: 26,
    languages: ['Español', 'Inglés', 'Francés'],
    responseTime: 'Responde en ~3 h',
    sessionsGiven: 197,
    verified: true,
  },
  {
    id: 'tut-009',
    name: 'Valeria Ríos',
    initials: 'VR',
    headline: 'Biología, anatomía y preparación para exámenes',
    bio: 'Estudiante de microbiología. Trucos visuales y repasos guiados para que los nombres raros dejen de dar miedo.',
    subjects: ['Biología', 'Química'],
    rating: 4.9,
    reviews: 88,
    pricePerHour: 21,
    languages: ['Español'],
    responseTime: 'Responde en ~2 h',
    sessionsGiven: 276,
    verified: true,
  },
  {
    id: 'tut-010',
    name: 'Emilio Torres',
    initials: 'ET',
    headline: 'Programación Web · HTML, CSS, JavaScript',
    bio: 'Front-end developer en una agencia. Proyectos pequeños desde el día uno para que aprendas haciendo, no leyendo.',
    subjects: ['Programación', 'Diseño'],
    rating: 4.8,
    reviews: 104,
    pricePerHour: 29,
    languages: ['Español', 'Inglés'],
    responseTime: 'Responde en ~4 h',
    sessionsGiven: 312,
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
    downloads: 1200,
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
    downloads: 980,
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
    downloads: 3400,
    minutes: 30,
  },
  {
    id: 'res-004',
    subject: 'Química',
    title: 'Tabla periódica: trucos de memorización',
    description: 'Video de 15 minutos con reglas mnemotécnicas para grupos y propiedades.',
    author: 'Sofía Mendoza',
    type: 'Video',
    downloads: 2100,
    minutes: 15,
  },
  {
    id: 'res-005',
    subject: 'Inglés',
    title: 'Writing Task 2: conectores que suman puntos',
    description: 'Lista de conectores por función y cómo usarlos sin sonar repetitivo.',
    author: 'Carlos Ruiz',
    type: 'Guía',
    downloads: 1700,
    minutes: 12,
  },
  {
    id: 'res-006',
    subject: 'Programación',
    title: 'Tu primer proyecto en Python: 10 ejercicios',
    description: 'Ejercicios progresivos desde variables hasta un mini juego de consola.',
    author: 'Diego Paredes',
    type: 'Ejercicios',
    downloads: 760,
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
      '¿Alguien tiene un truco para acordarse de cuándo usar la regla de la cadena? Siempre la confundo con la del producto en los exámenes.',
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

export const POST_REPLIES: Record<string, CommunityReply[]> = {
  'post-001': [
    {
      id: 'rep-001',
      author: 'Diego Paredes',
      initials: 'DP',
      text: 'Regla de oro: si hay una función "dentro de otra", es cadena (ej. sen(3x²)). El producto aplica cuando son funciones multiplicadas, como x·e^x.',
      timeAgo: 'hace 9 min',
    },
    {
      id: 'rep-002',
      author: 'Camila Reyes',
      initials: 'CR',
      text: 'A mí me sirve escribir "afuera y adentro" arriba de cada función antes de derivar. Si hay anidación, cadena; si hay multiplicación, producto.',
      timeAgo: 'hace 6 min',
    },
    {
      id: 'rep-003',
      author: 'Mateo Salas',
      initials: 'MS',
      text: 'Truco: la regla de la cadena casi siempre es el último paso. Derivás la función de afuera primero y multiplicás por la derivada de adentro.',
      timeAgo: 'hace 2 min',
    },
  ],
  'post-002': [
    {
      id: 'rep-011',
      author: 'Joaquín Vera',
      initials: 'JV',
      text: '¡Me lo compartes por favor! Justo iba a intentar algo parecido para mi proyecto de cálculo de promedios.',
      timeAgo: 'hace 48 min',
    },
    {
      id: 'rep-012',
      author: 'Valentina Ortiz',
      initials: 'VO',
      text: 'Si lo subís a Recursos lo uso seguro. ¿Lo armaste con funciones o todo en un solo script?',
      timeAgo: 'hace 30 min',
    },
    {
      id: 'rep-013',
      author: 'Mateo Salas',
      initials: 'MS',
      text: 'Hecho, ya quedó el gist en el grupo de Programación. Cualquier duda me escriben.',
      timeAgo: 'hace 20 min',
    },
  ],
  'post-003': [
    {
      id: 'rep-021',
      author: 'Ana Martínez',
      initials: 'AM',
      text: 'El body doubling es real. Para exámenes de lectura a veces hacemos "sesiones silenciosas" en el club y la concentración sube muchísimo.',
      timeAgo: 'hace 2 h',
    },
    {
      id: 'rep-022',
      author: 'Sofía Mendoza',
      initials: 'SM',
      text: 'Yo hago 50/10 con la técnica de los 6 sentidos: reviso qué oí, vi y sentí al terminar cada tema. Mejoró mi retención.',
      timeAgo: 'hace 1 h',
    },
  ],
  'post-004': [
    {
      id: 'rep-031',
      author: 'Camila Reyes',
      initials: 'CR',
      text: '¡Gracias Joaquín! ¿El resumen incluye a Lorca y Alberti o solo los temas del poemario?',
      timeAgo: 'hace 4 h',
    },
    {
      id: 'rep-032',
      author: 'Joaquín Vera',
      initials: 'JV',
      text: 'Incluye el contexto, los poetas principales y los temas recurrentes. Lorca y Alberti van con un apartado aparte.',
      timeAgo: 'hace 3 h',
    },
  ],
};

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ntf-001',
    icon: 'heart',
    text: 'Camila Reyes reaccionó a tu publicación "Terminé mi primer proyecto en Python".',
    timeAgo: 'hace 5 min',
    unread: true,
  },
  {
    id: 'ntf-002',
    icon: 'reply',
    text: 'Mateo Salas respondió en el grupo Cálculo I: "Exacto, ese es el truco…"',
    timeAgo: 'hace 25 min',
    unread: true,
  },
  {
    id: 'ntf-003',
    icon: 'calendar',
    text: 'Tu tutoría con Laura Gómez comienza mañana a las 10:00 (Videollamada).',
    timeAgo: 'hace 3 h',
    unread: true,
  },
  {
    id: 'ntf-004',
    icon: 'star',
    text: '¡Logro desbloqueado! Ratón de biblioteca: leíste 5 recursos compartidos.',
    timeAgo: 'hace 1 día',
    unread: false,
  },
  {
    id: 'ntf-005',
    icon: 'users',
    text: 'Diego Paredes aceptó tu solicitud para unirte a "Proyectos en Python".',
    timeAgo: 'hace 2 días',
    unread: false,
  },
];

export const ACCESS_HISTORY: AccessEntry[] = [
  {
    id: 'acc-001',
    icon: 'profile',
    text: 'Marcela Rivera vio el resumen semanal de tu progreso (Matemáticas 85%).',
    timeAgo: 'lunes, 20:14',
  },
  {
    id: 'acc-002',
    icon: 'calendar',
    text: 'Marcela Rivera consultó tus próximas sesiones de tutoría.',
    timeAgo: 'lunes, 20:15',
  },
  {
    id: 'acc-003',
    icon: 'profile',
    text: 'Iniciaste sesión, la actividad quedó registrada como privada (no compartida).',
    timeAgo: 'hoy, 08:02',
  },
  {
    id: 'acc-004',
    icon: 'shield',
    text: 'Se revocó el acceso temporal de un dispositivo nuevo tras detectar otra ciudad de ingreso.',
    timeAgo: 'hace 3 días',
  },
  {
    id: 'acc-005',
    icon: 'community',
    text: 'Marcela Rivera revisó tu participación en el grupo "Cálculo I — Repaso semanal".',
    timeAgo: 'hace 5 días',
  },
];

export const TUTOR_REVIEWS: Record<string, TutorReview[]> = {
  'tut-001': [
    {
      id: 'rev-001',
      author: 'Valentina Ortiz',
      rating: 5,
      comment:
        'Laura explica la regla de la cadena de una forma que por fin entendí. Usa ejemplos visuales y nunca se impacienta.',
      timeAgo: 'hace 2 semanas',
    },
    {
      id: 'rev-002',
      author: 'Mateo Salas',
      rating: 5,
      comment:
        'Preparó 5 ejercicios de menor a mayor dificultad exactamente como le pedí. Se nota que arma cada clase.',
      timeAgo: 'hace 1 mes',
    },
    {
      id: 'rev-003',
      author: 'Joaquín Vera',
      rating: 4,
      comment:
        'Muy sólida para cálculo. A veces se pasa de rápida, pero si preguntas lo vuelve a explicar con gusto.',
      timeAgo: 'hace 2 meses',
    },
  ],
  'tut-002': [
    {
      id: 'rev-011',
      author: 'Camila Reyes',
      rating: 5,
      comment:
        'Me preparó para el TOEFL y subí de banda en el primer intento. Material y mock tests muy buenos.',
      timeAgo: 'hace 3 semanas',
    },
    {
      id: 'rev-012',
      author: 'Andrés Luna',
      rating: 5,
      comment: 'Las clases de conversación son dinámicas y se enfoca en los errores que más restan puntos.',
      timeAgo: 'hace 1 mes',
    },
  ],
  'tut-003': [
    {
      id: 'rev-021',
      author: 'Camila Reyes',
      rating: 5,
      comment:
        'Ana comentó mi ensayo línea por línea y me dio una plantilla para el análisis de la generación del 27. Nota máxima.',
      timeAgo: 'hace 1 semana',
    },
  ],
  'tut-004': [
    {
      id: 'rev-031',
      author: 'Mateo Salas',
      rating: 5,
      comment:
        'Diego te enseña con proyectos reales: salimos de la primera clase con una página publicada. Cero teoría aburrida.',
      timeAgo: 'hace 2 semanas',
    },
  ],
  'tut-005': [
    {
      id: 'rev-041',
      author: 'Valentina Ortiz',
      rating: 5,
      comment: 'Los mapas mentales de Sofía son oro puro para memorizar química orgánica.',
      timeAgo: 'hace 3 semanas',
    },
  ],
};

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
    icon: 'flame',
    title: 'Racha de estudio',
    description: '14 días seguidos conectándote.',
    unlocked: true,
  },
  {
    id: 'ach-002',
    icon: 'book',
    title: 'Ratón de biblioteca',
    description: 'Leíste 5 recursos compartidos.',
    unlocked: true,
  },
  {
    id: 'ach-003',
    icon: 'users',
    title: 'Trabajo en equipo',
    description: 'Te uniste a 3 grupos de estudio.',
    unlocked: true,
  },
  {
    id: 'ach-004',
    icon: 'lightbulb',
    title: 'Innovador',
    description: 'Publica una guía original para desbloquear.',
    unlocked: false,
  },
  {
    id: 'ach-005',
    icon: 'mic',
    title: 'Mentor',
    description: 'Da 5 sesiones de tutoría para desbloquear.',
    unlocked: false,
  },
  {
    id: 'ach-006',
    icon: 'award',
    title: 'Maratón',
    description: 'Completa 20 h de estudio en un mes.',
    unlocked: false,
  },
];

export const REWARDS: RewardEntry[] = [
  { id: 'rw-001', icon: 'trophy', label: 'Mejor aporte de la semana', points: '+150 Rep' },
  { id: 'rw-002', icon: 'check', label: 'Semana perfecta', points: '+300 XP' },
  { id: 'rw-003', icon: 'users', label: 'Compañero servicial', points: '+50 Rep' },
  { id: 'rw-004', icon: 'book', label: 'Recurso más descargado', points: '+120 Rep' },
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
    preview: 'Te dejé comentarios en tu ensayo',
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
      text: 'Hola! Te dejé comentarios en tu ensayo sobre la generación del 27',
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
      text: 'Perfecto, sin apuro. La estructura ya está muy encaminada.',
      time: 'Lun 09:33',
      mine: false,
    },
  ],
};

/**
 * Hilo de chat por defecto para un grupo de estudio sin conversación propia
 * en el mock. Se genera a partir del nombre del grupo para que "Abrir chat
 * del grupo" siempre tenga algo que mostrar.
 */
export function groupChatFor(group: StudyGroup): ChatMessage[] {
  const i = (group.id.length || 0) % 3;
  const members: Array<{ name: string; initials: string }> = [
    { name: 'Mateo Salas', initials: 'MS' },
    { name: 'Valentina Ortiz', initials: 'VO' },
    { name: 'Joaquín Vera', initials: 'JV' },
  ];
  const lead = members[i];
  const second = members[(i + 1) % members.length];
  return [
    {
      id: `grp-msg-${group.id}-1`,
      author: lead.name,
      authorInitials: lead.initials,
      text: `¡Bienvenidos al grupo "${group.name}"! ${group.meetingSchedule === 'Por definir' ? 'Vamos a coordinar el primer encuentro esta semana.' : 'El primer encuentro está planificado: ' + group.meetingSchedule + '.'}`,
      time: 'hoy 09:10',
      mine: false,
    },
    {
      id: `grp-msg-${group.id}-2`,
      author: `${second.name}`,
      authorInitials: second.initials,
      text: 'Buena idea. ¿Compartimos un recurso inicial para ponernos al día antes de la reunión?',
      time: 'hoy 09:24',
      mine: false,
    },
    {
      id: `grp-msg-${group.id}-3`,
      author: '__me__',
      authorInitials: '__me__',
      text: 'Perfecto, yo también estaré. Ahí llego con mis apuntes.',
      time: 'hoy 09:31',
      mine: true,
    },
  ];
}

/** Hilo por defecto al contactar a un tutor desde su perfil. */
export function tutorChatFor(tutor: Tutor): ChatMessage[] {
  return [
    {
      id: `ttr-msg-${tutor.id}-1`,
      author: tutor.name,
      authorInitials: tutor.initials,
      text: `¡Hola! Soy ${tutor.name.split(' ')[0]}. Vi que me escribiste por ${tutor.subjects.join(' y ')}. ¿Qué tema quieres reforzar?`,
      time: 'hoy 11:05',
      mine: false,
    },
    {
      id: `ttr-msg-${tutor.id}-2`,
      author: '__me__',
      authorInitials: '__me__',
      text: `Hola, sí. Estoy preparando ${tutor.subjects[0] ?? 'la materia'} y quería coordinar una sesión antes del examen.`,
      time: 'hoy 11:12',
      mine: true,
    },
    {
      id: `ttr-msg-${tutor.id}-3`,
      author: tutor.name,
      authorInitials: tutor.initials,
      text: `${tutor.responseTime}. Puedes reservar un horario desde mi perfil y dejarme una nota con lo que quieres ver.`,
      time: 'hoy 11:20',
      mine: false,
    },
  ];
}

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
