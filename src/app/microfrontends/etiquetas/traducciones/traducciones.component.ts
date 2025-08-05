import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-traducciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './traducciones.component.html',
  styleUrls: ['./traducciones.component.css']
})
export class TraduccionesComponent {
  @Input() etiqueta: any = null;
  @Input() idiomas: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  traducciones: any[] = [];
  nuevaTraduccion: any = {
    id_etiqueta: 0,
    id_idioma: 0,
    texto_traduccion: ''
  };
  modoEdicion = false;
  traduccionEditando: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.etiqueta) {
      this.cargarTraducciones();
      this.nuevaTraduccion.id_etiqueta = this.etiqueta.id_etiqueta;
    }
  }

  cargarTraducciones() {
    this.http.get<any[]>(`http://localhost:3000/api/traducciones/etiqueta/${this.etiqueta.id_etiqueta}`).subscribe({
      next: (data) => {
        this.traducciones = data;
      },
      error: (error) => {
        console.error('Error al cargar traducciones:', error);
      }
    });
  }

  agregarTraduccion() {
    if (!this.nuevaTraduccion.id_idioma || !this.nuevaTraduccion.texto_traduccion) {
      return;
    }

    this.http.post('http://localhost:3000/api/traducciones', this.nuevaTraduccion).subscribe({
      next: () => {
        this.cargarTraducciones();
        this.nuevaTraduccion = {
          id_etiqueta: this.etiqueta.id_etiqueta,
          id_idioma: 0,
          texto_traduccion: ''
        };
      },
      error: (error) => {
        console.error('Error al crear traducción:', error);
      }
    });
  }

  editarTraduccion(traduccion: any) {
    this.modoEdicion = true;
    this.traduccionEditando = { ...traduccion };
  }

  guardarTraduccion() {
    this.http.put(`http://localhost:3000/api/traducciones/${this.traduccionEditando.id_traduccion}`, {
      texto_traduccion: this.traduccionEditando.texto_traduccion
    }).subscribe({
      next: () => {
        this.cargarTraducciones();
        this.cancelarEdicion();
      },
      error: (error) => {
        console.error('Error al actualizar traducción:', error);
      }
    });
  }

  eliminarTraduccion(traduccion: any) {
    if (confirm('¿Está seguro de que desea eliminar esta traducción?')) {
      this.http.delete(`http://localhost:3000/api/traducciones/${traduccion.id_traduccion}`).subscribe({
        next: () => {
          this.cargarTraducciones();
        },
        error: (error) => {
          console.error('Error al eliminar traducción:', error);
        }
      });
    }
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.traduccionEditando = null;
  }

  getIdiomasDisponibles() {
    const idiomasTraducidos = this.traducciones.map(t => t.id_idioma);
    return this.idiomas.filter(idioma => !idiomasTraducidos.includes(idioma.id_idioma));
  }

  getNombreIdioma(idIdioma: number): string {
    const idioma = this.idiomas.find(i => i.id_idioma === idIdioma);
    return idioma ? idioma.nombre_idioma : 'Idioma no encontrado';
  }

  getPorcentajeTraduccion(): number {
    if (this.idiomas.length === 0) return 0;
    return Math.round((this.traducciones.length / this.idiomas.length) * 100);
  }

  onCerrar() {
    this.cerrar.emit();
  }
} 