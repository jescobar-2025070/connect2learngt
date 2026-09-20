import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { ResourceItem } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

const TYPES = ['Todos', 'PDF', 'Video', 'Guía', 'Ejercicios'];

@Component({
  selector: 'app-resources',
  imports: [FormsModule, IconComponent, ThemeToggleComponent],
  templateUrl: './resources.html',
})
export class ResourcesPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);

  readonly types = TYPES;
  readonly activeType = signal('Todos');
  readonly query = signal('');
  readonly resources = signal<ResourceItem[]>([]);
  readonly loading = signal(true);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.resources();
    return this.resources().filter((r) =>
      `${r.title} ${r.description} ${r.subject}`.toLowerCase().includes(q),
    );
  });

  constructor() {
    this.load('Todos');
  }

  selectType(type: string): void {
    this.activeType.set(type);
    this.load(type);
  }

  private load(type: string): void {
    this.loading.set(true);
    this.catalog.getResources(type).subscribe((list) => {
      this.resources.set(list);
      this.loading.set(false);
    });
  }

  download(resource: ResourceItem): void {
    this.toast.comingSoon(`La descarga de "${resource.title}"`);
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
