import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tareas.model';

@Injectable({ providedIn: 'root' })
export class TareasService {
  private apiUrl = 'http://localhost:8080/api/tareas';

  constructor(private http: HttpClient) { }

  getAll(params?: { usuarioId?: string }): Observable<Tarea[]> {
    let httpParams = new HttpParams();
    if (params?.usuarioId) httpParams = httpParams.set('usuarioId', params.usuarioId);
    return this.http.get<Tarea[]>(`${this.apiUrl}/`, { params: httpParams });
  }

  getOne(id: string): Observable<Tarea> {
    return this.http.get<Tarea>(`${this.apiUrl}/${id}`);
  }

  create(tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http.post<Tarea>(`${this.apiUrl}/`, tarea);
  }

  update(id: string, tarea: Partial<Tarea>): Observable<Tarea> {
    return this.http.put<Tarea>(`${this.apiUrl}/${id}`, tarea);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}


