import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './microfrontends/sidebar/sidebar.component';
import { ModulosTableComponent } from './microfrontends/modulos/modulos-table/modulos-table.component';
import { EtiquetasTableComponent } from './microfrontends/etiquetas/etiquetas-table/etiquetas-table.component';
import { IdiomasTableComponent } from './microfrontends/idiomas/idiomas-table/idiomas-table.component';
import { AlertModalComponent } from './shared/alert-modal/alert-modal.component';
import { AlertService } from './shared/services/alert.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    SidebarComponent, 
    ModulosTableComponent, 
    EtiquetasTableComponent, 
    IdiomasTableComponent,
    AlertModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  tablaSeleccionada = 'modulos';
  alertData: any = {
    data: {
      title: '',
      message: '',
      type: 'info',
      showCancelButton: false,
      confirmText: 'Aceptar',
      cancelText: 'Cancelar'
    },
    isVisible: false
  };

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertService.alert$.subscribe(alert => {
      this.alertData = alert;
    });
  }

  cambiarTabla(tabla: string) {
    console.log('Cambiando a tabla:', tabla);
    this.tablaSeleccionada = tabla;
  }

  onAlertConfirm() {
    this.alertService.onConfirm();
  }

  onAlertCancel() {
    this.alertService.onCancel();
  }
}
