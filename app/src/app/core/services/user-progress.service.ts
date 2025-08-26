// Este servicio  lo que hace es filtrar cuales tests puede
// ver/hacer el usuario actual según los logros que se le han asigando.


import { Injectable } from '@angular/core';
import { Observable, combineLatest, map, of } from 'rxjs';
import { TestItem } from '../models/test.model';
import { User } from '../models/user.model';
import { TestService } from './test.service';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  constructor(
    private tests: TestService,
    private users: UserService,
    private auth: AuthService
  ) {}

  getEligibleTestsForCurrentUser(): Observable<TestItem[]> {
    const userId = this.auth.id;
    if (!userId) return of([]);

    return combineLatest([
      this.tests.getAll(),
      this.users.getOne(userId)
    ]).pipe(
      map(([allTests, user]) => {
        const nombresLogrosUsuario = new Set<string>(
          ((user?.logros as any[]) || [])
            .map((l: any) => (l?.nombre || '').toLowerCase().trim())
            .filter((n: string) => n.length > 0)
        );
        return (allTests || []).filter(t => {
          const nombresTest = (t?.logros || []).map(l => (l?.nombre || '').toLowerCase().trim()).filter(n => n);
          // Si todos los nombres del test están contenidos en los del usuario → ocultar
          const todosIncluidos = nombresTest.length > 0 && nombresTest.every(n => nombresLogrosUsuario.has(n));
          return !todosIncluidos;
        });
      })
    );
  }

  completeTest(testId: string, respuestas: { pregunta: string; respuesta: string }[]): Observable<any> {
    const userId = this.auth.id;
    if (!userId) return of({ resultado: null });
    return this.tests.verificarTest(userId, testId, respuestas);
  }
}


