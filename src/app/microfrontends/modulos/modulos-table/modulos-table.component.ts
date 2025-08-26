import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModuloFormComponent } from '../modulo-form/modulo-form.component';
import { ModulosService, Modulo, ModuloCreateRequest, ModuloUpdateRequest } from '../modulos.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ValidationService } from '../../../shared/services/validation.service';
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
    private notificationService: NotificationService,
    private toastService: ToastService,
    private validationService: ValidationService
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
            this.toastService.showSuccess('Módulo actualizado satisfactoriamente');
          },
          error: (error) => {
            console.error('Error al actualizar módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo actualizar el módulo');
            this.toastService.showError('Error al actualizar el módulo');
          }
        })
      );
    } else {
      this.subscription.add(
        this.modulosService.crearModulo(moduloData as ModuloCreateRequest).subscribe({
          next: () => {
            this.moduloSeleccionado = null;
            this.notificationService.showManualSuccess('Éxito', 'Módulo creado correctamente');
            this.toastService.showSuccess('Módulo creado satisfactoriamente');
          },
          error: (error) => {
            console.error('Error al crear módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo crear el módulo');
            this.toastService.showError('Error al crear el módulo');
          }
        })
      );
    }
  }

  cerrarFormulario() {
    this.moduloSeleccionado = null;
  }

  exportarModulo(modulo: Modulo) {
    // Verificar si el módulo tiene etiquetas antes de intentar exportar
    if (!modulo.idiomas_seleccionados || modulo.idiomas_seleccionados.length === 0) {
      this.toastService.showWarning('No se puede exportar: El módulo no tiene idiomas seleccionados');
      return;
    }
    
    // Mostrar mensaje de carga
    this.toastService.showInfo('Exportando módulo...');
    
    // Exportar el módulo
    fetch(`http://localhost:3000/api/etiquetas/export/translations/${modulo.id_modulo}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            throw new Error(errorData.message || 'Error al exportar');
          });
        }
        return response.blob();
      })
      .then(blob => {
        // Crear URL del blob y descargar
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${modulo.nombre_modulo.replace(/\s+/g, '')}Translation.ts`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.toastService.showSuccess('Módulo exportado correctamente');
      })
      .catch(error => {
        console.error('Error al exportar:', error);
        
        let errorMessage = 'Error al exportar el módulo';
        if (error.message && error.message.includes('no tiene etiquetas')) {
          errorMessage = 'No se puede exportar: El módulo no tiene etiquetas';
        }
        
        this.toastService.showError(errorMessage);
      });
  }

  async eliminarModulo(modulo: Modulo) {
    const confirmed = await this.notificationService.showConfirmDelete('el módulo');
    if (confirmed) {
      this.subscription.add(
        this.modulosService.eliminarModulo(modulo.id_modulo).subscribe({
          next: () => {
            this.notificationService.showManualSuccess('Éxito', 'Módulo eliminado correctamente');
            this.toastService.showSuccess('Módulo eliminado satisfactoriamente');
          },
          error: (error) => {
            console.error('Error al eliminar módulo:', error);
            this.notificationService.showManualError('Error', 'No se pudo eliminar el módulo');
            this.toastService.showError('Error al eliminar el módulo');
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
