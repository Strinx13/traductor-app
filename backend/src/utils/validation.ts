// Expresiones regulares para validación
export const VALIDATION_REGEX = {
  // Validar nombres de módulos (solo letras, números, espacios y guiones)
  MODULE_NAME: /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/,
  
  // Validar descripciones de etiquetas (texto con caracteres especiales permitidos)
  ETIQUETA_DESCRIPTION: /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ.,!?()]+$/,
  
  // Validar códigos ISO de idiomas (exactamente 2 caracteres alfabéticos)
  ISO_CODE: /^[A-Z]{2}$/,
  
  // Validar nombres de idiomas (solo letras y espacios)
  LANGUAGE_NAME: /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/,
  
  // Validar texto de traducción (texto con caracteres especiales y emojis)
  TRANSLATION_TEXT: /^[\s\S]*$/,
  
  // Validar nombres de archivos (solo letras, números, guiones y guiones bajos)
  FILENAME: /^[a-zA-Z0-9_-]+$/,
  
  // Validar identificadores de TypeScript (para claves de traducción)
  TYPESCRIPT_IDENTIFIER: /^[a-zA-Z_][a-zA-Z0-9_]*$/
};

// Mensajes de error para cada validación
export const VALIDATION_MESSAGES = {
  MODULE_NAME: 'El nombre del módulo solo puede contener letras, números, espacios, guiones y guiones bajos',
  ETIQUETA_DESCRIPTION: 'La descripción de la etiqueta contiene caracteres no permitidos',
  ISO_CODE: 'El código ISO debe ser exactamente 2 letras mayúsculas',
  LANGUAGE_NAME: 'El nombre del idioma solo puede contener letras y espacios',
  TRANSLATION_TEXT: 'El texto de traducción contiene caracteres no válidos',
  FILENAME: 'El nombre del archivo solo puede contener letras, números, guiones y guiones bajos',
  TYPESCRIPT_IDENTIFIER: 'El identificador no es válido para TypeScript'
};

// Función para validar un valor contra una expresión regular
export function validateRegex(value: string, regex: RegExp, errorMessage: string): { isValid: boolean; error?: string } {
  if (!value || typeof value !== 'string') {
    return { isValid: false, error: 'El valor es requerido y debe ser una cadena de texto' };
  }
  
  if (!regex.test(value)) {
    return { isValid: false, error: errorMessage };
  }
  
  return { isValid: true };
}

// Función para limpiar y normalizar texto para exportación
export function sanitizeForExport(text: string, type: 'module' | 'etiqueta' | 'translation' | 'filename'): string {
  if (!text) return '';
  
  let sanitized = text.trim();
  
  switch (type) {
    case 'module':
      // Para módulos: solo letras, números, espacios, guiones y guiones bajos
      sanitized = sanitized.replace(/[^a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]/g, '');
      break;
      
    case 'etiqueta':
      // Para etiquetas: permitir caracteres especiales pero limpiar algunos problemáticos
      sanitized = sanitized.replace(/[<>]/g, ''); // Remover < y > que pueden causar problemas
      break;
      
    case 'translation':
      // Para traducciones: escapar caracteres especiales para TypeScript
      sanitized = sanitized
        .replace(/\\/g, '\\\\') // Escapar backslashes
        .replace(/'/g, "\\'")   // Escapar comillas simples
        .replace(/\n/g, '\\n')  // Escapar saltos de línea
        .replace(/\r/g, '\\r')  // Escapar retornos de carro
        .replace(/\t/g, '\\t'); // Escapar tabulaciones
      break;
      
    case 'filename':
      // Para nombres de archivo: solo caracteres seguros
      sanitized = sanitized.replace(/[^a-zA-Z0-9_-]/g, '_');
      break;
  }
  
  return sanitized;
}

// Función para generar un identificador válido para TypeScript
export function generateTypeScriptIdentifier(text: string): string {
  if (!text) return 'TRANSLATION';
  
  // Convertir a mayúsculas y reemplazar espacios y caracteres especiales con guiones bajos
  let identifier = text
    .toUpperCase()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '_')           // Reemplazar espacios con guiones bajos
    .replace(/_+/g, '_')            // Consolidar múltiples guiones bajos
    .replace(/^_|_$/g, '');         // Remover guiones bajos al inicio y final
  
  // Si el resultado está vacío o no empieza con letra, agregar prefijo
  if (!identifier || !/^[a-zA-Z]/.test(identifier)) {
    identifier = 'TRANSLATION_' + identifier;
  }
  
  // Limitar longitud para evitar identificadores demasiado largos
  if (identifier.length > 50) {
    identifier = identifier.substring(0, 50);
  }
  
  return identifier;
}

// Función para validar datos completos de un módulo
export function validateModuleData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nombre_modulo) {
    errors.push('El nombre del módulo es requerido');
  } else {
    const validation = validateRegex(data.nombre_modulo, VALIDATION_REGEX.MODULE_NAME, VALIDATION_MESSAGES.MODULE_NAME);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para validar datos completos de una etiqueta
export function validateEtiquetaData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.descripcion_etiqueta) {
    errors.push('La descripción de la etiqueta es requerida');
  } else {
    const validation = validateRegex(data.descripcion_etiqueta, VALIDATION_REGEX.ETIQUETA_DESCRIPTION, VALIDATION_MESSAGES.ETIQUETA_DESCRIPTION);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  if (!data.id_modulo || isNaN(data.id_modulo)) {
    errors.push('El ID del módulo es requerido y debe ser un número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para validar datos completos de un idioma
export function validateIdiomaData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.nombre_idioma) {
    errors.push('El nombre del idioma es requerido');
  } else {
    const validation = validateRegex(data.nombre_idioma, VALIDATION_REGEX.LANGUAGE_NAME, VALIDATION_MESSAGES.LANGUAGE_NAME);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  if (!data.codigo_iso) {
    errors.push('El código ISO es requerido');
  } else {
    const validation = validateRegex(data.codigo_iso, VALIDATION_REGEX.ISO_CODE, VALIDATION_MESSAGES.ISO_CODE);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para validar datos completos de una traducción
export function validateTraduccionData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.id_etiqueta || isNaN(data.id_etiqueta)) {
    errors.push('El ID de la etiqueta es requerido y debe ser un número');
  }
  
  if (!data.id_idioma || isNaN(data.id_idioma)) {
    errors.push('El ID del idioma es requerido y debe ser un número');
  }
  
  if (!data.texto_traduccion) {
    errors.push('El texto de traducción es requerido');
  } else {
    const validation = validateRegex(data.texto_traduccion, VALIDATION_REGEX.TRANSLATION_TEXT, VALIDATION_MESSAGES.TRANSLATION_TEXT);
    if (!validation.isValid) {
      errors.push(validation.error!);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Función para validar solo el texto de traducción (para actualizaciones)
export function validateTraduccionUpdateData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.texto_traduccion) {
    errors.push('El texto de traducción es requerido');
  } else if (typeof data.texto_traduccion !== 'string') {
    errors.push('El texto de traducción debe ser una cadena de texto');
  } else {
    const texto = data.texto_traduccion.trim();
    if (texto.length === 0) {
      errors.push('El texto de traducción no puede estar vacío');
    } else {
      const validation = validateRegex(texto, VALIDATION_REGEX.TRANSLATION_TEXT, VALIDATION_MESSAGES.TRANSLATION_TEXT);
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
