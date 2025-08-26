import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastData[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  showSuccess(message: string, duration: number = 3000): void {
    this.showToast(message, 'success', duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.showToast(message, 'error', duration);
  }

  showWarning(message: string, duration: number = 4000): void {
    this.showToast(message, 'warning', duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.showToast(message, 'info', duration);
  }

  private showToast(message: string, type: ToastData['type'], duration: number): void {
    const toast: ToastData = {
      id: this.generateId(),
      message,
      type,
      duration,
      timestamp: new Date()
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto-remove toast after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
