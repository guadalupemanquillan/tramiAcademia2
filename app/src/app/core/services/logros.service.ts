import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Logros } from '../models/logros.model';

@Injectable({ providedIn: 'root' })
export class LogrosService {
  private apiUrl = 'http://localhost:8080/api/logros';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Logros[]> {
    return this.http.get<Logros[]>(`${this.apiUrl}/`);
  }

  getOne(id: string): Observable<Logros> {
    return this.http.get<Logros>(`${this.apiUrl}/${id}`);
  }

  create(body: { nombre: string; iconoUrl: string }): Observable<Logros> {
    return this.http.post<Logros>(`${this.apiUrl}/`, body);
  }

  update(id: string, body: Partial<Logros>): Observable<Logros> {
    return this.http.put<Logros>(`${this.apiUrl}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

