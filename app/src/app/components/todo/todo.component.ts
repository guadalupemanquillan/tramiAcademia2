import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TodoService } from '../../core/services/todo.service';
import { UserTodoService } from '../../core/services/user-todo.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { VideoService } from '../../core/services/video.service';
import { ArticuloService } from '../../core/services/articulo.service';
import { UserService } from '../../core/services/user.service';
import { TodoItem } from '../../core/models/todo.model';
import { Categoria } from '../../core/models/categoria.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { TareasService } from '../../core/services/tareas.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-todo',
  templateUrl: './todo.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TodoComponent implements OnInit {
  todos: TodoItem[] = [];
  categorias: Categoria[] = [];
  videosDisponibles: any[] = [];
  articulosDisponibles: any[] = [];
  nuevoTodo: Partial<TodoItem> = { titulo: '', tareasBase: [], categoriaId: null, activo: true };
  todoEditar: Partial<TodoItem> | null = null;
  loading = true;
  categoriaSeleccionada: string | null = null;
  tareasCompletadas: Set<string> = new Set();
  
  videoSeleccionado: string | null = null;
  articuloSeleccionado: string | null = null;
  videosSeleccionados: string[] = [];
  articulosSeleccionados: string[] = [];
  
  videosFiltrados: any[] = [];
  articulosFiltrados: any[] = [];

  constructor(
    private todoService: TodoService,
    private categoriaService: CategoriaService,
    private videoService: VideoService,
    private articuloService: ArticuloService,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public authService: AuthService,
    private userTodos: UserTodoService,
    private tareasService: TareasService
  ) { }

  ngOnInit(): void {
    this.cargarDatosUnificados();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll(1, 100, '').subscribe({
      next: resp => { this.categorias = resp.items || []; this.cdr.detectChanges(); },
      error: () => this.alert.error('No se pudieron cargar las categorías.')
    });
  }
  cargarVideosYArticulos(): void {
    if (this.authService.role === 'editor') {
      forkJoin({
        videos: this.videoService.getAll(),
        articulos: this.articuloService.getAll(),
        categorias: this.categoriaService.getAll(1, 100, '')
      }).subscribe({
        next: ({ videos, articulos, categorias }) => {
          this.videosDisponibles = videos || [];
          this.articulosDisponibles = articulos || [];
          this.categorias = categorias.items || [];
          
          this.filtrarContenidoPorCategoria();
          
          this.cdr.detectChanges();
        },
        error: () => {
          this.alert.error('No se pudieron cargar videos y artículos.');
        }
      });
    }
  }
  private cargarDatosUnificados(): void {
    this.loading = true;
    
    if (this.authService.role === 'editor') {
      this.cargarTodos();
      this.cargarCategorias();
      this.cargarVideosYArticulos();
    } else {
      const userId = this.authService.id;
      if (!userId) {
        this.loading = false;
        return;
      }

      this.userService.getOne(userId).subscribe({
        next: (user) => {
          const userEmpresaId = typeof user.empresaId === 'string' ? user.empresaId : (user.empresaId as any)?._id;
          
          forkJoin({
            todos: this.userTodos.getActiveTodosForCurrentUser(),
            tareas: this.tareasService.getAll({ usuarioId: userId }),
            categorias: this.categoriaService.getAll(1, 100, '')
          }).subscribe({
            next: ({ todos, tareas, categorias }) => {
              const categoriasUser = categorias.items?.filter(cat => 
                cat.empresaId === userEmpresaId || !cat.empresaId
              ) || [];
              
              const todosFiltrados = todos.filter(todo => {
                if (!todo.categoriaId) return true;
                return categoriasUser.some(cat => cat._id === todo.categoriaId);
              });
              
              this.todos = todosFiltrados;
              this.categorias = categoriasUser;
              
              this.tareasCompletadas = new Set(
                (tareas || []).map((tarea: any) => String(tarea?.tareaCompletada || ''))
              );
              
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.loading = false;
              this.alert.error('No se pudieron cargar los datos.');
            }
          });
        },
        error: () => {
          this.loading = false;
          this.alert.error('No se pudo obtener la información del usuario.');
        }
      });
    }
  }

  private cargarTodos(): void {
    this.todoService.getAll().subscribe({
      next: data => { this.todos = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }





  // Método mejorado para verificar si una tarea está completada considerando la categoría
  isTareaCompletadaPorCategoria(nombreTarea: string, todo: TodoItem): boolean {
    const tareaCompletada = String(nombreTarea || '').trim();
    
    // Verificación exacta
    if (this.tareasCompletadas.has(tareaCompletada)) {
      return true;
    }
    
    // Para tareas específicas de videos
    if (tareaCompletada.toLowerCase().includes('ver video:')) {
      const videoTitulo = tareaCompletada.replace('Ver video:', '').trim();
      return Array.from(this.tareasCompletadas).some(tarea => 
        tarea.toLowerCase().includes('video visualizado:') && 
        tarea.toLowerCase().includes(videoTitulo.toLowerCase())
      );
    }
    
    // Para tareas específicas de artículos
    if (tareaCompletada.toLowerCase().includes('leer artículo:')) {
      const articuloTitulo = tareaCompletada.replace('Leer artículo:', '').trim();
      return Array.from(this.tareasCompletadas).some(tarea => 
        tarea.toLowerCase().includes('articulo leído:') && 
        tarea.toLowerCase().includes(articuloTitulo.toLowerCase())
      );
    }
    
    // Para tareas genéricas (compatibilidad con tareas existentes)
    if (tareaCompletada.toLowerCase().includes('ver video')) {
      return Array.from(this.tareasCompletadas).some(tarea => 
        tarea.toLowerCase().includes('video visualizado:')
      );
    }
    
    if (tareaCompletada.toLowerCase().includes('leer articulo')) {
      return Array.from(this.tareasCompletadas).some(tarea => 
        tarea.toLowerCase().includes('articulo leído:')
      );
    }
    
    return false;
  }







  // Verificar si un todo está completamente completado
  isTodoCompletado(todo: TodoItem): boolean {
    if (!todo.tareasBase || todo.tareasBase.length === 0) return false;
    return todo.tareasBase.every(tarea => this.isTareaCompletadaPorCategoria(tarea.nombreTarea, todo));
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

  obtenerNombreCategoria(id?: string | null | any): string {
    if (id && typeof id === 'object' && id.nombre) {
      return id.nombre;
    }
    if (id && typeof id === 'string') {
      return this.categorias.find(c => c._id === id)?.nombre || 'Sin categoría';
    }
    return 'Sin categoría';
  }

  crearTodo(): void {
    if (!this.nuevoTodo.titulo) {
      this.alert.error('Debes ingresar un título para la tarea.');
      return;
    }
    
    if (!this.nuevoTodo.categoriaId) {
      this.alert.error('Debes seleccionar una categoría.');
      return;
    }
    
    if (!this.hayContenidoDisponible()) {
      this.alert.error('No hay contenido disponible para crear tareas en la categoría seleccionada.');
      return;
    }
    
    const todasLasTareas = [
      ...this.videosSeleccionados.map(video => `Ver video: ${video}`),
      ...this.articulosSeleccionados.map(articulo => `Leer artículo: ${articulo}`)
    ];
    
    const todoParaCrear = {
      ...this.nuevoTodo,
      tareasBase: todasLasTareas.map(nombre => ({ nombreTarea: nombre, completada: false }))
    };
    
    this.todoService.create(todoParaCrear).subscribe({
      next: () => {
        this.resetearFormularioTodo();
        this.alert.successWithAutoClose('Todo creado correctamente.');
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
      next: () => { this.cargarDatosUnificados(); this.alert.success('Todo actualizado.'); },
      error: () => this.alert.error('No se pudo actualizar el todo.')
    });
  }

  confirmarEliminar(t: TodoItem): void {
    this.alert.confirm(
      `¿Eliminar "${t.titulo}"?`,
      'Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar',
      'warning'
    ).then(ok => {
      if (!ok || !t._id) return;
      this.todoService.delete(t._id).subscribe({
        next: () => { this.cargarDatosUnificados(); this.alert.success('Todo eliminado.'); },
        error: () => this.alert.error('No se pudo eliminar el todo.')
      });
    });
  }

  // Métodos para selección de videos y artículos
  agregarVideoSeleccionado(): void {
    if (this.videoSeleccionado && !this.videosSeleccionados.includes(this.videoSeleccionado)) {
      this.videosSeleccionados.push(this.videoSeleccionado);
      this.videoSeleccionado = null;
    }
  }

  removerVideoSeleccionado(index: number): void {
    this.videosSeleccionados.splice(index, 1);
  }

  agregarArticuloSeleccionado(): void {
    if (this.articuloSeleccionado && !this.articulosSeleccionados.includes(this.articuloSeleccionado)) {
      this.articulosSeleccionados.push(this.articuloSeleccionado);
      this.articuloSeleccionado = null;
    }
  }

  removerArticuloSeleccionado(index: number): void {
    this.articulosSeleccionados.splice(index, 1);
  }

  addTareaBaseEdit(input: HTMLInputElement): void {
    if (input.value?.trim()) {
      this.todoEditar?.tareasBase?.push({ nombreTarea: input.value.trim(), completada: false });
      input.value = '';
    }
  }

  removeTareaBaseEdit(index: number): void {
    if (this.todoEditar?.tareasBase) {
      this.todoEditar.tareasBase.splice(index, 1);
    }
  }

  trackTodo(index: number, t: TodoItem): string | number { return t?._id || index; }

  hayContenidoDisponible(): boolean {
    return !!this.nuevoTodo.categoriaId && (this.videosFiltrados.length > 0 || this.articulosFiltrados.length > 0);
  }

  getMensajeContenido(tipo: 'videos' | 'articulos'): string {
    const lista = tipo === 'videos' ? this.videosFiltrados : this.articulosFiltrados;
    return lista.length === 0 ? `No hay ${tipo} disponibles` : `Seleccionar ${tipo.slice(0, -1)}...`;
  }

  private resetearFormularioTodo(): void {
    this.nuevoTodo = { titulo: '', tareasBase: [], categoriaId: null, activo: true };
    this.videosSeleccionados = [];
    this.articulosSeleccionados = [];
    this.videoSeleccionado = null;
    this.articuloSeleccionado = null;
    this.cargarDatosUnificados();
  }

  filtrarContenidoPorCategoria(): void {
    const categoriaId = this.nuevoTodo.categoriaId;
    
    if (!categoriaId) {
      this.videosFiltrados = [];
      this.articulosFiltrados = [];
      return;
    }
    
    this.videosFiltrados = this.videosDisponibles.filter(video => {
      const videoCategoriaId = typeof video.categoriaId === 'object' ? video.categoriaId?._id : video.categoriaId;
      return videoCategoriaId === categoriaId;
    });
    
    this.articulosFiltrados = this.articulosDisponibles.filter(articulo => {
      const articuloCategoriaId = typeof articulo.categoriaId === 'object' ? articulo.categoriaId?._id : articulo.categoriaId;
      return articuloCategoriaId === categoriaId;
    });
    
    this.videoSeleccionado = null;
    this.articuloSeleccionado = null;
  }




}
