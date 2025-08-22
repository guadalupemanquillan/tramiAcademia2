import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria, CategoriaPaginatedResponse } from '../models/categoria.model';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private apiUrl = 'http://localhost:8080/api/categoria';

  constructor(private http: HttpClient) { }

  getAll(page = 1, limit = 10, nombre?: string): Observable<CategoriaPaginatedResponse> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    return this.http.get<CategoriaPaginatedResponse>(`${this.apiUrl}/`, { params });
  }

  create(categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/`, categoria);
  }

  getOne(id: string): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  update(id: string, categoria: Partial<Categoria>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

