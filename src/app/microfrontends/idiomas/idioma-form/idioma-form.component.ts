import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService } from '../../../shared/services/alert.service';

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

  constructor(private alertService: AlertService) {}

  onGuardar() {
    // Validar que se haya ingresado un nombre
    if (!this.idioma.nombre_idioma || !this.idioma.nombre_idioma.trim()) {
      this.alertService.showWarning('Validación', 'Por favor ingresa un nombre para el idioma');
      return;
    }

    // Validar que se haya ingresado un código ISO
    if (!this.idioma.codigo_iso || !this.idioma.codigo_iso.trim()) {
      this.alertService.showWarning('Validación', 'Por favor ingresa un código ISO para el idioma');
      return;
    }

    // Validar que el código ISO tenga máximo 3 caracteres
    if (this.idioma.codigo_iso.trim().length > 3) {
      this.alertService.showWarning('Validación', 'El código ISO debe tener máximo 3 caracteres');
      return;
    }

    this.guardar.emit(this.idioma);
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 