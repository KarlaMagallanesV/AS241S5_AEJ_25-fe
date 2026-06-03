import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trash-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trash-modal.component.html',
  styleUrl: './trash-modal.component.scss',
})
export class TrashModalComponent {
  @Input() title = '';
  @Output() restore = new EventEmitter<void>();
  @Output() deletePermanent = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
