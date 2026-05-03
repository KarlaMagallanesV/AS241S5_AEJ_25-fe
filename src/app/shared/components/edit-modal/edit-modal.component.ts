import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.scss'
})
export class EditModalComponent {
  @Input() title = '';
  @Input() favorite = false;
  @Output() save = new EventEmitter<boolean>();
  @Output() cancel = new EventEmitter<void>();

  current = false;

  ngOnChanges(): void {
    this.current = this.favorite;
  }

  toggle(): void {
    this.current = !this.current;
  }

  onSave(): void {
    this.save.emit(this.current);
  }
}
