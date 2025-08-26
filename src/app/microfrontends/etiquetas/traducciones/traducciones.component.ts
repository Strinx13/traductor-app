import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { TraduccionesService, Traduccion, TraduccionOrdenRequest } from '../traducciones.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-traducciones',
  standalone: true,
  imports: [CommonModule, FormsModule, CdkDropList, CdkDrag],
  templateUrl: './traducciones.component.html',
  styleUrls: ['./traducciones.component.css']
})
export class TraduccionesComponent implements OnInit, OnDestroy {
  @Input() etiqueta: any = null;
  @Input() idiomas: any[] = [];
  @Output() cerrar = new EventEmitter<void>();

  traducciones: Traduccion[] = [];
  nuevaTraduccion: any = {
    id_etiqueta: 0,
    id_idioma: 0,
    texto_traduccion: ''
  };
  modoEdicion = false;
  traduccionEditando: Traduccion | null = null;
  private subscription = new Subscription();

  constructor(
    private traduccionesService: TraduccionesService,
    private alertService: AlertService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    if (this.etiqueta) {
      this.cargarTraducciones();
      this.nuevaTraduccion.id_etiqueta = this.etiqueta.id_etiqueta;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  cargarTraducciones() {
    this.subscription.add(
      this.traduccionesService.getTraduccionesPorEtiqueta(this.etiqueta.id_etiqueta).subscribe({
        next: (data) => {
          this.traducciones = data;
        },
        error: (error) => {
          console.error('Error al cargar traducciones:', error);
          this.alertService.showError('Error', 'No se pudieron cargar las traducciones');
        }
      })
    );
  }

  agregarTraduccion() {
    if (!this.nuevaTraduccion.id_idioma || !this.nuevaTraduccion.texto_traduccion.trim()) {
      this.alertService.showWarning('Validación', 'Por favor selecciona un idioma e ingresa el texto de traducción');
      return;
    }

    this.subscription.add(
      this.traduccionesService.crearTraduccion(this.nuevaTraduccion).subscribe({
        next: () => {
          this.cargarTraducciones();
          this.nuevaTraduccion = {
            id_etiqueta: this.etiqueta.id_etiqueta,
            id_idioma: 0,
            texto_traduccion: ''
          };
          this.alertService.showSuccess('Éxito', 'Traducción agregada correctamente');
          this.toastService.showSuccess('Traducción creada satisfactoriamente');
        },
        error: (error) => {
          console.error('Error al crear traducción:', error);
          this.alertService.showError('Error', 'No se pudo agregar la traducción');
          this.toastService.showError('Error al crear la traducción');
        }
      })
    );
  }

  editarTraduccion(traduccion: Traduccion) {
    this.modoEdicion = true;
    this.traduccionEditando = { ...traduccion };
  }

  guardarTraduccion() {
    if (!this.traduccionEditando) return;
    
    if (!this.traduccionEditando.texto_traduccion.trim()) {
      this.alertService.showWarning('Validación', 'Por favor ingresa el texto de traducción');
      return;
    }
    
    // Validación adicional del texto
    const texto = this.traduccionEditando.texto_traduccion.trim();
    if (texto.length === 0) {
      this.alertService.showWarning('Validación', 'El texto de traducción no puede estar vacío');
      return;
    }
    
    // Verificar si el texto contiene solo espacios en blanco
    if (texto.replace(/\s/g, '').length === 0) {
      this.alertService.showWarning('Validación', 'El texto de traducción no puede contener solo espacios en blanco');
      return;
    }
    
    this.subscription.add(
      this.traduccionesService.actualizarTraduccion(this.traduccionEditando.id_traduccion, {
        texto_traduccion: texto
      }).subscribe({
        next: () => {
          this.cargarTraducciones();
          this.cancelarEdicion();
          this.alertService.showSuccess('Éxito', 'Traducción actualizada correctamente');
          this.toastService.showSuccess('Traducción actualizada satisfactoriamente');
        },
        error: (error) => {
          console.error('Error al actualizar traducción:', error);
          
          // Mostrar detalles específicos del error
          let errorMessage = 'No se pudo actualizar la traducción';
          
          if (error.status === 400) {
            if (error.error && error.error.errors) {
              errorMessage = `Error de validación: ${error.error.errors.join(', ')}`;
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = 'Datos inválidos enviados al servidor';
            }
          } else if (error.status === 404) {
            errorMessage = 'La traducción no fue encontrada';
          } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor';
          }
          
          this.alertService.showError('Error', errorMessage);
          this.toastService.showError('Error al actualizar la traducción');
        }
      })
    );
  }

  eliminarTraduccion(traduccion: Traduccion) {
    const idiomaNombre = this.getNombreIdioma(traduccion.id_idioma);
    this.alertService.showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar la traducción en ${idiomaNombre}?`
    ).subscribe(confirmed => {
      if (confirmed) {
        this.subscription.add(
          this.traduccionesService.eliminarTraduccion(traduccion.id_traduccion).subscribe({
            next: () => {
              this.cargarTraducciones();
              this.alertService.showSuccess('Éxito', 'Traducción eliminada correctamente');
              this.toastService.showSuccess('Traducción eliminada satisfactoriamente');
            },
            error: (error) => {
              console.error('Error al eliminar traducción:', error);
              this.alertService.showError('Error', 'No se pudo eliminar la traducción');
              this.toastService.showError('Error al eliminar la traducción');
            }
          })
        );
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.traduccionEditando = null;
  }

  // Función para manejar el drag & drop
  onDrop(event: CdkDragDrop<Traduccion[]>) {
    if (event.previousIndex !== event.currentIndex) {
      // Mover el elemento en el array local
      moveItemInArray(this.traducciones, event.previousIndex, event.currentIndex);
      
      // Actualizar el orden en la base de datos
      this.actualizarOrdenTraducciones();
    }
  }

  // Función para actualizar el orden en la base de datos
  private actualizarOrdenTraducciones() {
    const traduccionesOrdenadas: TraduccionOrdenRequest[] = this.traducciones.map((traduccion, index) => ({
      id_traduccion: traduccion.id_traduccion,
      orden: index + 1
    }));

    this.subscription.add(
      this.traduccionesService.actualizarOrdenTraducciones(traduccionesOrdenadas).subscribe({
        next: () => {
          this.alertService.showSuccess('Éxito', 'Orden de traducciones actualizado');
        },
        error: (error) => {
          console.error('Error al actualizar orden:', error);
          this.alertService.showError('Error', 'No se pudo actualizar el orden de las traducciones');
          // Recargar las traducciones para restaurar el orden original
          this.cargarTraducciones();
        }
      })
    );
  }

  getIdiomasDisponibles() {
    // Filtrar solo los idiomas que están en la lista de idiomas seleccionados del módulo
    // y que no tienen traducción ya creada
    const idiomasTraducidos = this.traducciones.map(t => t.id_idioma);
    return this.idiomas.filter(idioma => !idiomasTraducidos.includes(idioma.id_idioma));
  }

  getNombreIdioma(idIdioma: number): string {
    const idioma = this.idiomas.find(i => i.id_idioma === idIdioma);
    return idioma ? idioma.nombre_idioma : 'Idioma no encontrado';
  }

  getPorcentajeTraduccion(): number {
    if (this.idiomas.length === 0) return 0;
    // Filtrar traducciones que están en los idiomas seleccionados del módulo
    const traduccionesEnIdiomasSeleccionados = this.traducciones.filter(t => 
      this.idiomas.some(idioma => idioma.id_idioma === t.id_idioma)
    );
    return Math.round((traduccionesEnIdiomasSeleccionados.length / this.idiomas.length) * 100);
  }

  onCerrar() {
    this.cerrar.emit();
  }
} 