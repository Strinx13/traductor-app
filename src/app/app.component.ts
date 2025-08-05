import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './microfrontends/sidebar/sidebar.component';
import { ModulosTableComponent } from './microfrontends/modulos/modulos-table/modulos-table.component';
import { EtiquetasTableComponent } from './microfrontends/etiquetas/etiquetas-table/etiquetas-table.component';
import { IdiomasTableComponent } from './microfrontends/idiomas/idiomas-table/idiomas-table.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ModulosTableComponent, EtiquetasTableComponent, IdiomasTableComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  tablaSeleccionada = 'modulos';

  cambiarTabla(tabla: string) {
    console.log('Cambiando a tabla:', tabla);
    this.tablaSeleccionada = tabla;
  }
}
