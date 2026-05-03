import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoModel } from '../../core/models/video.model';
import { YoutubeService } from '../../core/services/youtube.service';
import { ToastService } from '../../core/services/toast.service';
import { EditModalComponent } from '../../shared/components/edit-modal/edit-modal.component';
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';
import { TrashModalComponent } from '../../shared/components/trash-modal/trash-modal.component';

@Component({
  selector: 'app-youtube',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EditModalComponent,
    DeleteModalComponent,
    TrashModalComponent,
  ],
  templateUrl: './youtube.component.html',
  styleUrl: './youtube.component.scss',
})
export class YoutubeComponent implements OnInit {
  private readonly service = inject(YoutubeService);
  private readonly toast = inject(ToastService);

  items = signal<VideoModel[]>([]);
  loading = signal(true);
  error = signal('');
  showDeleted = signal(false);

  downloadInput = '';
  downloading = signal(false);

  editTarget = signal<VideoModel | null>(null);
  deleteTarget = signal<VideoModel | null>(null);
  trashTarget = signal<VideoModel | null>(null);

  get activeItems(): VideoModel[] {
    return this.items()
      .filter((v) => !v.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get deletedItems(): VideoModel[] {
    return this.items()
      .filter((v) => v.deleted)
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
      this.toast.warning('Ingresa un enlace o ID del video.');
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

  openEdit(item: VideoModel): void {
    this.editTarget.set(item);
  }

  onSaveFavorite(favorite: boolean): void {
    const item = this.editTarget();
    if (!item) return;
    this.service.updateFavorite(item.id, favorite).subscribe({
      next: (updated) => {
        this.items.update((list) => list.map((v) => (v.id === updated.id ? updated : v)));
        this.editTarget.set(null);
        this.toast.success(
          favorite
            ? `"${updated.title || updated.videoId}" marcado como favorito.`
            : `"${updated.title || updated.videoId}" quitado de favoritos.`,
        );
      },
      error: () => this.toast.error('No se pudo actualizar el favorito.'),
    });
  }

  openDelete(item: VideoModel): void {
    this.deleteTarget.set(item);
  }

  onConfirmDelete(): void {
    const item = this.deleteTarget();
    if (!item) return;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((v) =>
            v.id === item.id ? { ...v, deleted: true, deletedAt: new Date().toISOString() } : v,
          ),
        );
        this.deleteTarget.set(null);
        this.toast.info(`"${item.title || item.videoId}" movido a la papelera.`);
      },
      error: () => this.toast.error('No se pudo eliminar el registro.'),
    });
  }

  openTrash(item: VideoModel): void {
    this.trashTarget.set(item);
  }

  onConfirmRestore(): void {
    const item = this.trashTarget();
    if (!item) return;
    this.service.restore(item.id).subscribe({
      next: () => {
        this.items.update((list) =>
          list.map((v) => (v.id === item.id ? { ...v, deleted: false, deletedAt: undefined } : v)),
        );
        this.trashTarget.set(null);
        this.toast.success(`"${item.title || item.videoId}" restaurado correctamente.`);
      },
      error: () => this.toast.error('No se pudo restaurar el registro.'),
    });
  }

  onConfirmDeletePermanent(): void {
    const item = this.trashTarget();
    if (!item) return;
    this.service.deletePermanent(item.id).subscribe({
      next: () => {
        this.items.update((list) => list.filter((v) => v.id !== item.id));
        this.trashTarget.set(null);
        this.toast.success(`"${item.title || item.videoId}" eliminado definitivamente.`);
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

  formatDuration(seconds: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
