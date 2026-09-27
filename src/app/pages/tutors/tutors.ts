import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService, TutorFilters } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
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
  private readonly errors = inject(ErrorService);

  readonly subjects = this.catalog.getSubjects();
  readonly tutors = signal<Tutor[]>([]);
  readonly loading = signal(true);

  readonly perPage = 3;
  readonly visibleCount = signal(this.perPage);
  readonly visibleTutors = computed(() => this.tutors().slice(0, this.visibleCount()));
  readonly remaining = computed(() => Math.max(0, this.tutors().length - this.visibleCount()));

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
    this.catalog
      .getTutors(filters)
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('tutores.buscar', () => this.search()),
      )
      .subscribe((list) => {
        this.tutors.set(list);
        this.visibleCount.set(this.perPage);
      });
  }

  loadMore(): void {
    this.visibleCount.update((count) => count + this.perPage);
  }

  clearFilters(): void {
    this.query = '';
    this.subject = '';
    this.maxPrice = null;
    this.minRating = null;
    this.search();
  }
}
