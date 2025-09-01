import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria, CategoriaPaginatedResponse } from '../../core/models/categoria.model';
import { EmpresaService } from '../../core/services/empresa.service';
import { Empresa } from '../../core/models/empresa.model';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent {
  categoriasResp: CategoriaPaginatedResponse = { items: [], page: 1, total: 0, limit: 10, totalPages: 1 };
  categoriasNombreFiltro = '';
  categoriasPage = 1;
  categoriasLimit = 10;

  nuevaCategoria: Partial<Categoria> = { nombre: '', categoriaPadre: null, jerarquia: 0, empresaId: null };
  categoriaEditar: Partial<Categoria> | null = null;
  todasCategorias: Categoria[] = [];
  empresas: Empresa[] = [];

  constructor(private categoriaService: CategoriaService, private alert: AlertService, private empresaService: EmpresaService) {
    this.cargarCategorias();
    this.cargarTodasCategorias();
    this.cargarEmpresas();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll(this.categoriasPage, this.categoriasLimit, this.categoriasNombreFiltro)
      .subscribe({ next: resp => this.categoriasResp = resp, error: () => this.categoriasResp.items = [] });
  }

  cargarTodasCategorias(): void {
    this.categoriaService.getAll(1, 1000).subscribe({ next: resp => this.todasCategorias = resp.items || [], error: () => this.todasCategorias = [] });
  }

  cargarEmpresas(): void {
    this.empresaService.getAll().subscribe({ next: emps => this.empresas = emps || [], error: () => this.empresas = [] });
  }

  cambiarPaginaCategorias(page: number): void {
    if (page < 1 || page > this.categoriasResp.totalPages) return;
    this.categoriasPage = page;
    this.cargarCategorias();
  }

  crearCategoria(): void {
    if (!this.nuevaCategoria.nombre) return;
    this.categoriaService.create(this.nuevaCategoria).subscribe({
      next: () => {
        this.nuevaCategoria = { nombre: '', categoriaPadre: null, jerarquia: 0, empresaId: null };
        (document.getElementById('crearCategoriaCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarCategorias();
        this.cargarTodasCategorias();
        this.alert.success('La categoría se creó correctamente.');
      },
      error: err => this.alert.error(err?.error?.error || 'No se pudo crear la categoría.')
    });
  }

  categoriaNombrePorId(id?: string | null): string {
    return this.todasCategorias.find(c => c._id === id)?.nombre || '-';
  }

  empresaNombrePorId(id?: string | null): string {
    return this.empresas.find(e => e._id === id)?.nombre || 'Sin empresa';
  }

  abrirEditarCategoria(cat: Categoria): void {
    if (!cat._id) return;
    this.categoriaService.getOne(cat._id).subscribe(c => this.categoriaEditar = { ...c });
  }

  guardarEdicionCategoria(): void {
    if (!this.categoriaEditar?._id) return;
    this.categoriaService.update(this.categoriaEditar._id, this.categoriaEditar).subscribe({
      next: () => {
        (document.getElementById('editarCategoriaCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarCategorias();
        this.alert.success('La categoría se actualizó correctamente.');
      },
      error: () => this.alert.error('No se pudo actualizar la categoría.')
    });
  }

  confirmarEliminarCategoria(cat: Categoria): void {
    if (!cat._id) return;
    this.alert.confirm(`¿Confirmas eliminar la categoría "${cat.nombre}"?`, 'Esta acción no se puede deshacer.', 'Sí, eliminar', 'Cancelar', 'warning')
      .then(confirmed => confirmed && this.categoriaService.delete(cat._id!).subscribe({
        next: () => { this.cargarCategorias(); this.alert.success('La categoría se eliminó correctamente.'); },
        error: () => this.alert.error('No se pudo eliminar la categoría.')
      }));
  }

  trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }
  static getParentCount(categorias: Categoria[]): number {
    if (!Array.isArray(categorias)) return 0;
    return categorias.filter(cat => !cat.categoriaPadre).length;
  }
}
