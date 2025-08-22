import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EmpresaService } from '../../core/services/empresa.service';
import { Empresa } from '../../core/models/empresa.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './empresas.component.html'
})
export class EmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  empresasFiltro = '';
  mostrarSugerencias = false;
  highlightedIndex = -1;
  private selectedEmpresaId: string | null = null;
  viewMode: 'list' | 'detail' = 'list'; // detail view no longer used on 'Ver'
  modalImagenUrl: string | null = null;
  modalEmpresa: Empresa | null = null;
  empresaForm: Empresa = { nombre: '', imagen: '' };
  modoForm: 'crear' | 'editar' = 'crear';
  empresaSeleccionada: Empresa | null = null;
  loading = true;

  constructor(
    private empresaService: EmpresaService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService
  ) { }
  ngOnInit(): void {
    this.cargarEmpresas();
  }
  cargarEmpresas(): void {
    this.loading = true;
    this.empresaService.getAll().subscribe({
      next: empresas => { this.empresas = empresas; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }
  get empresasFiltradas(): Empresa[] {
    if (this.selectedEmpresaId) {
      return this.empresas.filter(e => String((e as any)._id) === this.selectedEmpresaId);
    }
    const q = this.empresasFiltro.trim().toLowerCase();
    return q ? this.empresas.filter(e => e.nombre.toLowerCase().includes(q)) : this.empresas;
  }
  get sugerencias(): Empresa[] {
    const q = this.empresasFiltro.trim().toLowerCase();
    if (!q) return [];
    return this.empresasFiltradas.slice(0, 8);
  }
  onBuscarInput(): void {
    this.selectedEmpresaId = null; // si el usuario vuelve a escribir, se limpia la selección exacta
    this.mostrarSugerencias = !!this.empresasFiltro.trim();
    this.highlightedIndex = -1;
  }
  seleccionarEmpresaSug(empresa: Empresa): void {
    this.empresasFiltro = empresa.nombre;
    this.selectedEmpresaId = String((empresa as any)._id || '');
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
        this.seleccionarEmpresaSug(this.sugerencias[this.highlightedIndex]);
      }
    } else if (event.key === 'Escape') {
      this.mostrarSugerencias = false;
      this.highlightedIndex = -1;
    }
  }

  openImageModal(url: string | undefined | null): void {
    this.modalImagenUrl = url || null;
  }

  onModalBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.modalImagenUrl = null;
      this.modalEmpresa = null;
    }
  }

  openDetalleModal(empresa: Empresa): void {
    const id = (empresa as any)?._id;
    if (id) {
      this.empresaService.getOne(id).subscribe(e => this.modalEmpresa = e);
    } else {
      this.modalEmpresa = empresa;
    }
  }
  abrirCrear(): void {
    this.modoForm = 'crear';
    this.empresaForm = { nombre: '', imagen: '' };
  }
  abrirEditar(empresa: Empresa): void {
    this.modoForm = 'editar';
    this.empresaService.getOne(empresa._id!).subscribe(e => this.empresaForm = { ...e });
  }
  verEmpresa(empresa: Empresa): void {
    // Deprecated path for "Ver" replaced by image modal. Keeping for potential reuse.
    this.empresaService.getOne(empresa._id!).subscribe(e => this.empresaSeleccionada = e);
  }
  volverAlListado(): void {
    this.viewMode = 'list';
  }
  guardarForm(): void {
    if (this.modoForm === 'crear') {
      if (!this.empresaForm.nombre || !this.empresaForm.imagen) return;
      this.empresaService.create(this.empresaForm).subscribe({
        next: () => { this.cerrarModal(); this.cargarEmpresas(); this.alert.success('Empresa creada correctamente'); },
        error: () => this.alert.error('No se pudo crear la empresa')
      });
    } else {
      const { _id, ...rest } = this.empresaForm;
      if (!_id) return;
      this.empresaService.update(_id, rest).subscribe({
        next: () => { this.cerrarModal(); this.cargarEmpresas(); this.alert.success('Empresa actualizada correctamente'); },
        error: () => this.alert.error('No se pudo actualizar la empresa')
      });
    }
  }
  confirmarEliminarEmpresa(empresa: Empresa): void {
    this.alert.confirm(`¿Confirmas eliminar la empresa "${empresa.nombre}"?`).then(confirmed => {
      if (!confirmed || !empresa._id) return;
      this.empresaService.delete(empresa._id).subscribe({
        next: () => { this.cargarEmpresas(); this.alert.success('Empresa eliminada correctamente'); },
        error: () => this.alert.error('No se pudo eliminar la empresa')
      });
    });
  }
  // Resúmenes para cabecera
  get totalEmpresas(): number {
    return this.empresas.length;
  }

  get ultimaEmpresaNombre(): string {
    if (!this.empresas || this.empresas.length === 0) return '—';
    const last = this.empresas[this.empresas.length - 1];
    return last?.nombre || '—';
  }
 cerrarModal(): void {
    (document.querySelector('.modal.show .btn-close') as HTMLButtonElement)?.click();
  }
}
