import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-logros',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './logros.component.html'
})
export class LogrosComponent implements OnInit {
  logros: Logros[] = [];
  logroEditar: Partial<Logros> | null = null;
  loading: boolean = true;
  users: User[] = [];
  usuariosLogros: any[] = [];
  


  constructor(
    private logrosService: LogrosService,
    private userService: UserService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarLogros();
    if (this.authService.role === 'editor') {
      this.cargarUsuarios();
    }
  }

  // --- Helpers usados por Dashboard ---
  static getUserLogrosCount(user: any | null | undefined, allLogros: any[] | null | undefined): number {
    if (user && Array.isArray(user.logros)) return user.logros.length;
    if (!user || !Array.isArray(allLogros)) return 0;
    return allLogros.filter((l: any) => String(l?.usuarioId) === String(user._id)).length;
  }

  static getMostRecentLogroDisplay(logros: any[] | null | undefined, users: any[] | null | undefined): string {
    if (!Array.isArray(logros) || logros.length === 0) return '';
    let latest = logros[0] as any;
    let latestTime = new Date(latest?.createdAt || latest?.updatedAt || 0).getTime();
    for (let i = 1; i < logros.length; i++) {
      const t = new Date((logros[i] as any)?.createdAt || (logros[i] as any)?.updatedAt || 0).getTime();
      if (t > latestTime) { latest = logros[i]; latestTime = t; }
    }
    const logroName = latest?.nombre || latest?.titulo || '';
    if (!Array.isArray(users) || users.length === 0) return logroName;
    const latestId = String(latest?._id || '');
    const targetUser = users.find(u => (u?.logros || []).some((id: any) => String(id) === latestId) || String(u?._id) === String((latest as any)?.usuarioId));
    const userName = targetUser?.nombreCompleto || targetUser?.nombre || '';
    return userName ? `${logroName} — ${userName}` : logroName;
  }

  static getTopUserByLogros(users: any[] | null | undefined): { name: string; count: number } | null {
    if (!Array.isArray(users) || users.length === 0) return null;
    let best: { name: string; count: number } | null = null;
    for (const u of users) {
      const count = (u?.logros || []).length;
      const name = u?.nombreCompleto || u?.nombre || 'Usuario';
      if (!best || count > best!.count) best = { name, count };
    }
    return best;
  }

  cargarUsuarios(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: () => {
        this.alert.error('Error al cargar usuarios');
      }
    });
  }

  cargarLogros(): void {
    this.loading = true;
    const role = this.authService.role;
    if (role === 'usuario' && this.authService.id) {
      this.logrosService.getAll().subscribe((logros: Logros[]) => {
        const uid = String(this.authService.id);
        this.logros = (logros || []).filter(l => {
          const logroUserId = typeof l.usuarioId === 'string' 
            ? l.usuarioId 
            : (l.usuarioId as any)?._id;
          
          return String(logroUserId || '') === uid || 
                 (Array.isArray((this as any)?.authService?.logros) && 
                  (this as any).authService.logros.includes(String((l as any)?._id || '')));
        });
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.logrosService.getAll().subscribe((logros: Logros[]) => {
        this.logros = logros;
        this.organizarLogrosPorUsuario();
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  organizarLogrosPorUsuario(): void {
    const logrosPorUsuario = new Map<string, any>();
    
    this.logros.forEach(logro => {
      let usuarioId = '';
      let nombreUsuario = 'Usuario';
      
      if (typeof logro.usuarioId === 'string') {
        usuarioId = logro.usuarioId;
        const user = this.users.find(u => u._id === usuarioId);
        nombreUsuario = user ? (user.nombreCompleto || user.nombre || 'Usuario') : 'Usuario';
      } else if (logro.usuarioId && typeof logro.usuarioId === 'object') {
        usuarioId = (logro.usuarioId as any)._id || '';
        nombreUsuario = (logro.usuarioId as any).nombreCompleto || (logro.usuarioId as any).nombre || 'Usuario';
      }
      
      if (!logrosPorUsuario.has(usuarioId)) {
        logrosPorUsuario.set(usuarioId, {
          usuarioId: usuarioId,
          nombreUsuario: nombreUsuario,
          totalLogros: 0,
          logros: [],
          expanded: false
        });
      }
      
      const usuario = logrosPorUsuario.get(usuarioId);
      usuario.logros.push(logro);
      usuario.totalLogros++;
    });
    
    this.usuariosLogros = Array.from(logrosPorUsuario.values());
  }

  toggleExpansion(usuario: any): void {
    usuario.expanded = !usuario.expanded;
  }

  abrirEditarLogro(lg: Logros): void {
    this.logrosService.getOne(lg._id as string).subscribe(x => {
      this.logroEditar = { ...x };
    });
  }
  
  guardarEdicionLogro(): void {
    if (!this.logroEditar || !this.logroEditar._id) return;
    const { _id, ...rest } = this.logroEditar as Logros;
    this.logrosService.update(_id!, rest).subscribe({
      next: () => {
        (document.getElementById('editarLogroCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarLogros();
        this.alert.success('El logro se actualizó correctamente.');
      },
      error: () => {
        this.alert.error('No se pudo actualizar el logro.');
      }
    });
  }
  
  confirmarEliminarLogro(lg: Logros): void {
    this.alert.confirm(
      `¿Confirmas eliminar el logro "${lg.nombre}"?`,
      'Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar',
      'warning'
    ).then(confirmed => {
      if (!confirmed || !lg._id) return;
      this.logrosService.delete(lg._id).subscribe({
        next: () => {
          this.cargarLogros();
          this.alert.success('El logro se eliminó correctamente.');
        },
        error: () => {
          this.alert.error('No se pudo eliminar el logro.');
        }
      });
    });
  }

  trackLogro(index: number, l: Logros): string | number { return l?._id || index; }

  getUsuarioNombre(logro: Logros): string {
    if (!logro.usuarioId || typeof logro.usuarioId === 'string') {
      return '—';
    }
    return logro.usuarioId.nombreCompleto || logro.usuarioId.nombre || logro.usuarioId.email || 'Usuario';
  }
}
