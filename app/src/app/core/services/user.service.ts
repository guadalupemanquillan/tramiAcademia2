import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserChecklistService } from './user-checklist.service';
import { ChecklistItem } from '../models/todo.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient, private checklist: UserChecklistService) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/`);
  }

  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: Partial<User>): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/`, user);
  }

  update(id: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Helpers para dashboard usuario
  getChecklist(userId: string | null): Observable<ChecklistItem[]> {
    return this.checklist.getChecklist(userId).pipe(catchError(() => of([] as ChecklistItem[])));
  }

  getCompletedCodes(userId: string | null): Observable<Set<string>> {
    return this.checklist.getChecklist(userId).pipe(
      map(items => new Set<string>((items || []).filter(i => i.completed).map(i => String(i.code || '')))),
      catchError(() => of(new Set<string>()))
    );
  }
}


