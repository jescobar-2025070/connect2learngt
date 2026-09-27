import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { SessionService } from '../../core/session.service';
import { ToastService } from '../../core/toast.service';
import { ResourceItem } from '../../core/models';
import { capabilitiesOf } from '../../core/permissions';
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
  private readonly errors = inject(ErrorService);
  private readonly session = inject(SessionService);

  /**
   * El padre consulta y descarga material, pero no lo publica: el repositorio
   * es del alumnado. El permiso se comprueba en `openUpload` y `submitUpload`,
   * no solo ocultando el botón.
   */
  readonly caps = capabilitiesOf(this.session.role());
  readonly canUpload = computed(() => this.caps.upload);

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
    this.catalog
      .getResources(type)
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('recursos.listar', () => this.load(type)),
      )
      .subscribe((list) => this.resources.set(list));
  }

  openUpload(): void {
    if (!this.caps.upload) {
      this.toast.show('Como familiar puedes descargar recursos, pero no subirlos.');
      return;
    }
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
    if (!this.caps.upload) return;

    this.uploading.set(true);
    this.catalog
      .uploadResource({
        type: this.uploadType as ResourceItem['type'],
        title,
        subject,
        description,
      })
      .pipe(
        finalize(() => this.uploading.set(false)),
        this.errors.catch('recursos.subir', () => this.submitUpload()),
      )
      .subscribe((created) => {
        this.resources.update((list) => [created, ...list]);
        this.showUpload.set(false);
        this.toast.success('Recurso publicado. Ya está disponible en la biblioteca.');
      });
  }

  download(resource: ResourceItem): void {
    if (this.downloadingId()) return;
    this.downloadingId.set(resource.id);
    this.catalog
      .downloadResource(resource.id)
      .pipe(
        finalize(() => this.downloadingId.set(null)),
        this.errors.catch('recursos.descargar', () => this.download(resource)),
      )
      .subscribe((updated) => {
        if (!updated) return;
        this.resources.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.success(`Descarga de "${updated.title}" iniciada.`);
      });
  }

  formatDownloads(count: number): string {
    return count.toLocaleString('es');
  }
}