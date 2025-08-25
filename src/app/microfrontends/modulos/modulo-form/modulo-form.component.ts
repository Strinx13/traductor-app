import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdiomasService, Idioma } from '../../idiomas/idiomas.service';
import { Modulo, ModuloCreateRequest, ModuloUpdateRequest } from '../modulos.service';
import { AlertService } from '../../../shared/services/alert.service';

@Component({
  selector: 'app-modulo-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulo-form.component.html',
  styleUrls: ['./modulo-form.component.css']
})
export class ModuloFormComponent implements OnInit {
  @Input() modulo: Modulo | null = null;
  @Input() modoEdicion = false;
  @Output() guardar = new EventEmitter<ModuloCreateRequest | ModuloUpdateRequest>();
  @Output() cancelar = new EventEmitter<void>();

  idiomas: Idioma[] = [];
  idiomasSeleccionados: number[] = [];
  nombreModulo: string = '';

  constructor(
    private idiomasService: IdiomasService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.cargarIdiomas();
    this.inicializarFormulario();
  }

  private cargarIdiomas() {
    this.idiomasService.getIdiomas().subscribe({
      next: (idiomas) => {
        this.idiomas = idiomas;
      },
      error: (error) => {
        console.error('Error al cargar idiomas:', error);
        this.alertService.showError('Error', 'No se pudieron cargar los idiomas');
      }
    });
  }

  private inicializarFormulario() {
    if (this.modoEdicion && this.modulo) {
      this.nombreModulo = this.modulo.nombre_modulo;
      this.idiomasSeleccionados = this.modulo.idiomas_seleccionados?.map(i => i.id_idioma) || [];
    } else {
      this.nombreModulo = '';
      this.idiomasSeleccionados = [];
    }
  }

  toggleIdioma(idIdioma: number) {
    const index = this.idiomasSeleccionados.indexOf(idIdioma);
    if (index > -1) {
      this.idiomasSeleccionados.splice(index, 1);
    } else {
      this.idiomasSeleccionados.push(idIdioma);
    }
  }

  isIdiomaSeleccionado(idIdioma: number): boolean {
    return this.idiomasSeleccionados.includes(idIdioma);
  }

  async onGuardar() {
    if (!this.nombreModulo.trim()) {
      this.alertService.showWarning('Validación', 'Por favor ingresa un nombre para el módulo');
      return;
    }

    if (this.idiomasSeleccionados.length === 0) {
      this.alertService.showWarning('Validación', 'Por favor selecciona al menos un idioma');
      return;
    }

    if (this.modoEdicion && this.modulo) {
      const moduloUpdate: ModuloUpdateRequest = {
        nombre_modulo: this.nombreModulo.trim(),
        idiomas_seleccionados: this.idiomasSeleccionados
      };
      this.guardar.emit(moduloUpdate);
    } else {
      const moduloCreate: ModuloCreateRequest = {
        nombre_modulo: this.nombreModulo.trim(),
        idiomas_seleccionados: this.idiomasSeleccionados
      };
      this.guardar.emit(moduloCreate);
    }
  }

  onCancelar() {
    this.cancelar.emit();
  }
} 