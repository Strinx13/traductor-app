import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloFormComponent } from '../modulo-form/modulo-form.component';
import { ModulosService, Modulo, ModuloCreateRequest, ModuloUpdateRequest } from '../modulos.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modulos-table',
  standalone: true,
  imports: [CommonModule, FormsModule, ModuloFormComponent],
  templateUrl: './modulos-table.component.html',
  styleUrls: ['./modulos-table.component.css']
})
export class ModulosTableComponent implements OnInit, OnDestroy {
  modulos: Modulo[] = [];
  moduloSeleccionado: Modulo | null = null;
  modoEdicion = false;
  private subscription = new Subscription();

  constructor(
    private modulosService: ModulosService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cargarModulos();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  cargarModulos() {
    this.subscription.add(
      this.modulosService.modulos$.subscribe({
        next: (modulos) => {
          this.modulos = modulos;
        },
        error: (error) => {
          console.error('Error al cargar módulos:', error);
          this.notificationService.showError('Error', 'No se pudieron cargar los módulos');
        }
      })
    );
  }

  agregarModulo() {
    this.modoEdicion = false;
    this.moduloSeleccionado = {
      id_modulo: 0,
      nombre_modulo: '',
      porcentaje_avance: 0,
      idiomas_seleccionados: []
    };
  }

  editarModulo(modulo: Modulo) {
    this.modoEdicion = true;
    this.moduloSeleccionado = { ...modulo };
  }

  guardarModulo(moduloData: ModuloCreateRequest | ModuloUpdateRequest) {
    if (this.modoEdicion && this.moduloSeleccionado) {
      this.subscription.add(
        this.modulosService.actualizarModulo(this.moduloSeleccionado.id_modulo, moduloData as ModuloUpdateRequest).subscribe({
          next: () => {
            this.moduloSeleccionado = null;
            this.notificationService.showManualSuccess('Éxito', 'Módulo actualizado correctamente');
          },
          error: (error) => {
            console.error('Error al actualizar módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo actualizar el módulo');
          }
        })
      );
    } else {
      this.subscription.add(
        this.modulosService.crearModulo(moduloData as ModuloCreateRequest).subscribe({
          next: () => {
            this.moduloSeleccionado = null;
            this.notificationService.showManualSuccess('Éxito', 'Módulo creado correctamente');
          },
          error: (error) => {
            console.error('Error al crear módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo crear el módulo');
          }
        })
      );
    }
  }

  cerrarFormulario() {
    this.moduloSeleccionado = null;
  }

  exportarModulo(modulo: Modulo) {
    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = `http://localhost:3000/api/etiquetas/export/translations/${modulo.id_modulo}`;
    link.download = `${modulo.nombre_modulo.replace(/\s+/g, '')}Translation.ts`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showExportSuccess();
  }

  async eliminarModulo(modulo: Modulo) {
    const confirmed = await this.notificationService.showConfirmDelete('el módulo');
    if (confirmed) {
      this.subscription.add(
        this.modulosService.eliminarModulo(modulo.id_modulo).subscribe({
          next: () => {
            this.notificationService.showManualSuccess('Éxito', 'Módulo eliminado correctamente');
          },
          error: (error) => {
            console.error('Error al eliminar módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo eliminar el módulo');
          }
        })
      );
    }
  }

  getIdsIdiomasSeleccionados(modulo: Modulo): string {
    if (!modulo.idiomas_seleccionados || modulo.idiomas_seleccionados.length === 0) {
      return 'Ninguno';
    }
    return modulo.idiomas_seleccionados.map(i => i.codigo_iso).join(', ');
  }
}
