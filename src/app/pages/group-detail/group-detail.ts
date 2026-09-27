import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { CatalogService } from '../../core/catalog.service';
import { ErrorService } from '../../core/error.service';
import { ToastService } from '../../core/toast.service';
import { GroupMember, StudyGroup } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { ThemeToggleComponent } from '../../shared/theme-toggle';

@Component({
  selector: 'app-group-detail',
  imports: [RouterLink, IconComponent, ThemeToggleComponent],
  templateUrl: './group-detail.html',
})
export class GroupDetailPage {
  private readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly errors = inject(ErrorService);

  readonly group = signal<StudyGroup | null>(null);
  readonly members = signal<GroupMember[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);

  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  constructor() {
    this.load();
  }

  /**
   * Carga el grupo y sus miembros. Se separa del constructor para poder
   * reutilizarla como acción de reintento cuando la llamada falla.
   */
  private load(): void {
    this.loading.set(true);
    this.catalog
      .getStudyGroup(this.id)
      .pipe(
        // `finalize` apaga el indicador aunque la llamada falle: si no, la
        // pantalla se quedaría con el esqueleto de carga para siempre.
        finalize(() => this.loading.set(false)),
        this.errors.catch('grupo.detalle'),
      )
      .subscribe((group) => {
        // El id existe en la URL pero no en el catálogo: es un enlace roto,
        // no un fallo, así que se avisa y se vuelve al listado.
        if (!group) {
          this.toast.show('No encontramos ese grupo.');
          this.router.navigate(['/app/grupos']);
          return;
        }
        this.group.set(group);
        this.loadMembers();
      });
  }

  /** Reintenta la carga del grupo desde el estado de error. */
  retry(): void {
    if (this.loading()) return;
    this.load();
  }

  private loadMembers(): void {
    this.catalog
      .getGroupMembers(this.id)
      .pipe(this.errors.catch('grupo.miembros', () => this.loadMembers()))
      .subscribe((members) => this.members.set(members));
  }

  join(): void {
    const group = this.group();
    if (!group || this.busy()) return;
    this.busy.set(true);
    this.catalog
      .joinGroup(group.id)
      .pipe(
        finalize(() => this.busy.set(false)),
        this.errors.catch('grupo.unirse', () => this.join()),
      )
      .subscribe((updated) => {
        if (updated) {
          this.group.set(updated);
          this.toast.success('Te uniste al grupo.');
        }
      });
  }

  leave(): void {
    const group = this.group();
    if (!group || this.busy()) return;
    this.busy.set(true);
    this.catalog
      .leaveGroup(group.id)
      .pipe(
        finalize(() => this.busy.set(false)),
        this.errors.catch('grupo.salir', () => this.leave()),
      )
      .subscribe((updated) => {
        if (updated) {
          this.group.set(updated);
          this.toast.show('Saliste del grupo.');
        }
      });
  }

  /** Abre el chat del grupo en Mensajes (hilo simulado por defecto). */
  openChat(groupId: string): void {
    this.router.navigate(['/app/mensajes'], { queryParams: { grupo: groupId } });
  }
}
