import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';

export interface NotificationConfig {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  autoClose?: boolean;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private alertService: AlertService) {}

  // Notificaciones de éxito
  showSuccess(title: string, message: string): void {
    this.alertService.showSuccess(title, message);
  }

  // Notificaciones de error
  showError(title: string, message: string): void {
    this.alertService.showError(title, message);
  }

  // Notificaciones de advertencia
  showWarning(title: string, message: string): void {
    this.alertService.showWarning(title, message);
  }

  // Notificaciones informativas
  showInfo(title: string, message: string): void {
    this.alertService.showInfo(title, message);
  }

  // Notificaciones específicas para operaciones CRUD
  showCreateSuccess(resourceName: string): void {
    this.showSuccess(
      'Creación Exitosa',
      `${resourceName} ha sido creado correctamente`
    );
  }

  showUpdateSuccess(resourceName: string): void {
    this.showSuccess(
      'Actualización Exitosa',
      `${resourceName} ha sido actualizado correctamente`
    );
  }

  showDeleteSuccess(resourceName: string): void {
    this.showSuccess(
      'Eliminación Exitosa',
      `${resourceName} ha sido eliminado correctamente`
    );
  }

  showCreateError(resourceName: string, error?: string): void {
    this.showError(
      'Error al Crear',
      `No se pudo crear ${resourceName.toLowerCase()}. ${error || ''}`
    );
  }

  showUpdateError(resourceName: string, error?: string): void {
    this.showError(
      'Error al Actualizar',
      `No se pudo actualizar ${resourceName.toLowerCase()}. ${error || ''}`
    );
  }

  showDeleteError(resourceName: string, error?: string): void {
    this.showError(
      'Error al Eliminar',
      `No se pudo eliminar ${resourceName.toLowerCase()}. ${error || ''}`
    );
  }

  // Notificaciones para validaciones
  showValidationError(field: string): void {
    this.showWarning(
      'Error de Validación',
      `Por favor completa el campo: ${field}`
    );
  }

  showRequiredFieldsError(): void {
    this.showWarning(
      'Campos Requeridos',
      'Por favor completa todos los campos obligatorios'
    );
  }

  // Notificaciones para operaciones especiales
  showExportSuccess(): void {
    this.showSuccess(
      'Exportación Exitosa',
      'El archivo ha sido exportado correctamente'
    );
  }

  showExportError(error?: string): void {
    this.showError(
      'Error en Exportación',
      `No se pudo exportar el archivo. ${error || ''}`
    );
  }

  showImportSuccess(): void {
    this.showSuccess(
      'Importación Exitosa',
      'Los datos han sido importados correctamente'
    );
  }

  showImportError(error?: string): void {
    this.showError(
      'Error en Importación',
      `No se pudo importar los datos. ${error || ''}`
    );
  }

  // Notificaciones para cambios de estado
  showStatusChangeSuccess(resourceName: string, newStatus: string): void {
    this.showSuccess(
      'Estado Actualizado',
      `${resourceName} ha sido ${newStatus} correctamente`
    );
  }

  // Notificaciones para operaciones en lote
  showBulkOperationSuccess(operation: string, count: number): void {
    this.showSuccess(
      'Operación en Lote Exitosa',
      `${count} elementos han sido ${operation} correctamente`
    );
  }

  showBulkOperationError(operation: string, error?: string): void {
    this.showError(
      'Error en Operación en Lote',
      `No se pudo completar la ${operation}. ${error || ''}`
    );
  }

  // Notificaciones para conexión
  showConnectionError(): void {
    this.showError(
      'Error de Conexión',
      'No se puede conectar con el servidor. Verifica tu conexión a internet.'
    );
  }

  showServerError(): void {
    this.showError(
      'Error del Servidor',
      'Ha ocurrido un error interno en el servidor. Inténtalo de nuevo más tarde.'
    );
  }

  // Notificaciones para confirmaciones
  showConfirmDelete(resourceName: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.alertService.showConfirm(
        'Confirmar Eliminación',
        `¿Estás seguro de que deseas eliminar ${resourceName.toLowerCase()}? Esta acción no se puede deshacer.`
      ).subscribe(result => {
        resolve(result);
      });
    });
  }

  showConfirmAction(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.alertService.showConfirm(title, message).subscribe(result => {
        resolve(result);
      });
    });
  }

  // Método para mostrar notificaciones manuales sin interferir con el interceptor
  showManualSuccess(title: string, message: string): void {
    this.alertService.showSuccess(title, message);
  }

  showManualError(title: string, message: string): void {
    this.alertService.showError(title, message);
  }

  showManualWarning(title: string, message: string): void {
    this.alertService.showWarning(title, message);
  }

  showManualInfo(title: string, message: string): void {
    this.alertService.showInfo(title, message);
  }
}
