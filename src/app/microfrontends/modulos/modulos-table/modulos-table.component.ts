import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ModuloFormComponent } from '../modulo-form/modulo-form.component';

@Component({
  selector: 'app-modulos-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ModuloFormComponent],
  templateUrl: './modulos-table.component.html',
  styleUrls: ['./modulos-table.component.css']
})
export class ModulosTableComponent implements OnInit {
  modulos: any[] = [];
  moduloSeleccionado: any | null = null;
  modoEdicion = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarModulos();
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

  agregarModulo() {
    this.modoEdicion = false;
    this.moduloSeleccionado = {
      id_modulo: 0,
      nombre_modulo: '',
      porcentaje_avance: 0
    };
  }

  editarModulo(modulo: any) {
    this.modoEdicion = true;
    this.moduloSeleccionado = { ...modulo };
  }

  guardarModulo(modulo: any) {
    if (this.modoEdicion) {
      this.http.put(`http://localhost:3000/api/modulos/${modulo.id_modulo}`, modulo).subscribe({
        next: () => {
          this.cargarModulos();
          this.moduloSeleccionado = null;
        },
        error: (error) => {
          console.error('Error al actualizar módulo:', error);
        }
      });
    } else {
      this.http.post('http://localhost:3000/api/modulos', modulo).subscribe({
        next: () => {
          this.cargarModulos();
          this.moduloSeleccionado = null;
        },
        error: (error) => {
          console.error('Error al crear módulo:', error);
        }
      });
    }
  }

  cerrarFormulario() {
    this.moduloSeleccionado = null;
  }

  exportarModulo(modulo: any) {
    // Implementar lógica de exportación
    console.log('Exportar módulo:', modulo);
  }

  eliminarModulo(modulo: any) {
    if (confirm('¿Está seguro de que desea eliminar este módulo?')) {
      this.http.delete(`http://localhost:3000/api/modulos/${modulo.id_modulo}`).subscribe({
        next: () => {
          this.cargarModulos();
        },
        error: (error) => {
          console.error('Error al eliminar módulo:', error);
        }
      });
    }
  }
}
