import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { AlertService } from '../../core/services/alert.service';
import { User } from '../../core/models/user.model';
import { Empresa } from '../../core/models/empresa.model';
import { Observable, of } from 'rxjs';
import { TareasService } from '../../core/services/tareas.service';
import { TareasComponent } from '../tareas/tareas.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  empresas$: Observable<Empresa[]> = of([]);
  users: User[] = [];
  usuariosFiltro = '';
  mostrarSugerencias = false;
  highlightedIndex = -1;
  private selectedUserId: string | null = null;

  // Filtros
  empresaFiltro = '';
  rolFiltro = '';

  // form model
  newUser: Partial<User> = {
    nombre: '',
    nombreCompleto: '',
    roles: 'usuario',
    password: '',
    empresaId: ''
  };

  isSubmitting = false;
  errorMsg = '';
  showCreateModal = false;
  showEditModal = false;
  editandoUsuario: Partial<User> = {};
  editErrorMsg = '';

  constructor(
    private userService: UserService, 
    private empresaService: EmpresaService,
    private alert: AlertService,
    private tareasService: TareasService
  ) { }
  ngOnInit(): void {
    this.cargarUsuarios();
    this.empresas$ = this.empresaService.getAll();
  }

  cargarUsuarios(): void {
    this.userService.getAll().subscribe({
      next: users => { 
        this.users = users; 
        this.users$ = of(users);
      },
      error: () => { }
    });
  }

  openModal(): void {
    this.errorMsg = '';
    this.showCreateModal = true;
    const modalEl = document.getElementById('modalCrearUsuario');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.showCreateModal = false;
  }

  createUser(): void {
    if (this.isSubmitting) return;
    this.errorMsg = '';
    const { nombre, nombreCompleto, password } = this.newUser;
    if (!nombre && !nombreCompleto) {
      this.errorMsg = 'Nombre o nombre completo requerido';
      return;
    }
    if (!password) {
      this.errorMsg = 'La contraseña es requerida';
      return;
    }
    this.isSubmitting = true;
    this.userService.create(this.newUser).subscribe({
                                                       next: () => {
           // reset form and refresh list
           this.newUser = { nombre: '', nombreCompleto: '', roles: 'usuario', password: '', empresaId: '' };
           this.cargarUsuarios();
           this.isSubmitting = false;
           this.showCreateModal = false;
           (document.getElementById('crearUsuarioCerrarBtn') as HTMLButtonElement)?.click();
         },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error al crear el usuario';
        this.isSubmitting = false;
      }
    });
  }

  usuarioVer: User | null = null;
  testsCompletadosCount: string = '0';

  async verUsuario(user: User): Promise<void> {
    this.usuarioVer = user;
    
    // Cargar tests completados del usuario
    this.testsCompletadosCount = await this.getTestsCompletadosCountAsync(user);
    
    const modalEl = document.getElementById('modalVerUsuario');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  editarUsuario(user: User): void {
    this.editandoUsuario = { ...user };
    this.editErrorMsg = '';
    this.showEditModal = true;
    
    const modalEl = document.getElementById('modalEditarUsuario');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  guardarEdicionUsuario(): void {
    if (this.isSubmitting) return;
    this.editErrorMsg = '';
    
    const { nombre, nombreCompleto, password } = this.editandoUsuario;
    if (!nombre && !nombreCompleto) {
      this.editErrorMsg = 'Nombre o nombre completo requerido';
      return;
    }
    
    this.isSubmitting = true;
    const { _id, ...userData } = this.editandoUsuario;
    
    this.userService.update(_id!, userData).subscribe({
                                                       next: () => {
           this.cargarUsuarios();
           this.isSubmitting = false;
           this.showEditModal = false;
           this.editandoUsuario = {};
           (document.getElementById('editarUsuarioCerrarBtn') as HTMLButtonElement)?.click();
           this.alert.success('Usuario actualizado correctamente.');
         },
      error: (err) => {
        this.editErrorMsg = err?.error?.message || 'Error al actualizar el usuario';
        this.isSubmitting = false;
      }
    });
  }

  cancelarEdicion(): void {
    if (this.isSubmitting) return;
    this.showEditModal = false;
    this.editandoUsuario = {};
    this.editErrorMsg = '';
  }

  eliminarUsuario(user: User): void {
    if (!user._id) {
      this.alert.error('No se puede eliminar un usuario sin ID válido.');
      return;
    }

    this.alert.confirm(
      `¿Estás seguro de que quieres eliminar al usuario "${user.nombreCompleto || user.nombre}"?`,
      'Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar',
      'warning'
    ).then(confirmed => {
      if (confirmed) {
                                                                       this.userService.delete(user._id!).subscribe({
             next: () => {
               this.alert.success('Usuario eliminado correctamente.');
               this.cargarUsuarios(); // Recargar lista
             },
          error: (err) => {
            this.alert.error(err?.error?.message || 'Error al eliminar el usuario.');
          }
        });
      }
    });
  }

  getEmpresaNombre(empresaId: string | Empresa | undefined): string {
    if (!empresaId) return '—';
    
    if (typeof empresaId === 'string') {
      return empresaId; // Fallback si no se hizo populate
    }
    
    return empresaId.nombre || 'Sin nombre';
  }

  getCategoriasEmpresa(user: User): string {
    if (!user.categoriasEmpresa || user.categoriasEmpresa.length === 0) {
      return '—';
    }
    
    return user.categoriasEmpresa.map(cat => cat.nombre).join(', ');
  }

  getLogrosCount(user: User): number {
    if (!user.logros || !Array.isArray(user.logros)) return 0;
    return user.logros.filter(logro => typeof logro === 'object' && logro !== null).length;
  }

  getTestsCompletadosCount(user: User): string {
    if (!user._id) return '0';
    
    // Por ahora retornamos un placeholder, pero la lógica completa está en getTestsCompletadosCountAsync
    // Para la tabla, usamos un valor fijo, pero para el modal usamos el valor real
    return '0';
  }

  // Método para obtener tests completados de un usuario específico
  async getTestsCompletadosCountAsync(user: User): Promise<string> {
    if (!user._id) return '0';
    
    try {
      const tareas = await this.tareasService.getAll({ usuarioId: user._id }).toPromise();
      const testsCompletados = (tareas || []).filter((tarea: any) => {
        return TareasComponent.esTest(tarea?.tareaCompletada || '');
      }).length;
      
      return testsCompletados.toString();
    } catch (error) {
      return '0';
    }
  }

  // Métodos para búsqueda y filtros
  get usuariosFiltrados(): User[] {
    let usuarios = this.users;

    // Filtro por empresa
    if (this.empresaFiltro) {
      usuarios = usuarios.filter(u => {
        if (typeof u.empresaId === 'string') {
          return u.empresaId === this.empresaFiltro;
        } else if (u.empresaId && typeof u.empresaId === 'object' && '_id' in u.empresaId) {
          return (u.empresaId as any)._id === this.empresaFiltro;
        }
        return false;
      });
    }

    // Filtro por rol
    if (this.rolFiltro) {
      usuarios = usuarios.filter(u => u.roles === this.rolFiltro);
    }

    // Filtro por búsqueda
    if (this.selectedUserId) {
      return usuarios.filter(u => String((u as any)._id) === this.selectedUserId);
    }

    const q = this.usuariosFiltro.trim().toLowerCase();
    if (q) {
      usuarios = usuarios.filter(u => 
        (u.nombreCompleto || '').toLowerCase().includes(q) || 
        (u.nombre || '').toLowerCase().includes(q)
      );
    }

    return usuarios;
  }

  get sugerencias(): User[] {
    const q = this.usuariosFiltro.trim().toLowerCase();
    if (!q) return [];
    return this.usuariosFiltrados.slice(0, 8);
  }

  onBuscarInput(): void {
    this.selectedUserId = null;
    this.mostrarSugerencias = !!this.usuariosFiltro.trim();
    this.highlightedIndex = -1;
  }

  seleccionarUsuarioSug(user: User): void {
    this.usuariosFiltro = user.nombreCompleto || user.nombre || '';
    this.selectedUserId = String((user as any)._id || '');
    this.mostrarSugerencias = false;
  }

  onBuscarKeyDown(event: KeyboardEvent): void {
    if (!this.mostrarSugerencias && (event.key === 'ArrowDown' || event.key === 'Enter')) {
      this.mostrarSugerencias = this.sugerencias.length > 0;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (this.sugerencias.length === 0) return;
      this.highlightedIndex = (this.highlightedIndex + 1) % this.sugerencias.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (this.sugerencias.length === 0) return;
      this.highlightedIndex = (this.highlightedIndex - 1 + this.sugerencias.length) % this.sugerencias.length;
    } else if (event.key === 'Enter') {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.sugerencias.length) {
        event.preventDefault();
        this.seleccionarUsuarioSug(this.sugerencias[this.highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      this.mostrarSugerencias = false;
      this.highlightedIndex = -1;
    }
  }

  aplicarFiltros(): void {
    // Los filtros se aplican automáticamente a través del getter usuariosFiltrados
  }

  limpiarFiltros(): void {
    this.empresaFiltro = '';
    this.rolFiltro = '';
    this.usuariosFiltro = '';
    this.selectedUserId = null;
    this.mostrarSugerencias = false;
    this.highlightedIndex = -1;
  }
}


