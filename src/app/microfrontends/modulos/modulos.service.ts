import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { TraduccionesService } from '../etiquetas/traducciones.service';

export interface Idioma {
  id_idioma: number;
  nombre_idioma: string;
  codigo_iso: string;
}

export interface Modulo {
  id_modulo: number;
  nombre_modulo: string;
  porcentaje_avance: number;
  idiomas_seleccionados?: Idioma[];
}

export interface ModuloCreateRequest {
  nombre_modulo: string;
  idiomas_seleccionados: number[];
}

export interface ModuloUpdateRequest {
  nombre_modulo: string;
  idiomas_seleccionados: number[];
}

@Injectable({
  providedIn: 'root'
})
export class ModulosService {
  private apiUrl = 'http://localhost:3000/api/modulos';
  private modulosSubject = new BehaviorSubject<Modulo[]>([]);
  public modulos$ = this.modulosSubject.asObservable();

  constructor(
    private http: HttpClient,
    private traduccionesService: TraduccionesService
  ) { 
    this.cargarModulos();
    
    // Suscribirse a cambios en traducciones para actualizar módulos automáticamente
    this.traduccionesService.traducciones$.subscribe(() => {
      this.cargarModulos();
    });
  }

  private cargarModulos(): void {
    this.http.get<Modulo[]>(this.apiUrl).subscribe({
      next: (modulos) => {
        this.modulosSubject.next(modulos);
      },
      error: (error) => {
        console.error('Error al cargar módulos:', error);
      }
    });
  }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.apiUrl);
  }

  getModulo(id: number): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
  }

  crearModulo(modulo: ModuloCreateRequest): Observable<Modulo> {
    return this.http.post<Modulo>(this.apiUrl, modulo).pipe(
      tap(() => this.cargarModulos())
    );
  }

  actualizarModulo(id: number, modulo: ModuloUpdateRequest): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.apiUrl}/${id}`, modulo).pipe(
      tap(() => this.cargarModulos())
    );
  }

  eliminarModulo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarModulos())
    );
  }

  refrescarModulos(): void {
    this.cargarModulos();
  }
} 