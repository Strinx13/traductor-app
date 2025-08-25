import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';

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

  constructor(private alertService: AlertService) {}

  onGuardar() {
    // Validar que se haya ingresado una descripción
    if (!this.etiqueta.descripcion_etiqueta || !this.etiqueta.descripcion_etiqueta.trim()) {
      this.alertService.showWarning('Validación', 'Por favor ingresa una descripción para la etiqueta');
      return;
    }

    // Validar que se haya seleccionado un módulo
    if (!this.etiqueta.id_modulo && this.moduloSeleccionado) {
      this.etiqueta.id_modulo = this.moduloSeleccionado;
    }

    if (!this.etiqueta.id_modulo) {
      this.alertService.showWarning('Validación', 'Por favor selecciona un módulo para la etiqueta');
      return;
    }
    
    // En modo edición, asegurar que se envíen todos los campos
    if (this.modoEdicion) {
      // Asegurar que el porcentaje de traducción se mantenga
      if (this.etiqueta.porcentaje_traduccion === undefined || this.etiqueta.porcentaje_traduccion === null) {
        this.etiqueta.porcentaje_traduccion = 0;
      }
    }
    
    this.guardar.emit(this.etiqueta);
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 