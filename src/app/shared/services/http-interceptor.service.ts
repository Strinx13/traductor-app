import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { inject } from '@angular/core';
import { AlertService } from './alert.service';

// Funciones auxiliares
function getOperationType(method: string): string {
  switch (method) {
    case 'GET': return 'consulta';
    case 'POST': return 'creación';
    case 'PUT': return 'actualización';
    case 'DELETE': return 'eliminación';
    default: return 'operación';
  }
}

function getResourceName(url: string): string {
  // Extraer el nombre del recurso de la URL
  const urlParts = url.split('/');
  const resource = urlParts[urlParts.length - 1];
  
  // Mapear nombres de recursos a nombres más amigables
  const resourceMap: { [key: string]: string } = {
    'modulos': 'Módulo',
    'idiomas': 'Idioma',
    'etiquetas': 'Etiqueta',
    'traducciones': 'Traducción',
    'exportar': 'Archivo de exportación'
  };

  return resourceMap[resource] || 'Recurso';
}

// Interceptor HTTP
export const HttpInterceptorService: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> => {
  const alertService = inject(AlertService);

  // Determinar el tipo de operación basado en el método HTTP
  const operationType = getOperationType(request.method);
  const resourceName = getResourceName(request.url);

  // Verificar si se debe mostrar alerta automática (no mostrar si hay headers personalizados)
  const shouldShowAutoAlert = !request.headers.has('X-Skip-Notification');

  return next(request).pipe(
    tap((event: any) => {
      // Mostrar alerta de éxito para operaciones POST, PUT, DELETE solo si no se desactivó
      if (shouldShowAutoAlert && event.status && event.status >= 200 && event.status < 300) {
        if (request.method === 'POST') {
          alertService.showSuccess(
            'Operación Exitosa',
            `${resourceName} creado correctamente`
          );
        } else if (request.method === 'PUT') {
          alertService.showSuccess(
            'Operación Exitosa',
            `${resourceName} actualizado correctamente`
          );
        } else if (request.method === 'DELETE') {
          alertService.showSuccess(
            'Operación Exitosa',
            `${resourceName} eliminado correctamente`
          );
        }
      }
    }),
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error inesperado';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        if (error.status === 0) {
          errorMessage = 'No se puede conectar con el servidor';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Datos inválidos';
        } else if (error.status === 401) {
          errorMessage = 'No autorizado';
        } else if (error.status === 403) {
          errorMessage = 'Acceso denegado';
        } else if (error.status === 404) {
          errorMessage = `${resourceName} no encontrado`;
        } else if (error.status === 409) {
          errorMessage = 'Conflicto: El recurso ya existe';
        } else if (error.status === 422) {
          errorMessage = error.error?.message || 'Datos de validación incorrectos';
        } else if (error.status >= 500) {
          errorMessage = 'Error interno del servidor';
        } else {
          errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
        }
      }

      alertService.showError(
        'Error en la Operación',
        errorMessage
      );

      return throwError(() => error);
    })
  );
};
