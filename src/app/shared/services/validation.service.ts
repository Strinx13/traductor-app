import { Injectable } from '@angular/core';

export interface ValidationError {
  message: string;
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  // Expresiones regulares para validación en el frontend
  private readonly VALIDATION_REGEX = {
    MODULE_NAME: /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/,
    ETIQUETA_DESCRIPTION: /^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ.,!?()]+$/,
    ISO_CODE: /^[A-Z]{2}$/,
    LANGUAGE_NAME: /^[a-zA-Z\sáéíóúÁÉÍÓÚñÑ]+$/,
    TRANSLATION_TEXT: /^[\s\S]*$/
  };

  // Mensajes de error
  private readonly VALIDATION_MESSAGES = {
    MODULE_NAME: 'El nombre del módulo solo puede contener letras, números, espacios, guiones y guiones bajos',
    ETIQUETA_DESCRIPTION: 'La descripción de la etiqueta contiene caracteres no permitidos',
    ISO_CODE: 'El código ISO debe ser exactamente 2 letras mayúsculas',
    LANGUAGE_NAME: 'El nombre del idioma solo puede contener letras y espacios',
    TRANSLATION_TEXT: 'El texto de traducción contiene caracteres no válidos'
  };

  // Validar un valor contra una expresión regular
  validateRegex(value: string, regex: RegExp, errorMessage: string): { isValid: boolean; error?: string } {
    if (!value || typeof value !== 'string') {
      return { isValid: false, error: 'El valor es requerido y debe ser una cadena de texto' };
    }
    
    if (!regex.test(value)) {
      return { isValid: false, error: errorMessage };
    }
    
    return { isValid: true };
  }

  // Validar datos de módulo
  validateModuleData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.nombre_modulo) {
      errors.push('El nombre del módulo es requerido');
    } else {
      const validation = this.validateRegex(
        data.nombre_modulo, 
        this.VALIDATION_REGEX.MODULE_NAME, 
        this.VALIDATION_MESSAGES.MODULE_NAME
      );
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validar datos de etiqueta
  validateEtiquetaData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.descripcion_etiqueta) {
      errors.push('La descripción de la etiqueta es requerida');
    } else {
      const validation = this.validateRegex(
        data.descripcion_etiqueta, 
        this.VALIDATION_REGEX.ETIQUETA_DESCRIPTION, 
        this.VALIDATION_MESSAGES.ETIQUETA_DESCRIPTION
      );
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

  // Validar datos de idioma
  validateIdiomaData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.nombre_idioma) {
      errors.push('El nombre del idioma es requerido');
    } else {
      const validation = this.validateRegex(
        data.nombre_idioma, 
        this.VALIDATION_REGEX.LANGUAGE_NAME, 
        this.VALIDATION_MESSAGES.LANGUAGE_NAME
      );
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }
    
    if (!data.codigo_iso) {
      errors.push('El código ISO es requerido');
    } else {
      const validation = this.validateRegex(
        data.codigo_iso, 
        this.VALIDATION_REGEX.ISO_CODE, 
        this.VALIDATION_MESSAGES.ISO_CODE
      );
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validar datos de traducción
  validateTraduccionData(data: any): { isValid: boolean; errors: string[] } {
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
      const validation = this.validateRegex(
        data.texto_traduccion, 
        this.VALIDATION_REGEX.TRANSLATION_TEXT, 
        this.VALIDATION_MESSAGES.TRANSLATION_TEXT
      );
      if (!validation.isValid) {
        errors.push(validation.error!);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Procesar errores de respuesta del servidor
  processServerErrors(error: any): ValidationError {
    if (error.error && error.error.errors && Array.isArray(error.error.errors)) {
      return {
        message: error.error.message || 'Error de validación',
        errors: error.error.errors
      };
    }
    
    return {
      message: 'Error del servidor',
      errors: [error.message || 'Error desconocido']
    };
  }

  // Limpiar y normalizar texto para mostrar
  sanitizeText(text: string): string {
    if (!text) return '';
    return text.trim();
  }

  // Generar identificador válido para TypeScript
  generateTypeScriptIdentifier(text: string): string {
    if (!text) return 'TRANSLATION';
    
    let identifier = text
      .toUpperCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    if (!identifier || !/^[a-zA-Z]/.test(identifier)) {
      identifier = 'TRANSLATION_' + identifier;
    }
    
    if (identifier.length > 50) {
      identifier = identifier.substring(0, 50);
    }
    
    return identifier;
  }

  // Nueva función para generar identificadores de TypeScript que preserve acentos
  generateTypeScriptIdentifierWithAccents(text: string): string {
    if (!text) return 'TRANSLATION';
    
    // Mapeo de caracteres acentuados a sus equivalentes sin acento para TypeScript
    const accentMap: { [key: string]: string } = {
      'á': 'A', 'é': 'E', 'í': 'I', 'ó': 'O', 'ú': 'U', 'ñ': 'N',
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U', 'Ñ': 'N',
      'à': 'A', 'è': 'E', 'ì': 'I', 'ò': 'O', 'ù': 'U',
      'À': 'A', 'È': 'E', 'Ì': 'I', 'Ò': 'O', 'Ù': 'U',
      'ä': 'A', 'ë': 'E', 'ï': 'I', 'ö': 'O', 'ü': 'U',
      'Ä': 'A', 'Ë': 'E', 'Ï': 'I', 'Ö': 'O', 'Ü': 'U',
      'â': 'A', 'ê': 'E', 'î': 'I', 'ô': 'O', 'û': 'U',
      'Â': 'A', 'Ê': 'E', 'Î': 'I', 'Ô': 'O', 'Û': 'U',
      'ã': 'A', 'õ': 'O', 'Ã': 'A', 'Õ': 'O'
    };
    
    let identifier = text
      .toUpperCase()
      .split('')
      .map(char => accentMap[char] || char)
      .join('')
      .replace(/[^A-Z0-9\s]/g, '') // Remover caracteres especiales restantes
      .replace(/\s+/g, '_')         // Reemplazar espacios con guiones bajos
      .replace(/_+/g, '_')          // Consolidar múltiples guiones bajos
      .replace(/^_|_$/g, '');       // Remover guiones bajos al inicio y final
    
    // Si el resultado está vacío o no empieza con letra, agregar prefijo
    if (!identifier || !/^[A-Z]/.test(identifier)) {
      identifier = 'TRANSLATION_' + identifier;
    }
    
    // Limitar longitud para evitar identificadores demasiado largos
    if (identifier.length > 50) {
      identifier = identifier.substring(0, 50);
    }
    
    return identifier;
  }

  // Función para generar identificadores de TypeScript que preserve acentos pero sea válido
  generateValidTypeScriptIdentifier(text: string): string {
    if (!text) return 'TRANSLATION';
    
    // Primero intentar con la función que preserva acentos
    let identifier = this.generateTypeScriptIdentifierWithAccents(text);
    
    // Verificar si el identificador es válido para TypeScript
    if (/^[A-Z][A-Z0-9_]*$/.test(identifier)) {
      return identifier;
    }
    
    // Si no es válido, usar la función original
    return this.generateTypeScriptIdentifier(text);
  }
}
