import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TodoService } from '../../core/services/todo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { TodoItem } from '../../core/models/todo.model';
import { Categoria } from '../../core/models/categoria.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { UserChecklistService } from '../../core/services/user-checklist.service';
import { ChecklistItem } from '../../core/models/todo.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  categorias: Categoria[] = [];
  nuevoTodo: Partial<TodoItem> = { titulo: '', tareasBase: [], categoriaId: null };
  todoEditar: Partial<TodoItem> | null = null;
  loading = true;
  categoriaSeleccionada: string | null = null;
  checklist: ChecklistItem[] = [];
  loadingChecklist = true;

  constructor(
    private todoService: TodoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public authService: AuthService,
    private userChecklist: UserChecklistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarTodos();
    this.cargarCategorias();
    this.cargarChecklist();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll(1, 100, '').subscribe({
      next: resp => { this.categorias = resp.items || []; this.cdr.detectChanges(); },
      error: () => this.alert.error('No se pudieron cargar las categorías.')
    });
  }

  private cargarTodos(): void {
    this.loading = true;
    this.todoService.getAll().subscribe({
      next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  private cargarChecklist(): void {
    const userId = this.authService.id;
    this.loadingChecklist = true;
    this.userChecklist.getChecklist(userId).subscribe({
      next: list => { this.checklist = list || []; this.loadingChecklist = false; this.cdr.detectChanges(); },
      error: () => { this.checklist = []; this.loadingChecklist = false; }
    });
  }

  get todosFiltrados(): TodoItem[] {
    let filtrados = this.todos;
    if (this.categoriaSeleccionada) {
      filtrados = filtrados.filter(t => t.categoriaId === this.categoriaSeleccionada);
    }
    return filtrados;
  }

  get checklistFiltrada(): ChecklistItem[] {
    let items = this.checklist;
    if (this.categoriaSeleccionada) {
      items = items.filter(i => !i.categoriaId || String(i.categoriaId) === String(this.categoriaSeleccionada));
    }
    return items;
  }

  obtenerNombreCategoria(id?: string | null): string {
    return this.categorias.find(c => c._id === id)?.nombre || 'Sin categoría';
  }

  crearTodo(): void {
    if (!this.nuevoTodo.titulo) return;
    this.todoService.create(this.nuevoTodo).subscribe({
      next: () => {
        this.nuevoTodo = { titulo: '', tareasBase: [], categoriaId: null };
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

  removeTareaBase(index: number): void {
    const base = this.nuevoTodo.tareasBase || [];
    this.nuevoTodo.tareasBase = base.filter((_, i) => i !== index);
  }

  toggleChecklist(item: ChecklistItem, completed: boolean): void {
    const userId = this.authService.id;
    this.userChecklist.toggle(userId, item.code, completed).subscribe({
      next: () => this.cargarChecklist(),
      error: () => this.alert.error('No se pudo actualizar la tarea.')
    });
  }

  onChecklistToggle(item: ChecklistItem, event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const completed = !!(target && target.checked);
    this.toggleChecklist(item, completed);
  }

  trackTodo(index: number, t: TodoItem): string | number { return t?._id || index; }
  trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }

  private extractIdFromCode(code: string): string | null {
    // Formats: video:<id> | articulo:<id> | test:<id> | custom:<todoId>#<idx>
    const parts = String(code || '').split(':');
    if (parts.length < 2) return null;
    const right = parts.slice(1).join(':');
    return right.split('#')[0] || null;
  }

  goToChecklistItem(item: ChecklistItem): void {
    const id = this.extractIdFromCode(item.code);
    switch (item.type) {
      case 'video':
        this.router.navigate(['/usuario/video'], { queryParams: id ? { id } : undefined });
        break;
      case 'articulo':
        this.router.navigate(['/usuario/articulos'], { queryParams: id ? { id } : undefined });
        break;
      case 'test':
        this.router.navigate(['/usuario/test'], { queryParams: id ? { id } : undefined });
        break;
      default:
        this.router.navigate(['/usuario/todo']);
        break;
    }
  }
}
