export interface NotificationConfig {
  // Configuración general
  autoClose: boolean;
  duration: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  
  // Configuración de tipos
  success: {
    icon: string;
    color: string;
    duration: number;
  };
  
  error: {
    icon: string;
    color: string;
    duration: number;
  };
  
  warning: {
    icon: string;
    color: string;
    duration: number;
  };
  
  info: {
    icon: string;
    color: string;
    duration: number;
  };
}

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  autoClose: true,
  duration: 5000,
  position: 'top-right',
  
  success: {
    icon: '✓',
    color: 'green',
    duration: 3000
  },
  
  error: {
    icon: '✕',
    color: 'red',
    duration: 8000
  },
  
  warning: {
    icon: '⚠',
    color: 'yellow',
    duration: 5000
  },
  
  info: {
    icon: 'ℹ',
    color: 'blue',
    duration: 4000
  }
};

// Mensajes predefinidos para diferentes operaciones
export const NOTIFICATION_MESSAGES = {
  // Operaciones CRUD
  CREATE: {
    SUCCESS: 'ha sido creado correctamente',
    ERROR: 'No se pudo crear',
    CONFIRM: '¿Está seguro de que desea crear'
  },
  
  UPDATE: {
    SUCCESS: 'ha sido actualizado correctamente',
    ERROR: 'No se pudo actualizar',
    CONFIRM: '¿Está seguro de que desea actualizar'
  },
  
  DELETE: {
    SUCCESS: 'ha sido eliminado correctamente',
    ERROR: 'No se pudo eliminar',
    CONFIRM: '¿Está seguro de que desea eliminar'
  },
  
  // Operaciones especiales
  EXPORT: {
    SUCCESS: 'El archivo ha sido exportado correctamente',
    ERROR: 'No se pudo exportar el archivo'
  },
  
  IMPORT: {
    SUCCESS: 'Los datos han sido importados correctamente',
    ERROR: 'No se pudo importar los datos'
  },
  
  // Validaciones
  VALIDATION: {
    REQUIRED_FIELDS: 'Por favor completa todos los campos obligatorios',
    INVALID_DATA: 'Los datos ingresados no son válidos',
    SELECTION_REQUIRED: 'Por favor selecciona una opción'
  },
  
  // Errores de conexión
  CONNECTION: {
    SERVER_ERROR: 'Ha ocurrido un error interno en el servidor',
    NETWORK_ERROR: 'No se puede conectar con el servidor',
    TIMEOUT_ERROR: 'La operación ha tardado demasiado tiempo'
  }
};

// Recursos disponibles en la aplicación
export const RESOURCE_NAMES = {
  MODULO: 'Módulo',
  MODULOS: 'Módulos',
  ETIQUETA: 'Etiqueta',
  ETIQUETAS: 'Etiquetas',
  IDIOMA: 'Idioma',
  IDIOMAS: 'Idiomas',
  TRADUCCION: 'Traducción',
  TRADUCCIONES: 'Traducciones',
  ARCHIVO: 'Archivo',
  DATOS: 'Datos'
};
