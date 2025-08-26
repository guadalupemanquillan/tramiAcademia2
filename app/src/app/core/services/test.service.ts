import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, map, tap } from 'rxjs';
import { TestItem } from '../models/test.model';

@Injectable({ providedIn: 'root' })
export class TestService {
  private apiUrl = 'http://localhost:8080/api/test';
  private refreshSubject = new Subject<void>();
  readonly changes$ = this.refreshSubject.asObservable();

  constructor(private http: HttpClient) { }

  getAll(): Observable<TestItem[]> {
    return this.http.get<{ tests: TestItem[] }>(`${this.apiUrl}/`).pipe(map(r => r.tests));
  }

  getOne(id: string): Observable<TestItem> {
    return this.http.get<{ test: TestItem }>(`${this.apiUrl}/${id}`).pipe(map(r => r.test));
  }

  verificarTest(userId: string, testId: string, respuestas: { pregunta: string; respuesta: string }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificarTest/${userId}/${testId}`, { respuestas });
  }

  create(test: TestItem): Observable<TestItem> {
    return this.http.post<TestItem>(`${this.apiUrl}/`, test).pipe(
      tap(() => this.refreshSubject.next())
    );
  }

  update(id: string, test: Partial<TestItem>): Observable<TestItem> {
    return this.http.put<TestItem>(`${this.apiUrl}/${id}`, test).pipe(
      tap(() => this.refreshSubject.next())
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.refreshSubject.next())
    );
  }
}

