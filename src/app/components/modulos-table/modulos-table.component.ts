import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModulosService, Modulo } from '../../services/modulos.service';

@Component({
  selector: 'app-modulos-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modulos-table.component.html',
  styleUrls: ['./modulos-table.component.css']
})
export class ModulosTableComponent implements OnInit {
  modulos: Modulo[] = [];
  moduloSeleccionado: Modulo | null = null;
  modoEdicion = false;

  constructor(private modulosService: ModulosService) {}

  ngOnInit() {
    this.cargarModulos();
  }

  cargarModulos() {
    this.modulosService.getModulos().subscribe({
      next: (data) => {
        this.modulos = data;
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
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
    // Aquí podrías abrir un modal o un formulario
  }

  editarModulo(modulo: Modulo) {
    this.modoEdicion = true;
    this.moduloSeleccionado = { ...modulo };
    // Aquí podrías abrir un modal o un formulario
  }

  guardarModulo(modulo: Modulo) {
    if (this.modoEdicion) {
      this.modulosService.actualizarModulo(modulo.id_modulo, modulo).subscribe({
        next: () => {
          this.cargarModulos();
          this.moduloSeleccionado = null;
        },
        error: (error) => {
          console.error('Error al actualizar módulo:', error);
        }
      });
    } else {
      this.modulosService.crearModulo(modulo).subscribe({
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

  exportarModulo(modulo: Modulo) {
    // Implementar lógica de exportación
    console.log('Exportar módulo:', modulo);
  }

  eliminarModulo(modulo: Modulo) {
    if (confirm('¿Está seguro de que desea eliminar este módulo?')) {
      this.modulosService.eliminarModulo(modulo.id_modulo).subscribe({
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
