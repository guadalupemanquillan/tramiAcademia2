import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-logros',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './logros.component.html'
})
export class LogrosComponent implements OnInit {
  logros: Logros[] = [];
  nuevoLogro: Logros = { nombre: '', iconoUrl: '' } as Logros;
  logroEditar: Partial<Logros> | null = null;
  loading: boolean = true;
  users: User[] = [];
  userSeleccionadoId: string | null = null;

  constructor(
    private logrosService: LogrosService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.cargarLogros();
    // Solo el editor necesita el listado de usuarios para asignar logros
    if (this.authService.role === 'editor') {
      this.cargarUsuarios();
    }
  }

  // --- Helpers usados por Dashboard ---
  static countActiveLogros(items: any[] | null | undefined): number {
    if (!Array.isArray(items)) return 0;
    return items.filter(l => l?.activo === true || l?.isActive === true || l?.estado === 'activo').length;
  }

  static countInactiveLogros(items: any[] | null | undefined): number {
    if (!Array.isArray(items)) return 0;
    return items.filter(l => l?.activo === false || l?.isActive === false || l?.estado === 'inactivo').length;
  }

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

  cargarLogros(): void {
    this.loading = true;
    const role = this.authService.role;
    if (role === 'usuario' && this.authService.id) {
      this.logrosService.getAll().subscribe((logros: Logros[]) => {
        const uid = String(this.authService.id);
        this.logros = (logros || []).filter(l => String((l as any)?.usuarioId || '') === uid || (Array.isArray((this as any)?.authService?.logros) && (this as any).authService.logros.includes(String((l as any)?._id || ''))));
        this.loading = false;
        this.cdr.detectChanges();
      });
    } else {
      this.logrosService.getAll().subscribe((logros: Logros[]) => {
        this.logros = logros;
        this.loading = false;
        this.cdr.detectChanges();
      });
    }
  }

  private cargarUsuarios(): void {
    this.userService.getAll().subscribe({
      next: (users) => { this.users = users || []; this.cdr.detectChanges(); },
      error: () => { this.users = []; }
    });
  }

  crearLogro(): void {
    const userId = this.userSeleccionadoId || this.authService.id;
    if (!userId || !this.nuevoLogro.nombre || !this.nuevoLogro.iconoUrl) {
      this.alert.warning('Selecciona un usuario, nombre e icono.');
      return;
    }
    this.logrosService.create({ userId, nombre: this.nuevoLogro.nombre, iconoUrl: this.nuevoLogro.iconoUrl }).subscribe({
      next: () => {
        this.nuevoLogro = { nombre: '', iconoUrl: '' } as Logros;
        this.userSeleccionadoId = null;
        (document.getElementById('crearLogroCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarLogros();
        this.alert.success('El logro se creó correctamente.');
      },
      error: (err) => {
        const msg = err?.error?.error || 'No se pudo crear el logro.';
        this.alert.error(msg);
      }
    });
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
    this.alert.confirm(`¿Confirmas eliminar el logro "${lg.nombre}"?`).then(confirmed => {
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
}
