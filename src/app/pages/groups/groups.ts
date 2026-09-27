import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { ToastService } from '../../core/toast.service';
import { StudyGroup } from '../../core/models';
import { IconComponent } from '../../shared/icon';

const SUBJECTS = [
  'Todas',
  'Matemáticas',
  'Física',
  'Literatura',
  'Programación',
  'Inglés',
];

@Component({
  selector: 'app-groups',
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './groups.html',
})
export class GroupsPage {
  private readonly catalog = inject(CatalogService);
  private readonly toast = inject(ToastService);
  private readonly errors = inject(ErrorService);

  readonly subjects = SUBJECTS;
  readonly activeSubject = signal('Todas');
  readonly groups = signal<StudyGroup[]>([]);
  readonly loading = signal(true);
  readonly joiningId = signal<string | null>(null);

  showCreateForm = signal(false);
  newGroup = { name: '', subject: 'Matemáticas', description: '', isPrivate: false };
  creating = signal(false);

  constructor() {
    this.load('Todas');
  }

  selectSubject(subject: string): void {
    this.activeSubject.set(subject);
    this.load(subject);
  }

  private load(subject: string): void {
    this.loading.set(true);
    this.catalog
      .getStudyGroups(subject)
      .pipe(
        finalize(() => this.loading.set(false)),
        this.errors.catch('grupos.listar', () => this.load(subject)),
      )
      .subscribe((list) => this.groups.set(list));
  }

  join(group: StudyGroup): void {
    this.joiningId.set(group.id);
    this.catalog
      .joinGroup(group.id)
      .pipe(
        finalize(() => this.joiningId.set(null)),
        this.errors.catch('grupos.unirse', () => this.join(group)),
      )
      .subscribe((updated) => {
        if (updated) {
          this.groups.update((list) => list.map((g) => (g.id === updated.id ? updated : g)));
          this.toast.success(`Te uniste a "${updated.name}".`);
        }
      });
  }

  toggleCreateForm(): void {
    this.showCreateForm.update((v) => !v);
  }

  createGroup(): void {
    const name = this.newGroup.name.trim();
    const description = this.newGroup.description.trim();
    if (!name || !description || this.creating()) return;

    this.creating.set(true);
    this.catalog
      .createGroup({
        name,
        subject: this.newGroup.subject,
        description,
        isPrivate: this.newGroup.isPrivate,
      })
      .pipe(
        finalize(() => this.creating.set(false)),
        this.errors.catch('grupos.crear', () => this.createGroup()),
      )
      .subscribe((group) => {
        this.groups.update((list) => [group, ...list]);
        this.showCreateForm.set(false);
        this.newGroup = { name: '', subject: 'Matemáticas', description: '', isPrivate: false };
        this.toast.success(`Grupo "${group.name}" creado.`);
      });
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
