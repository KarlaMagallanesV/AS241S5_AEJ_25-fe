import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PetEmergencyAnalysis, PetEmergencyRequest } from '../../core/models/emergency.model';
import { EmergencyService } from '../../core/services/emergency.service';
import { ToastService } from '../../core/services/toast.service';
import { TrashModalComponent } from '../../shared/components/trash-modal/trash-modal.component';
import { EmergencyResultComponent } from '../../shared/components/emergency-result/emergency-result.component';

const LANGUAGES = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'pt', label: 'Português' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
];

const PET_TYPES = ['Perro', 'Gato', 'Ave', 'Conejo', 'Reptil', 'Otro'];

@Component({
  selector: 'app-emergency',
  standalone: true,
  imports: [CommonModule, FormsModule, TrashModalComponent, EmergencyResultComponent],
  templateUrl: './emergency.component.html',
  styleUrl: './emergency.component.scss',
})
export class EmergencyComponent implements OnInit {
  private readonly service = inject(EmergencyService);
  private readonly toast = inject(ToastService);

  readonly languages = LANGUAGES;
  readonly petTypes = PET_TYPES;

  // Formulario
  form: PetEmergencyRequest = { petType: 'Perro', emergency: '', language: 'es' };
  analyzing = signal(false);
  lastResult = signal<object | null>(null);

  // Historial
  records = signal<PetEmergencyAnalysis[]>([]);
  loading = signal(true);
  showDeleted = signal(false);
  trashTarget = signal<PetEmergencyAnalysis | null>(null);
  expandedId = signal<number | null>(null);

  get activeRecords(): PetEmergencyAnalysis[] {
    return this.records()
      .filter((r) => !r.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  get deletedRecords(): PetEmergencyAnalysis[] {
    return this.records()
      .filter((r) => r.deleted)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.records.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('No se pudo cargar el historial.');
      },
    });
  }

  onAnalyze(): void {
    if (!this.form.emergency.trim()) {
      this.toast.warning('Describe la emergencia antes de continuar.');
      return;
    }
    this.analyzing.set(true);
    this.lastResult.set(null);
    this.service.analyze(this.form).subscribe({
      next: (result) => {
        this.lastResult.set(result);
        this.analyzing.set(false);
        this.toast.success('Análisis completado.');
        this.load();
      },
      error: () => {
        this.analyzing.set(false);
        this.toast.error('No se pudo completar el análisis. Intenta de nuevo.');
      },
    });
  }

  toggleExpand(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  parseResult(raw: string): string {
    try {
      const obj = JSON.parse(raw);
      // Si tiene una propiedad de texto principal, la devuelve
      return (
        obj?.guidance ?? obj?.result ?? obj?.message ?? obj?.text ?? JSON.stringify(obj, null, 2)
      );
    } catch {
      return raw;
    }
  }

  languageLabel(code: string): string {
    return this.languages.find((l) => l.code === code)?.label ?? code;
  }

  openTrash(record: PetEmergencyAnalysis): void {
    this.trashTarget.set(record);
  }

  onConfirmRestore(): void {
    const record = this.trashTarget();
    if (!record) return;
    this.service.restoreLogical(record.id).subscribe({
      next: (updated) => {
        this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.trashTarget.set(null);
        this.toast.success('Registro restaurado correctamente.');
      },
      error: () => this.toast.error('No se pudo restaurar el registro.'),
    });
  }

  onConfirmDeletePermanent(): void {
    const record = this.trashTarget();
    if (!record) return;
    this.service.deletePhysical(record.id).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.id !== record.id));
        this.trashTarget.set(null);
        this.toast.success('Registro eliminado definitivamente.');
      },
      error: () => this.toast.error('No se pudo eliminar el registro.'),
    });
  }

  onSoftDelete(record: PetEmergencyAnalysis): void {
    this.service.deleteLogical(record.id).subscribe({
      next: (updated) => {
        this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.toast.info(`Registro movido a la papelera.`);
      },
      error: () => this.toast.error('No se pudo eliminar el registro.'),
    });
  }
}
