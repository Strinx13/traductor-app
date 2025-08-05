import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EtiquetaFormComponent } from '../etiqueta-form/etiqueta-form.component';
import { TraduccionesComponent } from '../traducciones/traducciones.component';

@Component({
  selector: 'app-etiquetas-table',
  standalone: true,
  imports: [CommonModule, FormsModule, EtiquetaFormComponent, TraduccionesComponent],
  templateUrl: './etiquetas-table.component.html',
  styleUrls: ['./etiquetas-table.component.css']
})
export class EtiquetasTableComponent implements OnInit {
  etiquetas: any[] = [];
  etiquetaSeleccionada: any | null = null;
  modoEdicion = false;
  modulos: any[] = [];
  moduloSeleccionado: number | null = null;
  idiomas: any[] = [];
  etiquetaTraducciones: any | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarEtiquetas();
    this.cargarModulos();
    this.cargarIdiomas();
  }

  get etiquetasFiltradas() {
    if (!this.moduloSeleccionado) return [];
    return this.etiquetas.filter(e => e.id_modulo === this.moduloSeleccionado);
  }

  cargarEtiquetas() {
    this.http.get<any[]>('http://localhost:3000/api/etiquetas').subscribe({
      next: (data) => {
        this.etiquetas = data;
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    });
  }

  cargarModulos() {
    this.http.get<any[]>('http://localhost:3000/api/modulos').subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  cargarIdiomas() {
    this.http.get<any[]>('http://localhost:3000/api/idiomas').subscribe({
      next: (data) => {
        this.idiomas = data;
      },
      error: (error) => {
        console.error('Error al cargar idiomas:', error);
      }
    });
  }

  agregarEtiqueta() {
    if (!this.moduloSeleccionado) return;
    this.modoEdicion = false;
    this.etiquetaSeleccionada = {
      id_etiqueta: 0,
      descripcion_etiqueta: '',
      id_modulo: this.moduloSeleccionado,
      porcentaje_traduccion: 0
    };
  }

  editarEtiqueta(etiqueta: any) {
    this.modoEdicion = true;
    this.etiquetaSeleccionada = { ...etiqueta };
  }

  guardarEtiqueta(etiqueta: any) {
    if (this.modoEdicion) {
      this.http.put(`http://localhost:3000/api/etiquetas/${etiqueta.id_etiqueta}`, etiqueta).subscribe({
        next: () => {
          this.cargarEtiquetas();
          this.etiquetaSeleccionada = null;
        },
        error: (error) => {
          console.error('Error al actualizar etiqueta:', error);
        }
      });
    } else {
      this.http.post('http://localhost:3000/api/etiquetas', etiqueta).subscribe({
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

  cerrarFormulario() {
    this.etiquetaSeleccionada = null;
  }

  abrirTraducciones(etiqueta: any) {
    this.etiquetaTraducciones = etiqueta;
  }

  cerrarTraducciones() {
    this.etiquetaTraducciones = null;
  }

  eliminarEtiqueta(etiqueta: any) {
    if (confirm('¿Está seguro de que desea eliminar esta etiqueta?')) {
      this.http.delete(`http://localhost:3000/api/etiquetas/${etiqueta.id_etiqueta}`).subscribe({
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
