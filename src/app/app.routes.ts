import { Routes } from '@angular/router';
import { authGuard, onboardingGuard } from './core/auth.guard';

/**
 * Camino feliz (navegable de punta a punta):
 *   login → intereses → inicio → tutores → perfil del tutor → reserva → confirmación
 * El resto de pantallas está completa y funcional (no solo visual): grupos
 * de estudio y supervisión familiar incluyen sus propias acciones (unirse,
 * crear, invitar, revocar). Solo quedan como aviso de "próximamente" las
 * acciones realmente fuera de alcance para esta ronda (videollamada, subir
 * archivos, edición de perfil, etc.).
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    title: 'Iniciar sesión · CONNECT2LEARN',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'registro',
    title: 'Crear cuenta · CONNECT2LEARN',
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterPage),
  },
  {
    path: 'intereses',
    title: 'Tus intereses · CONNECT2LEARN',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/interests/interests').then((m) => m.InterestsPage),
  },
  {
    path: 'app',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./pages/shell/shell').then((m) => m.ShellPage),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        title: 'Inicio · CONNECT2LEARN',
        loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
      },
      {
        path: 'tutores',
        title: 'Tutores · CONNECT2LEARN',
        loadComponent: () => import('./pages/tutors/tutors').then((m) => m.TutorsPage),
      },
      {
        path: 'tutores/:id',
        title: 'Perfil del tutor · CONNECT2LEARN',
        loadComponent: () => import('./pages/tutor-detail/tutor-detail').then((m) => m.TutorDetailPage),
      },
      {
        path: 'reserva-confirmada',
        title: 'Reserva confirmada · CONNECT2LEARN',
        loadComponent: () =>
          import('./pages/booking-confirmed/booking-confirmed').then((m) => m.BookingConfirmedPage),
      },
      {
        path: 'comunidad',
        title: 'Comunidad · CONNECT2LEARN',
        loadComponent: () => import('./pages/community/community').then((m) => m.CommunityPage),
      },
      {
        path: 'recursos',
        title: 'Recursos · CONNECT2LEARN',
        loadComponent: () => import('./pages/resources/resources').then((m) => m.ResourcesPage),
      },
      {
        path: 'grupos',
        title: 'Grupos de estudio · CONNECT2LEARN',
        loadComponent: () => import('./pages/groups/groups').then((m) => m.GroupsPage),
      },
      {
        path: 'grupos/:id',
        title: 'Grupo de estudio · CONNECT2LEARN',
        loadComponent: () =>
          import('./pages/group-detail/group-detail').then((m) => m.GroupDetailPage),
      },
      {
        path: 'familia',
        title: 'Supervisión familiar · CONNECT2LEARN',
        loadComponent: () => import('./pages/family/family').then((m) => m.FamilyPage),
      },
      {
        path: 'mensajes',
        title: 'Mensajes · CONNECT2LEARN',
        loadComponent: () => import('./pages/messages/messages').then((m) => m.MessagesPage),
      },
      {
        path: 'reputacion',
        title: 'Reputación · CONNECT2LEARN',
        loadComponent: () => import('./pages/reputation/reputation').then((m) => m.ReputationPage),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · CONNECT2LEARN',
        loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfilePage),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
