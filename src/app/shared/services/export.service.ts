import { Injectable } from '@angular/core';
import { ValidationService } from './validation.service';

export interface ExportPreview {
  originalText: string;
  typescriptIdentifier: string;
  isValid: boolean;
  warning?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private validationService: ValidationService) {}

  /**
   * Previsualiza cómo se verá un texto cuando se exporte a TypeScript
   */
  previewTypeScriptIdentifier(text: string): ExportPreview {
    if (!text || text.trim().length === 0) {
      return {
        originalText: text,
        typescriptIdentifier: 'TRANSLATION',
        isValid: false,
        warning: 'El texto está vacío'
      };
    }

    const identifier = this.validationService.generateValidTypeScriptIdentifier(text);
    const isValid = /^[A-Z][A-Z0-9_]*$/.test(identifier);
    
    let warning: string | undefined;
    
    // Verificar si se perdieron caracteres importantes
    const originalLower = text.toLowerCase();
    const identifierLower = identifier.toLowerCase();
    
    // Detectar si se perdieron acentos o caracteres especiales
    const hasAccents = /[áéíóúñàèìòùäëïöüâêîôûãõ]/i.test(text);
    const hasSpecialChars = /[^a-zA-Z0-9\s]/i.test(text);
    
    if (hasAccents && !identifier.includes('A') && !identifier.includes('E') && !identifier.includes('I') && !identifier.includes('O') && !identifier.includes('U') && !identifier.includes('N')) {
      warning = 'Se detectaron acentos que podrían no preservarse completamente';
    }
    
    if (hasSpecialChars) {
      warning = 'Se detectaron caracteres especiales que serán reemplazados';
    }

    return {
      originalText: text,
      typescriptIdentifier: identifier,
      isValid,
      warning
    };
  }

  /**
   * Previsualiza múltiples textos para exportación
   */
  previewMultipleIdentifiers(texts: string[]): ExportPreview[] {
    return texts.map(text => this.previewTypeScriptIdentifier(text));
  }

  /**
   * Valida si un identificador de TypeScript es válido
   */
  validateTypeScriptIdentifier(identifier: string): boolean {
    return /^[A-Z][A-Z0-9_]*$/.test(identifier);
  }

  /**
   * Genera un nombre de archivo seguro para la exportación
   */
  generateSafeFilename(moduleName: string): string {
    if (!moduleName) return 'Translation.ts';
    
    return moduleName
      .replace(/[^a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]/g, '')
      .replace(/\s+/g, '')
      .trim() + 'Translation.ts';
  }

  /**
   * Obtiene estadísticas de la exportación
   */
  getExportStats(texts: string[]): {
    total: number;
    valid: number;
    withWarnings: number;
    invalid: number;
  } {
    const previews = this.previewMultipleIdentifiers(texts);
    
    return {
      total: previews.length,
      valid: previews.filter(p => p.isValid).length,
      withWarnings: previews.filter(p => p.warning).length,
      invalid: previews.filter(p => !p.isValid).length
    };
  }
}
