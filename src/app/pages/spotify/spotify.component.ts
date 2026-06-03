import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyModel } from '../../core/models/spotify.model';
import { SpotifyService } from '../../core/services/spotify.service';
import { ToastService } from '../../core/services/toast.service';
import { EditModalComponent } from '../../shared/components/edit-modal/edit-modal.component';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { TrashModalComponent } from '../../shared/components/trash-modal/trash-modal.component';

@Component({
  selector: 'app-spotify',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditModalComponent,
    DeleteModalComponent,
    TrashModalComponent,
  ],
  templateUrl: './spotify.component.html',
  styleUrl: './spotify.component.scss',
})
export class SpotifyComponent implements OnInit {
  private readonly service = inject(SpotifyService);
  private readonly toast = inject(ToastService);

  items = signal<SpotifyModel[]>([]);
  loading = signal(true);
  error = signal('');
  showDeleted = signal(false);

  downloadInput = '';
  downloading = signal(false);

  editTarget = signal<SpotifyModel | null>(null);
  deleteTarget = signal<SpotifyModel | null>(null);
  trashTarget = signal<SpotifyModel | null>(null);

  get activeItems(): SpotifyModel[] {
    return this.items()
      .filter((s) => !s.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get deletedItems(): SpotifyModel[] {
    return this.items()
      .filter((s) => s.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo conectar con el servidor.');
        this.loading.set(false);
        this.toast.error('No se pudo conectar con el servidor.');
      },
    });
  }

  onDownload(): void {
    const input = this.downloadInput.trim();
    if (!input) {
      this.toast.warning('Ingresa un enlace o ID de canción.');
      return;
    }
    this.downloading.set(true);
    this.service.download(input).subscribe({
      next: (item) => {
        this.items.update((list) => [item, ...list]);
        this.downloadInput = '';
        this.downloading.set(false);
        this.toast.success(`"${item.title || input}" agregado a la cola de descarga.`);
      },
      error: () => {
        this.downloading.set(false);
        this.toast.error('No se pudo iniciar la descarga. Verifica el enlace o ID.');
      },
    });
  }

  openEdit(item: SpotifyModel): void {
    this.editTarget.set(item);
  }

  onSaveFavorite(favorite: boolean): void {
    const item = this.editTarget();
    if (!item) return;
    this.service.updateFavorite(item.id, favorite).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.editTarget.set(null);
        this.toast.success(
          favorite
            ? `"${updated.title || updated.songId}" marcado como favorito.`
            : `"${updated.title || updated.songId}" quitado de favoritos.`,
        );
      },
      error: () => this.toast.error('No se pudo actualizar el favorito.'),
    });
  }

  openDelete(item: SpotifyModel): void {
    this.deleteTarget.set(item);
  }

  onConfirmDelete(): void {
    const item = this.deleteTarget();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((s) =>
            s.id === item.id ? { ...s, deleted: true, deletedAt: new Date().toISOString() } : s,
          ),
        );
        this.deleteTarget.set(null);
        this.toast.info(`"${item.title || item.songId}" movido a la papelera.`);
      },
      error: () => this.toast.error('No se pudo eliminar el registro.'),
    });
  }

  openTrash(item: SpotifyModel): void {
    this.trashTarget.set(item);
  }

  onConfirmRestore(): void {
    const item = this.trashTarget();
    if (!item) return;
    this.service.restore(item.id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((s) => (s.id === item.id ? { ...s, deleted: false, deletedAt: undefined } : s)),
        );
        this.trashTarget.set(null);
        this.toast.success(`"${item.title || item.songId}" restaurado correctamente.`);
      },
      error: () => this.toast.error('No se pudo restaurar el registro.'),
    });
  }

  onConfirmDeletePermanent(): void {
    const item = this.trashTarget();
    if (!item) return;
    this.service.deletePermanent(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((s) => s.id !== item.id));
        this.trashTarget.set(null);
        this.toast.success(`"${item.title || item.songId}" eliminado definitivamente.`);
      },
      error: () => this.toast.error('No se pudo eliminar el registro.'),
    });
  }

  statusClass(status: string): string {
    const s = status?.toLowerCase();
    if (s === 'completado') return 'status-done';
    if (s === 'error') return 'status-error';
    if (s === 'procesando') return 'status-processing';
    return 'status-pending';
  }
}
