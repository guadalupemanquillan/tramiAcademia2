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

  // Crear/editar/eliminar deshabilitado por requerimiento
  // Se deja solo lectura
  displayUsuario(usuarioId: string | UsuarioRef): string {
    if (!usuarioId) return '';
    if (typeof usuarioId === 'object' && usuarioId !== null) {
      return usuarioId.nombre || String(usuarioId._id || '');
    }
    return String(usuarioId);
  }
}
