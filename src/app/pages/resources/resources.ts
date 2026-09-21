import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { ToastService } from '../../core/toast.service';
import { ResourceItem } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';
import { ModalComponent } from '../../shared/modal';

const TYPES = ['Todos', 'PDF', 'Video', 'Guía', 'Ejercicios'];

@Component({
  selector: 'app-resources',
  imports: [FormsModule, IconComponent, ThemeToggleComponent, ModalComponent],
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

  // Subida simulada
  readonly showUpload = signal(false);
  readonly uploading = signal(false);
  uploadType = 'Guía';
  uploadTitle = '';
  uploadSubject = '';
  uploadDescription = '';

  // Descarga simulada
  readonly downloadingId = signal<string | null>(null);

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

  openUpload(): void {
    this.uploadType = 'Guía';
    this.uploadTitle = '';
    this.uploadSubject = '';
    this.uploadDescription = '';
    this.showUpload.set(true);
  }

  closeUpload(): void {
    if (this.uploading()) return;
    this.showUpload.set(false);
  }

  submitUpload(): void {
    const title = this.uploadTitle.trim();
    const subject = this.uploadSubject.trim();
    const description = this.uploadDescription.trim();
    if (!title || !subject || this.uploading()) return;

    this.uploading.set(true);
    this.catalog
      .uploadResource({
        type: this.uploadType as ResourceItem['type'],
        title,
        subject,
        description,
      })
      .subscribe((created) => {
        this.resources.update((list) => [created, ...list]);
        this.uploading.set(false);
        this.showUpload.set(false);
        this.toast.success('Recurso publicado. Ya está disponible en la biblioteca.');
      });
  }

  download(resource: ResourceItem): void {
    if (this.downloadingId()) return;
    this.downloadingId.set(resource.id);
    this.catalog.downloadResource(resource.id).subscribe((updated) => {
      if (!updated) return;
      this.resources.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
      this.downloadingId.set(null);
      this.toast.success(`Descarga de "${updated.title}" iniciada.`);
    });
  }

  formatDownloads(count: number): string {
    return count.toLocaleString('es');
  }
}