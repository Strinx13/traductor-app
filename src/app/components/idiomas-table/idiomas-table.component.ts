import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IdiomasService, Idioma } from '../../services/idiomas.service';

@Component({
  selector: 'app-idiomas-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './idiomas-table.component.html',
  styleUrls: ['./idiomas-table.component.css']
})
export class IdiomasTableComponent implements OnInit {
  idiomas: Idioma[] = [];
  idiomaSeleccionado: Idioma | null = null;
  modoEdicion = false;

  constructor(private idiomasService: IdiomasService) {}

  ngOnInit() {
    this.cargarIdiomas();
  }

  cargarIdiomas() {
    this.idiomasService.getIdiomas().subscribe({
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

  editarIdioma(idioma: Idioma) {
    this.modoEdicion = true;
    this.idiomaSeleccionado = { ...idioma };
  }

  guardarIdioma(idioma: Idioma) {
    if (this.modoEdicion) {
      this.idiomasService.actualizarIdioma(idioma.id_idioma, idioma).subscribe({
        next: () => {
          this.cargarIdiomas();
          this.idiomaSeleccionado = null;
        },
        error: (error) => {
          console.error('Error al actualizar idioma:', error);
        }
      });
    } else {
      this.idiomasService.crearIdioma(idioma).subscribe({
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

  eliminarIdioma(idioma: Idioma) {
    if (confirm('¿Está seguro de que desea eliminar este idioma?')) {
      this.idiomasService.eliminarIdioma(idioma.id_idioma).subscribe({
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
