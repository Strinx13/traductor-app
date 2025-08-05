import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modulo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulo-form.component.html',
  styleUrls: ['./modulo-form.component.css']
})
export class ModuloFormComponent {
  @Input() modulo: any = null;
  @Input() modoEdicion = false;
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  onGuardar() {
    this.guardar.emit(this.modulo);
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 