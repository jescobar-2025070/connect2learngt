import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { SessionService } from './session.service';
import {
  ACHIEVEMENTS,
  CONVERSATIONS,
  GROUP_MEMBERS,
  GUARDIANS,
  MESSAGES_BY_CONVERSATION,
  POSTS,
  RESOURCES,
  REWARDS,
  SHARING_PREFERENCES,
  STUDY_GROUPS,
  SUBJECT_PROGRESS,
  TRENDING_TOPICS,
  TUTORS,
  buildSlots,
} from './mock-data';
import {
  Achievement,
  ChatMessage,
  CommunityPost,
  Conversation,
  GroupMember,
  Guardian,
  HomeSummary,
  ResourceItem,
  RewardEntry,
  SharingPreference,
  StudyGroup,
  Tutor,
  TutorSlot,
} from './models';

export interface TutorFilters {
  query?: string;
  subject?: string;
  maxPrice?: number | null;
  minRating?: number | null;
}

export interface NewGroupInput {
  name: string;
  subject: string;
  description: string;
  isPrivate: boolean;
}

/**
 * "Backend" simulado. Cada método devuelve datos en memoria envueltos en
 * `of(...).pipe(delay(...))` con una latencia aleatoria de 1000–1500 ms,
 * para que la interfaz muestre spinners y skeletons reales.
 *
 * Las colecciones que el usuario puede modificar (grupos, tutores de
 * familia) se copian a estado local del servicio para que "unirse",
 * "crear" o "invitar" persistan mientras dura la sesión del navegador,
 * igual que si vinieran de un backend real.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly session = inject(SessionService);

  private groups: StudyGroup[] = STUDY_GROUPS.map((g) => ({ ...g }));
  private guardians: Guardian[] = GUARDIANS.map((g) => ({ ...g }));
  private sharingPrefs: SharingPreference[] = SHARING_PREFERENCES.map((p) => ({ ...p }));

  /** Latencia simulada de red, entre 1 y 1.5 segundos. */
  private latency(): number {
    return 1000 + Math.round(Math.random() * 500);
  }

  private mock<T>(data: T): Observable<T> {
    return of(data).pipe(delay(this.latency()));
  }

  getHomeSummary(): Observable<HomeSummary> {
    return this.mock(null).pipe(
      map(() => ({
        weeklyGoalPercent: 75,
        studyStreak: 14,
        hoursThisWeek: 6.5,
        nextSession: this.session.nextBooking(),
        recommendedResource: RESOURCES[0],
        featuredTutor: TUTORS[2],
        subjectProgress: SUBJECT_PROGRESS,
      })),
    );
  }

  getTutors(filters: TutorFilters = {}): Observable<Tutor[]> {
    const q = filters.query?.trim().toLowerCase() ?? '';
    const result = TUTORS.filter((t) => {
      if (q && !`${t.name} ${t.headline} ${t.subjects.join(' ')}`.toLowerCase().includes(q)) {
        return false;
      }
      if (filters.subject && !t.subjects.includes(filters.subject)) return false;
      if (filters.maxPrice != null && t.pricePerHour > filters.maxPrice) return false;
      if (filters.minRating != null && t.rating < filters.minRating) return false;
      return true;
    });
    return this.mock(result);
  }

  getTutor(id: string): Observable<Tutor | undefined> {
    return this.mock(TUTORS.find((t) => t.id === id));
  }

  getSlots(): Observable<TutorSlot[]> {
    return this.mock(buildSlots());
  }

  getSubjects(): string[] {
    return [...new Set(TUTORS.flatMap((t) => t.subjects))].sort();
  }

  getResources(type?: string): Observable<ResourceItem[]> {
    const list = type && type !== 'Todos' ? RESOURCES.filter((r) => r.type === type) : RESOURCES;
    return this.mock(list);
  }

  getPosts(): Observable<CommunityPost[]> {
    return this.mock(POSTS);
  }

  getTrendingTopics(): string[] {
    return TRENDING_TOPICS;
  }

  getAchievements(): Observable<Achievement[]> {
    return this.mock(ACHIEVEMENTS);
  }

  getRewards(): Observable<RewardEntry[]> {
    return this.mock(REWARDS);
  }

  getConversations(): Observable<Conversation[]> {
    return this.mock(CONVERSATIONS);
  }

  /** Hilo de mensajes de una conversación concreta (antes era siempre el mismo). */
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    return this.mock(MESSAGES_BY_CONVERSATION[conversationId] ?? []);
  }

  sendMessage(message: ChatMessage): Observable<ChatMessage> {
    return of(message).pipe(delay(500));
  }

  // ---------------------------------------------------------------
  // Grupos de estudio
  // ---------------------------------------------------------------

  getStudyGroups(subject?: string): Observable<StudyGroup[]> {
    const list =
      subject && subject !== 'Todas'
        ? this.groups.filter((g) => g.subject === subject)
        : this.groups;
    return this.mock([...list]);
  }

  getStudyGroup(id: string): Observable<StudyGroup | undefined> {
    return this.mock(this.groups.find((g) => g.id === id));
  }

  getGroupMembers(groupId: string): Observable<GroupMember[]> {
    return this.mock(GROUP_MEMBERS[groupId] ?? []);
  }

  joinGroup(groupId: string): Observable<StudyGroup | undefined> {
    return of(null).pipe(
      delay(900),
      map(() => {
        const group = this.groups.find((g) => g.id === groupId);
        if (group && !group.joined) {
          group.joined = true;
          group.memberCount += 1;
        }
        return group;
      }),
    );
  }

  leaveGroup(groupId: string): Observable<StudyGroup | undefined> {
    return of(null).pipe(
      delay(900),
      map(() => {
        const group = this.groups.find((g) => g.id === groupId);
        if (group && group.joined) {
          group.joined = false;
          group.memberCount = Math.max(0, group.memberCount - 1);
        }
        return group;
      }),
    );
  }

  createGroup(input: NewGroupInput): Observable<StudyGroup> {
    const student = this.session.student();
    const group: StudyGroup = {
      id: `grp-${Date.now()}`,
      name: input.name,
      subject: input.subject,
      description: input.description,
      memberCount: 1,
      memberInitials: [student?.initials ?? 'TU'],
      meetingSchedule: 'Por definir',
      isPrivate: input.isPrivate,
      joined: true,
    };
    return of(group).pipe(
      delay(1200),
      map((g) => {
        this.groups = [g, ...this.groups];
        return g;
      }),
    );
  }

  // ---------------------------------------------------------------
  // Supervisión familiar
  // ---------------------------------------------------------------

  getGuardians(): Observable<Guardian[]> {
    return this.mock([...this.guardians]);
  }

  inviteGuardian(email: string): Observable<Guardian> {
    const guardian: Guardian = {
      id: `gd-${Date.now()}`,
      name: email.split('@')[0]?.replace(/[._]/g, ' ') || 'Familiar invitado',
      initials: email.slice(0, 2).toUpperCase(),
      email,
      relationship: 'Por confirmar',
      status: 'pending',
      linkedSince: 'Invitación enviada',
    };
    return of(guardian).pipe(
      delay(1300),
      map((g) => {
        this.guardians = [...this.guardians, g];
        return g;
      }),
    );
  }

  revokeGuardian(id: string): Observable<void> {
    return of(void 0).pipe(
      delay(900),
      map(() => {
        this.guardians = this.guardians.filter((g) => g.id !== id);
      }),
    );
  }

  getSharingPreferences(): Observable<SharingPreference[]> {
    return this.mock([...this.sharingPrefs]);
  }

  setSharingPreference(id: string, enabled: boolean): Observable<SharingPreference | undefined> {
    return of(null).pipe(
      delay(500),
      map(() => {
        const pref = this.sharingPrefs.find((p) => p.id === id);
        if (pref) pref.enabled = enabled;
        return pref;
      }),
    );
  }
}
