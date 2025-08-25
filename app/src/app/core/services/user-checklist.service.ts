import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { TestService } from './test.service';
import { VideoService } from './video.service';
import { TodoService } from './todo.service';
import { TareasService } from './tareas.service';
import {ChecklistItem} from '../models/todo.model';


@Injectable({ providedIn: 'root' })
export class UserChecklistService {
  constructor(
    private tests: TestService,
    private videos: VideoService,
    private todos: TodoService,
    private tareas: TareasService,
  ) { }

  getChecklist(userId: string | null): Observable<ChecklistItem[]> {
    if (!userId) return of([]);
    return forkJoin([
      this.tests.getAll(),
      this.videos.getAll(),
      this.todos.getAll(),
      this.tareas.getAll({ usuarioId: userId }),
    ]).pipe(
      map(([tests, videos, todos, tareas]) => {
        const completed = new Set<string>((tareas || []).map(t => String((t as any)?.tareaCompletada || '')));
        const items: ChecklistItem[] = [];
        for (const t of tests || []) {
          const code = `test:${(t as any)?._id || ''}`;
          items.push({ code, title: `${(t?.preguntas || []).length} preguntas`, type: 'test', completed: completed.has(code) });
        }
        for (const v of videos || []) {
          const code = `video:${(v as any)?._id || ''}`;
          items.push({ code, title: String((v as any)?.titulo || 'Video'), type: 'video', completed: completed.has(code) });
        }
        for (const td of todos || []) {
          const todoId = String((td as any)?._id || '');
          const list = Array.isArray((td as any)?.tareasBase) ? (td as any).tareasBase : [];
          list.forEach((tb: any, idx: number) => {
            const code = `custom:${todoId}#${idx}`;
            items.push({ code, title: String(tb?.nombreTarea || 'Tarea'), type: 'custom', completed: completed.has(code) });
          });
        }
        return items;
      })
    );
  }

  toggle(userId: string | null, code: string, completed: boolean): Observable<void> {
    if (!userId) return of(void 0);
    return this.tareas.getAll({ usuarioId: userId }).pipe(
      switchMap(list => {
        const existing = (list || []).find(t => String((t as any)?.tareaCompletada || '') === code);
        if (completed) {
          // crear si no existe
          if (!existing) {
            return this.tareas.create({ usuarioId: userId, tareaCompletada: code } as any).pipe(map(() => void 0));
          }
          return of(void 0);
        } else {
          // eliminar si existe
          if (existing && (existing as any)?._id) {
            return this.tareas.delete((existing as any)._id).pipe(map(() => void 0));
          }
          return of(void 0);
        }
      })
    );
  }
}


