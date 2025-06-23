import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtiquetasService, Etiqueta } from '../../services/etiquetas.service';
import { ModulosService } from '../../services/modulos.service';

@Component({
  selector: 'app-etiquetas-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './etiquetas-table.component.html',
  styleUrls: ['./etiquetas-table.component.css']
})
export class EtiquetasTableComponent implements OnInit {
  etiquetas: Etiqueta[] = [];
  etiquetaSeleccionada: Etiqueta | null = null;
  modoEdicion = false;
  modulos: any[] = [];

  constructor(
    private etiquetasService: EtiquetasService,
    private modulosService: ModulosService
  ) {}

  ngOnInit() {
    this.cargarEtiquetas();
    this.cargarModulos();
  }

  cargarEtiquetas() {
    this.etiquetasService.getEtiquetas().subscribe({
      next: (data) => {
        this.etiquetas = data;
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    });
  }

  cargarModulos() {
    this.modulosService.getModulos().subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  agregarEtiqueta() {
    this.modoEdicion = false;
    this.etiquetaSeleccionada = {
      id_etiqueta: 0,
      descripcion_etiqueta: '',
      id_modulo: 0,
      porcentaje_traduccion: 0
    };
  }

  editarEtiqueta(etiqueta: Etiqueta) {
    this.modoEdicion = true;
    this.etiquetaSeleccionada = { ...etiqueta };
  }

  guardarEtiqueta(etiqueta: Etiqueta) {
    if (this.modoEdicion) {
      this.etiquetasService.actualizarEtiqueta(etiqueta.id_etiqueta, etiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
          this.etiquetaSeleccionada = null;
        },
        error: (error) => {
          console.error('Error al actualizar etiqueta:', error);
        }
      });
    } else {
      this.etiquetasService.crearEtiqueta(etiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
          this.etiquetaSeleccionada = null;
        },
        error: (error) => {
          console.error('Error al crear etiqueta:', error);
        }
      });
    }
  }

  eliminarEtiqueta(etiqueta: Etiqueta) {
    if (confirm('¿Está seguro de que desea eliminar esta etiqueta?')) {
      this.etiquetasService.eliminarEtiqueta(etiqueta.id_etiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
        },
        error: (error) => {
          console.error('Error al eliminar etiqueta:', error);
        }
      });
    }
  }

  getNombreModulo(idModulo: number): string {
    const modulo = this.modulos.find(m => m.id_modulo === idModulo);
    return modulo ? modulo.nombre_modulo : 'Módulo no encontrado';
  }
}
