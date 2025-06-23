import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar.component';
import { ModulosTableComponent } from './components/modulos-table/modulos-table.component';
import { EtiquetasTableComponent } from './components/etiquetas-table/etiquetas-table.component';
import { IdiomasTableComponent } from './components/idiomas-table/idiomas-table.component';

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
