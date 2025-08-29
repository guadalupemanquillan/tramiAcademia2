// Ese servicio se va  encargar de filtrar las tareas 
// activas o inactivas del usuario actual según su categoría.

import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { TodoItem } from '../models/todo.model';
import { TodoService } from './todo.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserTodoService {
  constructor(private todos: TodoService, private auth: AuthService) { }

  getActiveTodosForCurrentUser(): Observable<TodoItem[]> {
    const categoriaId = this.auth.categoriaId;
    return this.todos.getAll().pipe(
      map(list => (list || []).filter(t => (t.activo !== false) && (!categoriaId || String(t.categoriaId || '') === String(categoriaId))))
    );
  }
}


