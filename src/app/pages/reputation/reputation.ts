import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { Achievement, RewardEntry } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-reputation',
  imports: [RouterLink, DecimalPipe, IconComponent, ThemeToggleComponent],
  templateUrl: './reputation.html',
})
export class ReputationPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly achievements = signal<Achievement[]>([]);
  readonly rewards = signal<RewardEntry[]>([]);
  readonly loading = signal(true);

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

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
