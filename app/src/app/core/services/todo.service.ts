import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TodoItem } from '../models/todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private apiUrl = 'http://localhost:8080/api/todo';

  constructor(private http: HttpClient) { }

  getAll(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(`${this.apiUrl}/`).pipe(
      map((items: any[]) =>
        (items || []).map((t: any) => ({
          ...t,
          categoriaId: (t?.categoriaId && typeof t.categoriaId === 'object') ? (t.categoriaId?._id ?? null) : (t?.categoriaId ?? null),
        }))
      )
    );
  }

  getOne(id: string): Observable<TodoItem> {
    return this.http.get<TodoItem>(`${this.apiUrl}/${id}`).pipe(
      map((t: any) => ({
        ...t,
        categoriaId: (t?.categoriaId && typeof t.categoriaId === 'object') ? (t.categoriaId?._id ?? null) : (t?.categoriaId ?? null),
      }))
    );
  }

  create(todo: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.post<TodoItem>(`${this.apiUrl}/`, todo);
  }

  update(id: string, todo: Partial<TodoItem>): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.apiUrl}/${id}`, todo);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}


