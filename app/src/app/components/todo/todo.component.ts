import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TodoService } from '../../core/services/todo.service';
import { TodoItem } from '../../core/models/todo.model';
import { TestService } from '../../core/services/test.service';
import { TestItem } from '../../core/models/test.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  nuevoTodo: Partial<TodoItem> = { titulo: '', tareaBase: [], categoriaId: null };
  todoEditar: Partial<TodoItem> | null = null;
  loading = true;
  tests: TestItem[] = [];

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private testService: TestService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
    this.cargarTests();
  }

  cargarTodos(): void {
    this.loading = true;
    this.todoService.getAll().subscribe({
      next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  cargarTests(): void {
    this.testService.getAll().subscribe({
      next: data => { this.tests = data; this.cdr.detectChanges(); },
      error: () => { this.tests = []; }
    });
  }

  crearTodo(): void {
    if (!this.nuevoTodo.titulo) return;
    this.todoService.create(this.nuevoTodo).subscribe({
      next: () => { this.nuevoTodo = { titulo: '', tareaBase: [], categoriaId: null }; this.cargarTodos(); this.alert.success('Todo creado.'); },
      error: () => this.alert.error('No se pudo crear el todo.')
    });
  }

  abrirEditar(t: TodoItem): void {
    this.todoService.getOne(t._id!).subscribe(res => this.todoEditar = { ...res });
  }

  guardarEdicion(): void {
    if (!this.todoEditar || !this.todoEditar._id) return;
    const { _id, ...rest } = this.todoEditar as TodoItem;
    this.todoService.update(_id!, rest).subscribe({
      next: () => { this.cargarTodos(); this.alert.success('Todo actualizado.'); },
      error: () => this.alert.error('No se pudo actualizar el todo.')
    });
  }

  confirmarEliminar(t: TodoItem): void {
    this.alert.confirm(`¿Eliminar "${t.titulo}"?`).then(ok => {
      if (!ok || !t._id) return;
      this.todoService.delete(t._id).subscribe({
        next: () => { this.cargarTodos(); this.alert.success('Todo eliminado.'); },
        error: () => this.alert.error('No se pudo eliminar el todo.')
      });
    });
  }
}


