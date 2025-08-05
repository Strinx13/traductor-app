import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { IdiomaFormComponent } from '../idioma-form/idioma-form.component';

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

  constructor(private http: HttpClient) {}

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
        },
        error: (error) => {
          console.error('Error al actualizar idioma:', error);
        }
      });
    } else {
      this.http.post('http://localhost:3000/api/idiomas', idioma).subscribe({
        next: () => {
          this.cargarIdiomas();
          this.idiomaSeleccionado = null;
        },
        error: (error) => {
          console.error('Error al crear idioma:', error);
        }
      });
    }
  }

  cerrarFormulario() {
    this.idiomaSeleccionado = null;
  }

  eliminarIdioma(idioma: any) {
    if (confirm('¿Está seguro de que desea eliminar este idioma?')) {
      this.http.delete(`http://localhost:3000/api/idiomas/${idioma.id_idioma}`).subscribe({
        next: () => {
          this.cargarIdiomas();
        },
        error: (error) => {
          console.error('Error al eliminar idioma:', error);
        }
      });
    }
  }
}
