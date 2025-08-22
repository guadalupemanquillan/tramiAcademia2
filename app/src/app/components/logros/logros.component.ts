import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

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

  constructor(
    private logrosService: LogrosService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService
  ) { }

  ngOnInit(): void {
    this.cargarLogros();
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
    this.logrosService.getAll().subscribe((logros: Logros[]) => {
      this.logros = logros;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  crearLogro(): void {
    const userId = this.authService.id;
    if (!userId || !this.nuevoLogro.nombre || !this.nuevoLogro.iconoUrl) return;
    this.logrosService.create({ userId, nombre: this.nuevoLogro.nombre, iconoUrl: this.nuevoLogro.iconoUrl }).subscribe({
      next: () => {
        this.nuevoLogro = { nombre: '', iconoUrl: '' } as Logros;
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
}
