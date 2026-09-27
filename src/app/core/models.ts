/** Modelos de dominio del prototipo. Todos los datos son simulados. */

/**
 * Roles soportados por el prototipo. `estudiante` es el rol original y sigue
 * siendo el valor por defecto para las sesiones ya persistidas.
 */
export type UserRole = 'estudiante' | 'tutor' | 'padre';

/** Etiquetas y textos del selector de rol del registro. */
export interface RoleOption {
  id: UserRole;
  label: string;
  tagline: string;
  icon: string;
  /** `null` = sin edad mínima (el docente puede empezar a enseñar adulto). */
  ageMin: number | null;
  ageMax: number;
  /** El padre se vincula a un hijo con un código: no elige intereses propios. */
  onboarding: 'intereses' | 'materias' | 'vinculacion';
  startRoute: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'estudiante',
    label: 'Estudiante',
    tagline: 'Aprende, publica y participa en la comunidad',
    icon: 'profile',
    ageMin: 15,
    ageMax: 25,
    onboarding: 'intereses',
    startRoute: '/app/inicio',
  },
  {
    id: 'tutor',
    label: 'Maestro / Tutor',
    tagline: 'Da clases, gestiona tu agenda y mide tu reputación',
    icon: 'tutors',
    ageMin: null,
    ageMax: 100,
    onboarding: 'materias',
    startRoute: '/app/inicio',
  },
  {
    id: 'padre',
    label: 'Padre de familia',
    tagline: 'Acompaña el progreso de tu hijo con un código',
    icon: 'shield',
    ageMin: null,
    ageMax: 100,
    onboarding: 'vinculacion',
    startRoute: '/app/familia',
  },
];

export function roleOption(role: UserRole): RoleOption {
  return ROLE_OPTIONS.find((r) => r.id === role) ?? ROLE_OPTIONS[0];
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  age: number;
  institution: string;
  /** Grado/curso del estudiante; materia principal del docente. */
  grade: string;
  /** Temas de interés (estudiante) o materias que imparte (docente). */
  interests: string[];
  initials: string;
  /** Código de vinculación del hijo; solo para el rol padre. */
  childCode?: string;
}

export interface Tutor {
  id: string;
  name: string;
  initials: string;
  headline: string;
  bio: string;
  subjects: string[];
  rating: number;
  reviews: number;
  pricePerHour: number;
  languages: string[];
  responseTime: string;
  sessionsGiven: number;
  verified: boolean;
}

export interface TutorSlot {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  dayLabel: string;
  dayNumber: string;
  time: string;
  available: boolean;
}

export interface Booking {
  id: string;
  tutorName: string;
  tutorInitials: string;
  subject: string;
  date: string;
  time: string;
  modality: string;
  goal: string;
}

export interface ResourceItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  author: string;
  type: 'PDF' | 'Video' | 'Guía' | 'Ejercicios';
  downloads: number;
  minutes: number;
}

export interface CommunityPost {
  id: string;
  author: string;
  initials: string;
  role: string;
  topic: string;
  timeAgo: string;
  content: string;
  likes: number;
  replies: number;
}

export interface CommunityReply {
  id: string;
  author: string;
  initials: string;
  text: string;
  timeAgo: string;
}

export interface AppNotification {
  id: string;
  icon: string;
  text: string;
  timeAgo: string;
  unread: boolean;
}

export interface AccessEntry {
  id: string;
  icon: string;
  text: string;
  timeAgo: string;
}

export interface TutorReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  timeAgo: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface RewardEntry {
  id: string;
  label: string;
  points: string;
  icon: string;
}

export interface Conversation {
  id: string;
  name: string;
  initials: string;
  preview: string;
  timeAgo: string;
  unread: number;
}

export interface ChatMessage {
  id: string;
  author: string;
  authorInitials: string;
  text: string;
  time: string;
  mine: boolean;
}

export interface SubjectProgress {
  subject: string;
  percent: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  memberCount: number;
  memberInitials: string[];
  meetingSchedule: string;
  isPrivate: boolean;
  joined: boolean;
}

export interface GroupMember {
  id: string;
  name: string;
  initials: string;
  role: 'admin' | 'member';
}

export interface Guardian {
  id: string;
  name: string;
  initials: string;
  email: string;
  relationship: string;
  status: 'active' | 'pending';
  linkedSince: string;
}

export interface SharingPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface HomeSummary {
  weeklyGoalPercent: number;
  studyStreak: number;
  hoursThisWeek: number;
  nextSession: Booking | null;
  recommendedResource: ResourceItem;
  featuredTutor: Tutor;
  subjectProgress: SubjectProgress[];
}
