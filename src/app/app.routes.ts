import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard, onboardingGuard, sectionGuard } from './core/auth.guard';
import { SessionService } from './core/session.service';

/**
 * Camino feliz (navegable de punta a punta):
 *   login → intereses → inicio → tutores → perfil del tutor → reserva → confirmación
 * El resto de pantallas está completa y funcional (no solo visual): todas las
 * acciones de segundo nivel (chat de grupo/tutor, videollamada, subir
 * recursos, editar perfil, etc.) están implementadas y simuladas.
 *
 * Cada sección declara `data.section`, y esa clave se comprueba en
 * `sectionGuard` contra la tabla de `core/permissions`. El menú lateral genera
 * sus entradas de la misma tabla, así que una sección nunca puede quedar oculta
 * en el menú y abierta en la URL: el padre no entra a Mensajes, Grupos,
 * Reputación ni al panel de estudiante por mucho que escriba la dirección.
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
    data: { section: 'intereses' },
    canActivate: [authGuard, sectionGuard],
    loadComponent: () => import('./pages/interests/interests').then((m) => m.InterestsPage),
  },
  {
    path: 'app',
    canActivate: [onboardingGuard],
    loadComponent: () => import('./pages/shell/shell').then((m) => m.ShellPage),
    children: [
      // Cada rol entra donde le toca: el padre aterriza en la supervisión de su
      // hijo, no en el panel de estudiante. Un redirectTo con función puede leer
      // la sesión; el router lo ejecuta en contexto de inyección.
      {
        path: '',
        pathMatch: 'full',
        redirectTo: () => inject(SessionService).startRoute(),
      },
      {
        path: 'inicio',
        title: 'Inicio · CONNECT2LEARN',
        data: { section: 'inicio' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
      },
      {
        path: 'tutores',
        title: 'Tutores · CONNECT2LEARN',
        data: { section: 'tutores' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/tutors/tutors').then((m) => m.TutorsPage),
      },
      {
        // El padre también entra aquí, pero para agendar a nombre de su hijo:
        // la reserva se atribuye al hijo, nunca a la cuenta del padre.
        path: 'tutores/:id',
        title: 'Perfil del tutor · CONNECT2LEARN',
        data: { section: 'tutores' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/tutor-detail/tutor-detail').then((m) => m.TutorDetailPage),
      },
      {
        // Confirmación de la reserva: es el cierre del flujo de tutoría, con los
        // mismos roles que pueden entrar a él.
        path: 'reserva-confirmada',
        title: 'Reserva confirmada · CONNECT2LEARN',
        data: { section: 'tutores' },
        canActivate: [sectionGuard],
        loadComponent: () =>
          import('./pages/booking-confirmed/booking-confirmed').then((m) => m.BookingConfirmedPage),
      },
      {
        path: 'comunidad',
        title: 'Comunidad · CONNECT2LEARN',
        data: { section: 'comunidad' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/community/community').then((m) => m.CommunityPage),
      },
      {
        path: 'recursos',
        title: 'Recursos · CONNECT2LEARN',
        data: { section: 'recursos' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/resources/resources').then((m) => m.ResourcesPage),
      },
      {
        path: 'grupos',
        title: 'Grupos de estudio · CONNECT2LEARN',
        data: { section: 'grupos' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/groups/groups').then((m) => m.GroupsPage),
      },
      {
        path: 'grupos/:id',
        title: 'Grupo de estudio · CONNECT2LEARN',
        data: { section: 'grupos' },
        canActivate: [sectionGuard],
        loadComponent: () =>
          import('./pages/group-detail/group-detail').then((m) => m.GroupDetailPage),
      },
      {
        path: 'familia',
        title: 'Supervisión familiar · CONNECT2LEARN',
        data: { section: 'familia' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/family/family').then((m) => m.FamilyPage),
      },
      {
        path: 'mensajes',
        title: 'Mensajes · CONNECT2LEARN',
        data: { section: 'mensajes' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/messages/messages').then((m) => m.MessagesPage),
      },
      {
        path: 'reputacion',
        title: 'Reputación · CONNECT2LEARN',
        data: { section: 'reputacion' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/reputation/reputation').then((m) => m.ReputationPage),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · CONNECT2LEARN',
        data: { section: 'perfil' },
        canActivate: [sectionGuard],
        loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfilePage),
      },
      // Sección inexistente dentro de la app: 404 dentro del shell, para que
      // el usuario conserve la navegación lateral (ver `pages/not-found`).
      {
        path: '**',
        title: 'Página no encontrada · CONNECT2LEARN',
        data: { chrome: 'shell' },
        loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
      },
    ],
  },
  // Ruta inexistente: 404 a pantalla completa (marca + tema), sin sesión.
  {
    path: '**',
    title: 'Página no encontrada · CONNECT2LEARN',
    data: { chrome: 'page' },
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
