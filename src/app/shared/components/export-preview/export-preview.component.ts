import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService, ExportPreview } from '../../services/export.service';

@Component({
  selector: 'app-export-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="export-preview-container">
      <h4 class="text-lg font-semibold mb-3 text-gray-800">
        Previsualización de Exportación
      </h4>
      
      <div class="preview-stats mb-4 p-3 bg-blue-50 rounded-lg">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600">{{ stats.total }}</div>
            <div class="text-sm text-gray-600">Total</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600">{{ stats.valid }}</div>
            <div class="text-sm text-gray-600">Válidos</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-yellow-600">{{ stats.withWarnings }}</div>
            <div class="text-sm text-gray-600">Con Advertencias</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-red-600">{{ stats.invalid }}</div>
            <div class="text-sm text-gray-600">Inválidos</div>
          </div>
        </div>
      </div>

      <div class="preview-list space-y-3">
        <div 
          *ngFor="let preview of previews; trackBy: trackByIndex" 
          class="preview-item p-3 border rounded-lg"
          [ngClass]="{
            'border-green-200 bg-green-50': preview.isValid && !preview.warning,
            'border-yellow-200 bg-yellow-50': preview.warning,
            'border-red-200 bg-red-50': !preview.isValid
          }"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-700 mb-1">
                Texto Original:
              </div>
              <div class="text-gray-900 mb-2">{{ preview.originalText }}</div>
              
              <div class="text-sm font-medium text-gray-700 mb-1">
                Identificador TypeScript:
              </div>
              <div class="font-mono text-sm bg-white px-2 py-1 rounded border">
                {{ preview.typescriptIdentifier }}
              </div>
            </div>
            
            <div class="ml-3 flex flex-col items-end">
              <span 
                *ngIf="preview.isValid && !preview.warning"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                ✓ Válido
              </span>
              <span 
                *ngIf="preview.warning"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
              >
                ⚠ Advertencia
              </span>
              <span 
                *ngIf="!preview.isValid"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
              >
                ✗ Inválido
              </span>
            </div>
          </div>
          
          <div *ngIf="preview.warning" class="mt-2 p-2 bg-yellow-100 rounded text-sm text-yellow-800">
            {{ preview.warning }}
          </div>
        </div>
      </div>

      <div *ngIf="previews.length === 0" class="text-center py-8 text-gray-500">
        No hay textos para previsualizar
      </div>
    </div>
  `,
  styles: [`
    .export-preview-container {
      max-width: 100%;
    }
    
    .preview-item {
      transition: all 0.2s ease-in-out;
    }
    
    .preview-item:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
  `]
})
export class ExportPreviewComponent implements OnInit {
  @Input() texts: string[] = [];
  
  previews: ExportPreview[] = [];
  stats = {
    total: 0,
    valid: 0,
    withWarnings: 0,
    invalid: 0
  };

  constructor(private exportService: ExportService) {}

  ngOnInit() {
    this.updatePreviews();
  }

  ngOnChanges() {
    this.updatePreviews();
  }

  updatePreviews() {
    this.previews = this.exportService.previewMultipleIdentifiers(this.texts);
    this.stats = this.exportService.getExportStats(this.texts);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
