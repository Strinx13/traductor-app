import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = 'http://localhost:3000/api/etiquetas';

  constructor(private http: HttpClient) { }

  getEtiquetas(): Observable<Etiqueta[]> {
    return this.http.get<Etiqueta[]>(this.apiUrl);
  }

  getEtiqueta(id: number): Observable<Etiqueta> {
    return this.http.get<Etiqueta>(`${this.apiUrl}/${id}`);
  }

  crearEtiqueta(etiqueta: Omit<Etiqueta, 'id_etiqueta'>): Observable<Etiqueta> {
    return this.http.post<Etiqueta>(this.apiUrl, etiqueta);
  }

  actualizarEtiqueta(id: number, etiqueta: Partial<Etiqueta>): Observable<Etiqueta> {
    return this.http.put<Etiqueta>(`${this.apiUrl}/${id}`, etiqueta);
  }

  eliminarEtiqueta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 