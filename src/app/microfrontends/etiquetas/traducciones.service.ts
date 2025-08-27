import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';

export interface Traduccion {
  id_traduccion: number;
  id_etiqueta: number;
  id_idioma: number;
  texto_traduccion: string;
  orden: number;
  descripcion_etiqueta?: string;
  nombre_idioma?: string;
  codigo_iso?: string;
}

export interface TraduccionCreateRequest {
  id_etiqueta: number;
  id_idioma: number;
  texto_traduccion: string;
}

export interface TraduccionUpdateRequest {
  texto_traduccion: string;
}

export interface TraduccionOrdenRequest {
  id_traduccion: number;
  orden: number;
}

@Injectable({
  providedIn: 'root'
})
export class TraduccionesService {
  private apiUrl = 'http://localhost:3001/api/traducciones';
  private traduccionesSubject = new BehaviorSubject<Traduccion[]>([]);
  public traducciones$ = this.traduccionesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getTraducciones(): Observable<Traduccion[]> {
    return this.http.get<Traduccion[]>(this.apiUrl).pipe(
      tap(traducciones => this.traduccionesSubject.next(traducciones))
    );
  }

  getTraduccionesPorEtiqueta(idEtiqueta: number): Observable<Traduccion[]> {
    return this.http.get<Traduccion[]>(`${this.apiUrl}/etiqueta/${idEtiqueta}`).pipe(
      tap(traducciones => {
        // Actualizar el subject con las traducciones de esta etiqueta
        const currentTraducciones = this.traduccionesSubject.value;
        const filteredTraducciones = currentTraducciones.filter(t => t.id_etiqueta !== idEtiqueta);
        this.traduccionesSubject.next([...filteredTraducciones, ...traducciones]);
      })
    );
  }

  getTraduccionesPorIdioma(idIdioma: number): Observable<Traduccion[]> {
    return this.http.get<Traduccion[]>(`${this.apiUrl}/idioma/${idIdioma}`);
  }

  crearTraduccion(traduccion: TraduccionCreateRequest): Observable<Traduccion> {
    return this.http.post<Traduccion>(this.apiUrl, traduccion).pipe(
      tap(() => this.refrescarTraducciones())
    );
  }

  actualizarTraduccion(id: number, traduccion: TraduccionUpdateRequest): Observable<Traduccion> {
    return this.http.put<Traduccion>(`${this.apiUrl}/${id}`, traduccion).pipe(
      tap(() => this.refrescarTraducciones())
    );
  }

  actualizarOrdenTraducciones(traducciones: TraduccionOrdenRequest[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/orden/actualizar`, { traducciones }).pipe(
      tap(() => this.refrescarTraducciones())
    );
  }

  eliminarTraduccion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refrescarTraducciones())
    );
  }

  private refrescarTraducciones(): void {
    this.getTraducciones().subscribe();
  }
}
