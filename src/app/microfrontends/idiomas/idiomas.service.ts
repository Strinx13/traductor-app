import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Idioma {
  id_idioma: number;
  nombre_idioma: string;
  codigo_iso: string;
}

@Injectable({
  providedIn: 'root'
})
export class IdiomasService {
  private apiUrl = 'http://localhost:3000/api/idiomas';

  constructor(private http: HttpClient) { }

  getIdiomas(): Observable<Idioma[]> {
    return this.http.get<Idioma[]>(this.apiUrl);
  }

  getIdioma(id: number): Observable<Idioma> {
    return this.http.get<Idioma>(`${this.apiUrl}/${id}`);
  }

  crearIdioma(idioma: Omit<Idioma, 'id_idioma'>): Observable<Idioma> {
    return this.http.post<Idioma>(this.apiUrl, idioma);
  }

  actualizarIdioma(id: number, idioma: Partial<Idioma>): Observable<Idioma> {
    return this.http.put<Idioma>(`${this.apiUrl}/${id}`, idioma);
  }

  eliminarIdioma(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 