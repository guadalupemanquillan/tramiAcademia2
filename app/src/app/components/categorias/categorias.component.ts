import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria, CategoriaPaginatedResponse } from '../../core/models/categoria.model';
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

  nuevaCategoria: Partial<Categoria> = { nombre: '', categoriaPadre: null, jerarquia: 0 };
  categoriaEditar: Partial<Categoria> | null = null;
  todasCategorias: Categoria[] = [];

  constructor(private categoriaService: CategoriaService, private alert: AlertService) {
    this.cargarCategorias();
    this.cargarTodasCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll(this.categoriasPage, this.categoriasLimit, this.categoriasNombreFiltro)
      .subscribe({
        next: resp => { this.categoriasResp = resp; },
        error: () => { this.categoriasResp = { items: [], page: 1, total: 0, limit: 10, totalPages: 1 }; }
      });
  }

  cargarTodasCategorias(): void {
    this.categoriaService.getAll(1, 1000, '')
      .subscribe({
        next: resp => { this.todasCategorias = resp.items || []; },
        error: () => { this.todasCategorias = []; }
      });
  }

  cambiarPaginaCategorias(page: number): void {
    if (page < 1 || page > this.categoriasResp.totalPages) return;
    this.categoriasPage = page;
    this.cargarCategorias();
  }

  crearCategoria(): void {
    if (!this.nuevaCategoria.nombre) return;

    const payload: Partial<Categoria> = {
      nombre: this.nuevaCategoria.nombre!,
      categoriaPadre: this.nuevaCategoria.categoriaPadre ?? null,
      jerarquia: this.nuevaCategoria.jerarquia ?? 0
    };

    this.categoriaService.create(payload).subscribe({
      next: () => {
        this.nuevaCategoria = { nombre: '', categoriaPadre: null, jerarquia: 0 };
        (document.getElementById('crearCategoriaCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarCategorias();
        this.cargarTodasCategorias();
        this.alert.success('La categoría se creó correctamente.');
      },
      error: (err) => {
        const msg = err?.error?.error || 'No se pudo crear la categoría.';
        this.alert.error(msg);
      }
    });
  }

  categoriaNombrePorId(id?: string | null): string {
    if (!id) return '-';
    const found = this.todasCategorias.find(c => c._id === id);
    return found?.nombre || '-';
  }

  abrirEditarCategoria(cat: Categoria): void {
    if (!cat._id) return;
    this.categoriaService.getOne(cat._id).subscribe(c => {
      this.categoriaEditar = { ...c };
    });
  }

  guardarEdicionCategoria(): void {
    if (!this.categoriaEditar?._id) return;

    const _id = this.categoriaEditar._id;
    const payload: Partial<Categoria> = {
      nombre: this.categoriaEditar.nombre!,
      categoriaPadre: this.categoriaEditar.categoriaPadre ?? null,
      jerarquia: this.categoriaEditar.jerarquia ?? 0,
      empresaId: this.categoriaEditar.empresaId ?? null
    };

    this.categoriaService.update(_id, payload).subscribe({
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
    this.alert.confirm(`¿Confirmas eliminar la categoría "${cat.nombre}"?`).then(confirmed => {
      if (!confirmed) return;
      this.categoriaService.delete(cat._id!).subscribe({
        next: () => {
          this.cargarCategorias();
          this.alert.success('La categoría se eliminó correctamente.');
        },
        error: () => this.alert.error('No se pudo eliminar la categoría.')
      });
    });
  }
}
