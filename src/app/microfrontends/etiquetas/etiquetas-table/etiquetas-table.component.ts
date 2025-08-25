import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtiquetaFormComponent } from '../etiqueta-form/etiqueta-form.component';
import { TraduccionesComponent } from '../traducciones/traducciones.component';
import { EtiquetasService, Etiqueta } from '../etiquetas.service';
import { ModulosService } from '../../modulos/modulos.service';
import { IdiomasService } from '../../idiomas/idiomas.service';
import { AlertService } from '../../../shared/services/alert.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-etiquetas-table',
  standalone: true,
  imports: [CommonModule, FormsModule, EtiquetaFormComponent, TraduccionesComponent],
  templateUrl: './etiquetas-table.component.html',
  styleUrls: ['./etiquetas-table.component.css']
})
export class EtiquetasTableComponent implements OnInit, OnDestroy {
  etiquetas: Etiqueta[] = [];
  etiquetaSeleccionada: Etiqueta | null = null;
  modoEdicion = false;
  modulos: any[] = [];
  moduloSeleccionado: number | null = null;
  idiomas: any[] = [];
  etiquetaTraducciones: Etiqueta | null = null;
  idiomasSeleccionadosModulo: any[] = [];
  private subscription = new Subscription();

  constructor(
    private etiquetasService: EtiquetasService,
    private modulosService: ModulosService,
    private idiomasService: IdiomasService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.cargarEtiquetas();
    this.cargarModulos();
    this.cargarIdiomas();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get etiquetasFiltradas() {
    if (!this.moduloSeleccionado) return [];
    return this.etiquetas.filter(e => e.id_modulo === this.moduloSeleccionado);
  }

  cargarEtiquetas() {
    this.subscription.add(
      this.etiquetasService.etiquetas$.subscribe({
        next: (etiquetas) => {
          this.etiquetas = etiquetas;
        },
        error: (error) => {
          console.error('Error al cargar etiquetas:', error);
          this.alertService.showError('Error', 'No se pudieron cargar las etiquetas');
        }
      })
    );
  }

  cargarModulos() {
    this.subscription.add(
      this.modulosService.modulos$.subscribe({
        next: (modulos) => {
          this.modulos = modulos;
        },
        error: (error) => {
          console.error('Error al cargar módulos:', error);
          this.alertService.showError('Error', 'No se pudieron cargar los módulos');
        }
      })
    );
  }

  cargarIdiomas() {
    this.subscription.add(
      this.idiomasService.getIdiomas().subscribe({
        next: (idiomas) => {
          this.idiomas = idiomas;
        },
        error: (error) => {
          console.error('Error al cargar idiomas:', error);
          this.alertService.showError('Error', 'No se pudieron cargar los idiomas');
        }
      })
    );
  }

  agregarEtiqueta() {
    if (!this.moduloSeleccionado) {
      this.alertService.showWarning('Selección requerida', 'Por favor selecciona un módulo primero');
      return;
    }
    this.modoEdicion = false;
    this.etiquetaSeleccionada = {
      id_etiqueta: 0,
      descripcion_etiqueta: '',
      id_modulo: this.moduloSeleccionado,
      porcentaje_traduccion: 0
    };
  }

  editarEtiqueta(etiqueta: Etiqueta) {
    this.modoEdicion = true;
    this.etiquetaSeleccionada = { ...etiqueta };
  }

  guardarEtiqueta(etiqueta: Etiqueta) {
    if (this.modoEdicion) {
      this.subscription.add(
        this.etiquetasService.actualizarEtiqueta(etiqueta.id_etiqueta, etiqueta).subscribe({
          next: () => {
            this.etiquetaSeleccionada = null;
            this.alertService.showSuccess('Éxito', 'Etiqueta actualizada correctamente');
          },
          error: (error) => {
            console.error('Error al actualizar etiqueta:', error);
            this.alertService.showError('Error', 'No se pudo actualizar la etiqueta');
          }
        })
      );
    } else {
      const nuevaEtiqueta = {
        descripcion_etiqueta: etiqueta.descripcion_etiqueta,
        id_modulo: etiqueta.id_modulo,
        porcentaje_traduccion: etiqueta.porcentaje_traduccion
      };
      this.subscription.add(
        this.etiquetasService.crearEtiqueta(nuevaEtiqueta).subscribe({
          next: () => {
            this.etiquetaSeleccionada = null;
            this.alertService.showSuccess('Éxito', 'Etiqueta creada correctamente');
          },
          error: (error) => {
            console.error('Error al crear etiqueta:', error);
            this.alertService.showError('Error', 'No se pudo crear la etiqueta');
          }
        })
      );
    }
  }

  cerrarFormulario() {
    this.etiquetaSeleccionada = null;
  }

  async abrirTraducciones(etiqueta: Etiqueta) {
    this.etiquetaTraducciones = etiqueta;
    
    // Obtener los idiomas seleccionados para el módulo de esta etiqueta
    try {
      const modulo = this.modulos.find(m => m.id_modulo === etiqueta.id_modulo);
      if (modulo && modulo.idiomas_seleccionados) {
        this.idiomasSeleccionadosModulo = modulo.idiomas_seleccionados;
      } else {
        // Si no están cargados los idiomas del módulo, hacer una consulta adicional
        this.subscription.add(
          this.modulosService.getModulo(etiqueta.id_modulo).subscribe({
            next: (moduloCompleto) => {
              this.idiomasSeleccionadosModulo = moduloCompleto.idiomas_seleccionados || [];
            },
            error: (error) => {
              console.error('Error al obtener idiomas del módulo:', error);
              this.alertService.showError('Error', 'No se pudieron cargar los idiomas del módulo');
            }
          })
        );
      }
    } catch (error) {
      console.error('Error al obtener idiomas del módulo:', error);
      this.alertService.showError('Error', 'No se pudieron cargar los idiomas del módulo');
    }
  }

  cerrarTraducciones() {
    this.etiquetaTraducciones = null;
    this.idiomasSeleccionadosModulo = [];
  }

  eliminarEtiqueta(etiqueta: Etiqueta) {
    this.alertService.showConfirm(
      'Confirmar eliminación',
      `¿Está seguro de que desea eliminar la etiqueta "${etiqueta.descripcion_etiqueta}"?`
    ).subscribe(confirmed => {
      if (confirmed) {
        this.subscription.add(
          this.etiquetasService.eliminarEtiqueta(etiqueta.id_etiqueta).subscribe({
            next: () => {
              this.alertService.showSuccess('Éxito', 'Etiqueta eliminada correctamente');
            },
            error: (error) => {
              console.error('Error al eliminar etiqueta:', error);
              this.alertService.showError('Error', 'No se pudo eliminar la etiqueta');
            }
          })
        );
      }
    });
  }

  getNombreModulo(idModulo: number): string {
    const modulo = this.modulos.find(m => m.id_modulo === idModulo);
    return modulo ? modulo.nombre_modulo : 'Módulo no encontrado';
  }
}
