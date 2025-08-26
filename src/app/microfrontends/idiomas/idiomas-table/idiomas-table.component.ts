import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IdiomaFormComponent } from '../idioma-form/idioma-form.component';
import { NotificationService } from '../../../shared/services/notification.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-idiomas-table',
  standalone: true,
  imports: [CommonModule, FormsModule, IdiomaFormComponent],
  templateUrl: './idiomas-table.component.html',
  styleUrls: ['./idiomas-table.component.css']
})
export class IdiomasTableComponent implements OnInit {
  idiomas: any[] = [];
  idiomaSeleccionado: any | null = null;
  modoEdicion = false;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarIdiomas();
  }

  cargarIdiomas() {
    this.http.get<any[]>('http://localhost:3000/api/idiomas').subscribe({
      next: (data) => {
        this.idiomas = data;
      },
      error: (error) => {
        console.error('Error al cargar idiomas:', error);
        this.notificationService.showError('Error', 'No se pudieron cargar los idiomas');
      }
    });
  }

  agregarIdioma() {
    this.modoEdicion = false;
    this.idiomaSeleccionado = {
      id_idioma: 0,
      nombre_idioma: '',
      codigo_iso: ''
    };
  }

  editarIdioma(idioma: any) {
    this.modoEdicion = true;
    this.idiomaSeleccionado = { ...idioma };
  }

  guardarIdioma(idioma: any) {
    if (this.modoEdicion) {
      this.http.put(`http://localhost:3000/api/idiomas/${idioma.id_idioma}`, idioma).subscribe({
        next: () => {
          this.cargarIdiomas();
          this.idiomaSeleccionado = null;
          this.notificationService.showManualSuccess('Éxito', 'Idioma actualizado correctamente');
          this.toastService.showSuccess('Idioma actualizado satisfactoriamente');
        },
        error: (error) => {
          console.error('Error al actualizar idioma:', error);
          this.notificationService.showManualError('Error', 'No se pudo actualizar el idioma');
          this.toastService.showError('Error al actualizar el idioma');
        }
      });
    } else {
      this.http.post('http://localhost:3000/api/idiomas', idioma).subscribe({
        next: () => {
          this.cargarIdiomas();
          this.idiomaSeleccionado = null;
          this.notificationService.showManualSuccess('Éxito', 'Idioma creado correctamente');
          this.toastService.showSuccess('Idioma creado satisfactoriamente');
        },
        error: (error) => {
          console.error('Error al crear idioma:', error);
          this.notificationService.showManualError('Error', 'No se pudo crear el idioma');
          this.toastService.showError('Error al crear el idioma');
        }
      });
    }
  }

  cerrarFormulario() {
    this.idiomaSeleccionado = null;
  }

  async eliminarIdioma(idioma: any) {
    const confirmed = await this.notificationService.showConfirmDelete('el idioma');
    if (confirmed) {
      this.http.delete(`http://localhost:3000/api/idiomas/${idioma.id_idioma}`).subscribe({
        next: () => {
          this.cargarIdiomas();
          this.notificationService.showManualSuccess('Éxito', 'Idioma eliminado correctamente');
          this.toastService.showSuccess('Idioma eliminado satisfactoriamente');
        },
        error: (error) => {
          console.error('Error al eliminar idioma:', error);
          this.notificationService.showManualError('Error', 'No se pudo eliminar el idioma');
          this.toastService.showError('Error al eliminar el idioma');
        }
      });
    }
  }
}
