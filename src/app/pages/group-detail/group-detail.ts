import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
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

  readonly group = signal<StudyGroup | null>(null);
  readonly members = signal<GroupMember[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.catalog.getStudyGroup(id).subscribe((group) => {
      if (!group) {
        this.toast.show('No encontramos ese grupo.');
        this.router.navigate(['/app/grupos']);
        return;
      }
      this.group.set(group);
      this.catalog.getGroupMembers(id).subscribe((members) => {
        this.members.set(members);
        this.loading.set(false);
      });
    });
  }

  join(): void {
    const group = this.group();
    if (!group || this.busy()) return;
    this.busy.set(true);
    this.catalog.joinGroup(group.id).subscribe((updated) => {
      if (updated) {
        this.group.set(updated);
        this.toast.success('Te uniste al grupo.');
      }
      this.busy.set(false);
    });
  }

  leave(): void {
    const group = this.group();
    if (!group) return;
    this.busy.set(true);
    this.catalog.leaveGroup(group.id).subscribe((updated) => {
      if (updated) {
        this.group.set(updated);
        this.toast.show('Saliste del grupo.');
      }
      this.busy.set(false);
    });
  }

  comingSoon(feature: string): void {
    this.toast.comingSoon(feature);
  }
}
