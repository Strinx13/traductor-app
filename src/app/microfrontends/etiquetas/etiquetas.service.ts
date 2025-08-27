import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { TraduccionesService } from './traducciones.service';

export interface Etiqueta {
  id_etiqueta: number;
  descripcion_etiqueta: string;
  id_modulo: number;
  porcentaje_traduccion: number;
}

@Injectable({
  providedIn: 'root'
})
export class EtiquetasService {
  private apiUrl = 'http://localhost:3001/api/etiquetas';
  private etiquetasSubject = new BehaviorSubject<Etiqueta[]>([]);
  public etiquetas$ = this.etiquetasSubject.asObservable();

  constructor(
    private http: HttpClient,
    private traduccionesService: TraduccionesService
  ) { 
    this.cargarEtiquetas();
    
    // Suscribirse a cambios en traducciones para actualizar etiquetas automáticamente
    this.traduccionesService.traducciones$.subscribe(() => {
      this.cargarEtiquetas();
    });
  }

  private cargarEtiquetas(): void {
    this.http.get<Etiqueta[]>(this.apiUrl).subscribe({
      next: (etiquetas) => {
        this.etiquetasSubject.next(etiquetas);
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
      }
    });
  }

  getEtiquetas(): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(this.apiUrl);
  }

  getEtiqueta(id: number): Observable<Etiqueta> {
    return this.http.get<Etiqueta>(`${this.apiUrl}/${id}`);
  }

  crearEtiqueta(etiqueta: Omit<Etiqueta, 'id_etiqueta'>): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(this.apiUrl, etiqueta).pipe(
      tap(() => this.cargarEtiquetas())
    );
  }

  actualizarEtiqueta(id: number, etiqueta: Partial<Etiqueta>): Observable<Etiqueta> {
    return this.http.put<Etiqueta>(`${this.apiUrl}/${id}`, etiqueta).pipe(
      tap(() => this.cargarEtiquetas())
    );
  }

  eliminarEtiqueta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.cargarEtiquetas())
    );
  }

  refrescarEtiquetas(): void {
    this.cargarEtiquetas();
  }
} 