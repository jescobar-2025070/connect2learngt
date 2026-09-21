import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { Achievement, RewardEntry } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';

interface TrackedStep {
  text: string;
  status: 'done' | 'current' | 'todo';
}

const UNLOCK_STEPS: Record<string, TrackedStep[]> = {
  'ach-004': [
    { text: 'Publica una guía original en Recursos', status: 'current' },
    { text: 'Recibe 10 descargas o me gusta en comunidad', status: 'todo' },
    { text: 'Recibe un reconocimiento de la comunidad', status: 'todo' },
  ],
  'ach-005': [
    { text: 'Completa tu perfil de tutor', status: 'done' },
    { text: 'Imparte tus primeras 3 sesiones', status: 'current' },
    { text: 'Consigue 5 reseñas de 5 estrellas', status: 'todo' },
  ],
  'ach-006': [
    { text: 'Suma 10 horas de estudio este mes', status: 'done' },
    { text: 'Llega a 15 horas de estudio', status: 'current' },
    { text: 'Completa 20 horas en un mes', status: 'todo' },
  ],
};

@Component({
  selector: 'app-reputation',
  imports: [RouterLink, DecimalPipe, IconComponent, ThemeToggleComponent, ModalComponent],
  templateUrl: './reputation.html',
})
export class ReputationPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly achievements = signal<Achievement[]>([]);
  readonly rewards = signal<RewardEntry[]>([]);
  readonly loading = signal(true);

  // Seguimiento de un logro bloqueado
  readonly tracking = signal<Achievement | null>(null);

  readonly repScore = 4850;
  readonly level = 12;
  readonly xp = 8200;
  readonly xpGoal = 10000;
  readonly xpPercent = Math.round((this.xp / this.xpGoal) * 100);

  constructor() {
    let achievementsReady = false;
    let rewardsReady = false;
    const checkDone = () => {
      if (achievementsReady && rewardsReady) this.loading.set(false);
    };

    this.catalog.getAchievements().subscribe((list) => {
      this.achievements.set(list);
      achievementsReady = true;
      checkDone();
    });
    this.catalog.getRewards().subscribe((list) => {
      this.rewards.set(list);
      rewardsReady = true;
      checkDone();
    });
  }

  stepsOf(ach: Achievement): TrackedStep[] {
    return UNLOCK_STEPS[ach.id] ?? [
      { text: 'Participa activamente en la plataforma', status: 'current' },
      { text: 'Acumula experiencia y reputación', status: 'todo' },
    ];
  }

  progressOf(ach: Achievement): number {
    const steps = this.stepsOf(ach);
    const done = steps.filter((s) => s.status === 'done').length;
    return Math.round((done / steps.length) * 100);
  }

  openTracking(ach: Achievement): void {
    this.tracking.set(ach);
  }
}
