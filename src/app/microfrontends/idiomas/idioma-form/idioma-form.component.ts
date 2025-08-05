import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-idioma-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idioma-form.component.html',
  styleUrls: ['./idioma-form.component.css']
})
export class IdiomaFormComponent {
  @Input() idioma: any = null;
  @Input() modoEdicion = false;
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  onGuardar() {
    this.guardar.emit(this.idioma);
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 