import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { HomeSummary } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './home.html',
})
export class HomePage {
  private readonly catalog = inject(CatalogService);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly student = this.session.student;
  readonly summary = signal<HomeSummary | null>(null);
  readonly loading = signal(true);

  constructor() {
    this.catalog.getHomeSummary().subscribe((data) => {
      this.summary.set(data);
      this.loading.set(false);
    });
  }

  get firstName(): string {
    return this.student()?.name.split(' ')[0] ?? 'Alex';
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
