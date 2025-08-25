import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TodoService } from '../../core/services/todo.service';
import { TodoItem } from '../../core/models/todo.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { UserChecklistService} from '../../core/services/user-checklist.service';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';
import{ChecklistItem } from '../../core/models/todo.model';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  nuevoTodo: Partial<TodoItem> = { titulo: '', tareasBase: [], categoriaId: null };
  todoEditar: Partial<TodoItem> | null = null;
  loading = true;

  categorias: Categoria[] = [];

  // checklist para el usuario actual
  checklist: ChecklistItem[] = [];

  constructor(
    private todoService: TodoService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public authService: AuthService,
    private checklistService: UserChecklistService,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit(): void {
    this.cargarTodos();
    this.cargarChecklist();
    this.categoriaService.getAll(1, 100, '').subscribe({
      next: resp => { this.categorias = resp.items || []; this.cdr.detectChanges(); },
      error: () => { this.categorias = []; }
    });
  }

  trackCode = (_: number, item: ChecklistItem) => item.code;

  private cargarChecklist(): void {
    const userId = this.authService.id;
    this.checklistService.getChecklist(userId).subscribe(items => {
      this.checklist = items;
      this.cdr.detectChanges();
    });
  }

  cargarTodos(): void {
    this.loading = true;
    this.todoService.getAll().subscribe({
      next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  crearTodo(): void {
    if (!this.nuevoTodo.titulo) return;
    this.todoService.create(this.nuevoTodo).subscribe({
      next: () => {
        this.nuevoTodo = { titulo: '', tareasBase: [], categoriaId: null };
        this.cargarTodos();
        this.cargarChecklist();
        this.alert.success('Todo creado.');
      },
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
      next: () => { this.cargarTodos(); this.cargarChecklist(); this.alert.success('Todo actualizado.'); },
      error: () => this.alert.error('No se pudo actualizar el todo.')
    });
  }

  confirmarEliminar(t: TodoItem): void {
    this.alert.confirm(`¿Eliminar "${t.titulo}"?`).then(ok => {
      if (!ok || !t._id) return;
      this.todoService.delete(t._id).subscribe({
        next: () => { this.cargarTodos(); this.cargarChecklist(); this.alert.success('Todo eliminado.'); },
        error: () => this.alert.error('No se pudo eliminar el todo.')
      });
    });
  }

  addTareaBaseFromInput(input: HTMLInputElement): void {
    const nombre = (input.value || '').trim();
    if (!nombre) return;
    const base = this.nuevoTodo.tareasBase || [];
    this.nuevoTodo.tareasBase = [...base, { nombreTarea: nombre }];
    input.value = '';
  }

  removeTareaBase(index: number): void {
    const base = this.nuevoTodo.tareasBase || [];
    this.nuevoTodo.tareasBase = base.filter((_, i) => i !== index);
  }

  toggleCompletadaTodoLocal(todo: TodoItem) {
    if (!todo._id) return;
    this.todoService.update(todo._id, { completada: (todo as any).completada } as Partial<TodoItem>).subscribe({
      next: () => this.alert.success('Estado actualizado.'),
      error: () => this.alert.error('No se pudo actualizar.')
    });
  }

  toggleChecklist(item: ChecklistItem): void {
    const userId = this.authService.id;
    const next = !item.completed;
    this.checklistService.toggle(userId, item.code, next).subscribe({
      next: () => { item.completed = next; this.cdr.detectChanges(); },
      error: () => this.alert.error('No se pudo actualizar checklist.')
    });
  }
}
