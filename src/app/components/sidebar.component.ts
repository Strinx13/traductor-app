import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() selected: string = '';
  @Output() changeTable = new EventEmitter<string>();
  select(tabla: string) {
    console.log('Sidebar select called with:', tabla);
    this.changeTable.emit(tabla);
  }
} 