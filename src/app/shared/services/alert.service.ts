import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertModalData } from '../alert-modal/alert-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<{
    data: AlertModalData;
    isVisible: boolean;
  }>({
    data: {
      title: '',
      message: '',
      type: 'info',
      showCancelButton: false,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar'
    },
    isVisible: false
  });

  private confirmResponseSubject = new BehaviorSubject<boolean | null>(null);

  public alert$ = this.alertSubject.asObservable();

  showAlert(data: AlertModalData): Observable<boolean> {
    return new Observable(observer => {
      this.alertSubject.next({
        data: {
          ...data,
          confirmText: data.confirmText || 'Aceptar',
          cancelText: data.cancelText || 'Cancelar'
        },
        isVisible: true
      });

      // Crear un listener temporal para capturar la respuesta
      const subscription = this.confirmResponseSubject.subscribe(response => {
        if (response !== null) {
          subscription.unsubscribe();
          observer.next(response);
          observer.complete();
          // Resetear la respuesta
          this.confirmResponseSubject.next(null);
        }
      });
    });
  }

  showSuccess(title: string, message: string): Observable<boolean> {
    return this.showAlert({
      title,
      message,
      type: 'success',
      showCancelButton: false
    });
  }

  showError(title: string, message: string): Observable<boolean> {
    return this.showAlert({
      title,
      message,
      type: 'error',
      showCancelButton: false
    });
  }

  showWarning(title: string, message: string): Observable<boolean> {
    return this.showAlert({
      title,
      message,
      type: 'warning',
      showCancelButton: false
    });
  }

  showInfo(title: string, message: string): Observable<boolean> {
    return this.showAlert({
      title,
      message,
      type: 'info',
      showCancelButton: false
    });
  }

  showConfirm(title: string, message: string): Observable<boolean> {
    return new Observable(observer => {
      this.alertSubject.next({
        data: {
          title,
          message,
          type: 'warning',
          showCancelButton: true,
          confirmText: 'Confirmar',
          cancelText: 'Cancelar'
        },
        isVisible: true
      });

      // Crear un listener temporal para capturar la respuesta
      const subscription = this.confirmResponseSubject.subscribe(response => {
        if (response !== null) {
          subscription.unsubscribe();
          observer.next(response);
          observer.complete();
          // Resetear la respuesta
          this.confirmResponseSubject.next(null);
        }
      });
    });
  }

  hideAlert() {
    this.alertSubject.next({
      data: this.alertSubject.value.data,
      isVisible: false
    });
  }

  onConfirm() {
    this.confirmResponseSubject.next(true);
    this.hideAlert();
  }

  onCancel() {
    this.confirmResponseSubject.next(false);
    this.hideAlert();
  }
}
