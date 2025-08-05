import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-etiqueta-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etiqueta-form.component.html',
  styleUrls: ['./etiqueta-form.component.css']
})
export class EtiquetaFormComponent {
  @Input() etiqueta: any = null;
  @Input() modulos: any[] = [];
  @Input() modoEdicion = false;
  @Input() moduloSeleccionado: number | null = null;
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<void>();

  onGuardar() {
    // Aseguramos que la etiqueta tenga el módulo seleccionado
    if (!this.etiqueta.id_modulo && this.moduloSeleccionado) {
      this.etiqueta.id_modulo = this.moduloSeleccionado;
    }
    this.guardar.emit(this.etiqueta);
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 