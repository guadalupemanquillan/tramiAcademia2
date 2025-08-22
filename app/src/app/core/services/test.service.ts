import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TestItem } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class TestService {
  private apiUrl = 'http://localhost:8080/api/test';

  constructor(private http: HttpClient) { }

  getAll(): Observable<TestItem[]> {
    return this.http.get<{ tests: TestItem[] }>(`${this.apiUrl}/`).pipe(map(r => r.tests));
  }

  getOne(id: string): Observable<TestItem> {
    return this.http.get<TestItem>(`${this.apiUrl}/${id}`);
  }

  verificarTest(userId: string, testId: string, respuestas: { pregunta: string; respuesta: string }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificarTest/${userId}/${testId}`, { respuestas });
  }

  create(test: TestItem): Observable<TestItem> {
    return this.http.post<TestItem>(`${this.apiUrl}/`, test);
  }

  update(id: string, test: Partial<TestItem>): Observable<TestItem> {
    return this.http.put<TestItem>(`${this.apiUrl}/${id}`, test);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

