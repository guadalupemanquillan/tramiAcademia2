import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TodoService } from '../../core/services/todo.service';
import { UserTodoService } from '../../core/services/user-todo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { TodoItem } from '../../core/models/todo.model';
import { Categoria } from '../../core/models/categoria.model';
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
  categorias: Categoria[] = [];
  nuevoTodo: Partial<TodoItem> = { titulo: '', tareasBase: [], categoriaId: null, activo: true };
  todoEditar: Partial<TodoItem> | null = null;
  loading = true;
  categoriaSeleccionada: string | null = null;

  constructor(
    private todoService: TodoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public authService: AuthService,
    private userTodos: UserTodoService
  ) { }

  ngOnInit(): void {
    this.cargarTodos();
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll(1, 100, '').subscribe({
      next: resp => { this.categorias = resp.items || []; this.cdr.detectChanges(); },
      error: () => this.alert.error('No se pudieron cargar las categorías.')
    });
  }

  private cargarTodos(): void {
    this.loading = true;
    if (this.authService.role === 'editor') {
      this.todoService.getAll().subscribe({
        next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; }
      });
    } else {
      this.userTodos.getActiveTodosForCurrentUser().subscribe({
        next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
        error: () => { this.loading = false; }
      });
    }
  }

  get todosFiltrados(): TodoItem[] {
    let filtrados = this.todos;
    if (this.categoriaSeleccionada) {
      filtrados = filtrados.filter(t => t.categoriaId === this.categoriaSeleccionada);
    }
    return filtrados;
  }

  get todosActivos(): TodoItem[] {
    return this.todosFiltrados.filter(t => t.activo !== false);
  }

  obtenerNombreCategoria(id?: string | null): string {
    return this.categorias.find(c => c._id === id)?.nombre || 'Sin categoría';
  }

  crearTodo(): void {
    if (!this.nuevoTodo.titulo) return;
    this.todoService.create(this.nuevoTodo).subscribe({
      next: () => {
        this.nuevoTodo = { titulo: '', tareasBase: [], categoriaId: null, activo: true };
        this.cargarTodos();
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

  addTareaBaseFromInput(input: HTMLInputElement): void {
    const nombre = (input.value || '').trim();
    if (!nombre) return;
    const base = this.nuevoTodo.tareasBase || [];
    this.nuevoTodo.tareasBase = [...base, { nombreTarea: nombre, completada: false }];
    input.value = '';
  }

  addTareaBaseEdit(input: HTMLInputElement): void {
    const nombre = (input.value || '').trim();
    if (!this.todoEditar || !nombre) return;
    const base = this.todoEditar.tareasBase || [];
    this.todoEditar.tareasBase = [...base, { nombreTarea: nombre, completada: false }];
    input.value = '';
  }

  removeTareaBase(index: number): void {
    const base = this.nuevoTodo.tareasBase || [];
    this.nuevoTodo.tareasBase = base.filter((_, i) => i !== index);
  }

  removeTareaBaseEdit(index: number): void {
    if (!this.todoEditar) return;
    const base = this.todoEditar.tareasBase || [];
    this.todoEditar.tareasBase = base.filter((_, i) => i !== index);
  }

  trackTodo(index: number, t: TodoItem): string | number { return t?._id || index; }
  trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }
}
