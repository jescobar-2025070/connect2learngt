import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CatalogService, TutorFilters } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { Tutor } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-tutors',
  imports: [FormsModule, RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './tutors.html',
})
export class TutorsPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly subjects = this.catalog.getSubjects();
  readonly tutors = signal<Tutor[]>([]);
  readonly loading = signal(true);

  query = '';
  subject = '';
  maxPrice: number | null = null;
  minRating: number | null = null;

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);
    const filters: TutorFilters = {
      query: this.query,
      subject: this.subject || undefined,
      maxPrice: this.maxPrice,
      minRating: this.minRating,
    };
    this.catalog.getTutors(filters).subscribe((list) => {
      this.tutors.set(list);
      this.loading.set(false);
    });
  }

  clearFilters(): void {
    this.query = '';
    this.subject = '';
    this.maxPrice = null;
    this.minRating = null;
    this.search();
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
