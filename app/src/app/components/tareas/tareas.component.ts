import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TareasService } from '../../core/services/tareas.service';
import { Tarea, UsuarioRef, UsuarioTareas } from '../../core/models/tareas.model';
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
  usuariosTareas: UsuarioTareas[] = [];
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
      next: data => {
        this.tareas = data.filter(tarea => {
          const tareaCompletada = String(tarea?.tareaCompletada || '');
          return tareaCompletada.startsWith('Video visualizado:') ||
            tareaCompletada.startsWith('Articulo leído:');
        });
        this.agruparTareasPorUsuario();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private agruparTareasPorUsuario(): void {
    const grupos = new Map<string, Tarea[]>();
    const tareasSinTests = this.tareas.filter(tarea => {
      const tareaCompletada = String(tarea?.tareaCompletada || '');
      return tareaCompletada.startsWith('Video visualizado:') ||
        tareaCompletada.startsWith('Articulo leído:');
    });

    tareasSinTests.forEach(tarea => {
      const usuarioId = typeof tarea.usuarioId === 'object' ? tarea.usuarioId._id : tarea.usuarioId;
      if (usuarioId) {
        if (!grupos.has(usuarioId)) {
          grupos.set(usuarioId, []);
        }
        grupos.get(usuarioId)!.push(tarea);
      }
    });

    this.usuariosTareas = Array.from(grupos.entries()).map(([usuarioId, tareas]) => ({
      usuarioId,
      nombreUsuario: this.displayUsuario(tareas[0].usuarioId),
      totalTareas: tareas.length,
      tareas: tareas.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
      expanded: false
    }));

    this.usuariosTareas.sort((a, b) => b.totalTareas - a.totalTareas);
  }

  toggleExpansion(usuario: UsuarioTareas): void {
    usuario.expanded = !usuario.expanded;
  }

  displayUsuario(usuarioId: string | UsuarioRef): string {
    if (!usuarioId) return '';
    if (typeof usuarioId === 'object' && usuarioId !== null) {
      return usuarioId.nombre || String(usuarioId._id || '');
    }
    return String(usuarioId);
  }

  static esTest(tareaCompletada: string): boolean {
    const tarea = String(tareaCompletada || '').toLowerCase();

    if (tarea.includes('test completado:') ||
      tarea.includes('test intentado:') ||
      tarea.includes('test de ') ||
      tarea.includes('test:') ||
      tarea.includes('teste ')) {
      return true;
    }

    if (tarea.includes('test')) {
      return true;
    }
    return false;
  }

  static getTotalTareas(tareas: any[] | null | undefined): number {
    if (!Array.isArray(tareas) || tareas.length === 0) return 0;
    const tareasSinTests = tareas.filter(tarea => {
      const tareaCompletada = String(tarea?.tareaCompletada || '');
      return tareaCompletada.startsWith('Video visualizado:') ||
        tareaCompletada.startsWith('Articulo leído:');
    });
    return tareasSinTests.length;
  }

  static getUsuariosConTareas(tareas: any[] | null | undefined): number {
    if (!Array.isArray(tareas) || tareas.length === 0) return 0;
    const usuariosUnicos = new Set();
    const tareasSinTests = tareas.filter(tarea => {
      return !TareasComponent.esTest(tarea?.tareaCompletada || '');
    });
    tareasSinTests.forEach(tarea => {
      if (tarea.usuarioId) {
        const userId = typeof tarea.usuarioId === 'object' ? tarea.usuarioId._id : tarea.usuarioId;
        if (userId) usuariosUnicos.add(String(userId));
      }
    });
    return usuariosUnicos.size;
  }
}
