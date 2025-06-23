import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Modulo {
  id_modulo: number;
  nombre_modulo: string;
  porcentaje_avance: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModulosService {
  private apiUrl = 'http://localhost:3000/api/modulos';

  constructor(private http: HttpClient) { }

  getModulos(): Observable<Modulo[]> {
    return this.http.get<Modulo[]>(this.apiUrl);
  }

  getModulo(id: number): Observable<Modulo> {
    return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
  }

  crearModulo(modulo: Omit<Modulo, 'id_modulo'>): Observable<Modulo> {
    return this.http.post<Modulo>(this.apiUrl, modulo);
  }

  actualizarModulo(id: number, modulo: Partial<Modulo>): Observable<Modulo> {
    return this.http.put<Modulo>(`${this.apiUrl}/${id}`, modulo);
  }

  eliminarModulo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 