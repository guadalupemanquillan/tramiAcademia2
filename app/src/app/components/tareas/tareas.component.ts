import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TareasService } from '../../core/services/tareas.service';
import { Tarea, UsuarioRef } from '../../core/models/tareas.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TareasComponent implements OnInit {
  tareas: Tarea[] = [];
  loading = true;
  // Formulario único para crear/editar
  tareaForm: Partial<Tarea> = { usuarioId: '', completada: false };
  modoForm: 'crear' | 'editar' = 'crear';

  constructor(
    private tareasService: TareasService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.cargarTareas();
  }

  cargarTareas(): void {
    this.loading = true;
    this.tareasService.getAll().subscribe({
      next: data => { this.tareas = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  abrirCrearTarea(): void {
    this.modoForm = 'crear';
    this.tareaForm = { usuarioId: '', completada: false };
  }

  abrirEditarTarea(t: Tarea): void {
    this.modoForm = 'editar';
    this.tareaForm = { ...t };
  }

  guardarTarea(): void {
    if (!this.tareaForm.usuarioId) return;

    if (this.modoForm === 'crear') {
      this.tareasService.create(this.tareaForm).subscribe({
        next: () => { this.cargarTareas(); this.alert.success('Tarea creada.'); },
        error: () => this.alert.error('No se pudo crear la tarea.')
      });
    } else if (this.modoForm === 'editar' && this.tareaForm._id) {
      const { _id, ...rest } = this.tareaForm;
      this.tareasService.update(_id!, rest).subscribe({
        next: () => { this.cargarTareas(); this.alert.success('Tarea actualizada.'); },
        error: () => this.alert.error('No se pudo actualizar la tarea.')
      });
    }
  }

  confirmarEliminar(t: Tarea): void {
    this.alert.confirm('¿Eliminar tarea?').then(ok => {
      if (!ok || !t._id) return;
      this.tareasService.delete(t._id).subscribe({
        next: () => { this.cargarTareas(); this.alert.success('Tarea eliminada.'); },
        error: () => this.alert.error('No se pudo eliminar la tarea.')
      });
    });
  }
  displayUsuario(usuarioId: string | UsuarioRef): string {
    if (!usuarioId) return '';
    if (typeof usuarioId === 'object' && usuarioId !== null) {
      return usuarioId.nombre || String(usuarioId._id || '');
    }
    return String(usuarioId);
  }
}
