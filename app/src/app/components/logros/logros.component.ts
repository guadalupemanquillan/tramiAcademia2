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
