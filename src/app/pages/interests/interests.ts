import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { INTEREST_TOPICS } from '../../core/mock-data';
import { SessionService } from '../../core/session.service';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

const MIN_INTERESTS = 3;

@Component({
  selector: 'app-interests',
  imports: [IconComponent, ThemeToggleComponent],
  templateUrl: './interests.html',
})
export class InterestsPage {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  readonly topics = INTEREST_TOPICS;
  readonly selected = signal<string[]>([]);
  readonly saving = signal(false);
  readonly minInterests = MIN_INTERESTS;

  readonly student = this.session.student;
  readonly canContinue = computed(() => this.selected().length >= MIN_INTERESTS);
  readonly remaining = computed(() => Math.max(0, MIN_INTERESTS - this.selected().length));

  isSelected(topic: string): boolean {
    return this.selected().includes(topic);
  }

  toggle(topic: string): void {
    this.selected.update((list) =>
      list.includes(topic) ? list.filter((t) => t !== topic) : [...list, topic],
    );
  }

  goNext(): void {
    if (!this.canContinue() || this.saving()) return;
    this.saving.set(true);
    this.session.saveInterests(this.selected()).subscribe(() => {
      this.saving.set(false);
      this.router.navigate(['/app/inicio']);
    });
  }

  back(): void {
    this.session.logout();
    this.router.navigate(['/login']);
  }
}
