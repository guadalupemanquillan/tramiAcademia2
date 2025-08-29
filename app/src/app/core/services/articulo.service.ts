import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Articulo } from '../models/articulo.model';

@Injectable({ providedIn: 'root' })
export class ArticuloService {
  private apiUrl = 'http://localhost:8080/api/articulo';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.apiUrl}/`);
  }

  getOne(id: string): Observable<Articulo> {
    return this.http.get<Articulo>(`${this.apiUrl}/${id}`);
  }

  create(articulo: Articulo): Observable<Articulo> {
    return this.http.post<Articulo>(`${this.apiUrl}/`, articulo);
  }

  update(id: string, articulo: Partial<Articulo>): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.apiUrl}/${id}`, articulo);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
