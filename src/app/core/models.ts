/** Modelos de dominio del prototipo. Todos los datos son simulados. */

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  institution: string;
  grade: string;
  interests: string[];
  initials: string;
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
  downloads: string;
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
