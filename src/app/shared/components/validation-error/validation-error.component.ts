import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-validation-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="errors && errors.length > 0" class="validation-errors">
      <div *ngFor="let error of errors" class="error-message">
        <span class="error-icon">⚠</span>
        <span class="error-text">{{ error }}</span>
      </div>
    </div>
  `,
  styles: [`
    .validation-errors {
      margin-top: 0.5rem;
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #dc2626;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      padding: 0.5rem;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.375rem;
    }
    
    .error-icon {
      font-size: 1rem;
      font-weight: bold;
    }
    
    .error-text {
      flex: 1;
    }
  `]
})
export class ValidationErrorComponent {
  @Input() errors: string[] = [];
}
