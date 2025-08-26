import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ArticuloService } from '../../core/services/articulo.service';
import { Articulo } from '../../core/models/articulo.model';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { TareasService } from '../../core/services/tareas.service';

@Component({
    selector: 'app-articulos',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './articulo.component.html'
})
export class ArticuloComponent implements OnInit {
    articulos: Articulo[] = [];
    nuevoArticulo: Partial<Articulo> = { titulo: '', texto: '', autor: '', categoriaId: '' };

    editando: Articulo = {
        _id: '',
        titulo: '',
        texto: '',
        autor: '',
        categoriaId: '',
        historialEdiciones: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    editandoActivo: boolean = false;
    categorias: Categoria[] = [];
    categoriaSeleccionada: string = '';
    rolActual: string | null = null;
    articuloVer: Articulo | null = null;

    constructor(
        private articuloService: ArticuloService,
        private categoriaService: CategoriaService,
        private authService: AuthService,
        private alert: AlertService,
        private tareas: TareasService
    ) { }

    ngOnInit(): void {
        this.rolActual = this.authService.role;
        this.cargarArticulos();
        this.cargarCategorias();
    }

    trackArticulo(index: number, a: Articulo): string | number { return a?._id || index; }
    trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }

    cargarArticulos(): void {
        this.articuloService.getAll().subscribe({
            next: (data) => (this.articulos = data),
            error: (err) => console.error(err)
        });
    }

    cargarCategorias(): void {
        this.categoriaService.getAll(1, 100).subscribe({
            next: (resp) => this.categorias = resp.items || [],
            error: (err) => console.error(err)
        });
    }

    get articulosFiltrados(): Articulo[] {
        if (!this.categoriaSeleccionada) return this.articulos;

        return this.articulos.filter(a => {
            if (!a.categoriaId) return false;
            let catId = typeof a.categoriaId === 'string' ? a.categoriaId : (a.categoriaId as any)._id || a.categoriaId;
            return String(catId) === this.categoriaSeleccionada;
        });
    }

    obtenerNombreCategoria(categoria: any): string {
        if (!categoria) return 'Sin categoría';
        if (typeof categoria === 'string') {
            const encontrada = this.categorias.find(c => c._id === categoria);
            return encontrada?.nombre || categoria;
        }
        return categoria?.nombre || 'Sin categoría';
    }

    crearArticulo(): void {
        if (!this.nuevoArticulo.titulo || !this.nuevoArticulo.texto || !this.nuevoArticulo.categoriaId) return;

        this.articuloService.create(this.nuevoArticulo as Articulo).subscribe({
            next: () => {
                this.cargarArticulos();
                this.nuevoArticulo = { titulo: '', texto: '', autor: '', categoriaId: '' };
                this.alert.success('Artículo creado correctamente');
            },
            error: () => this.alert.error('No se pudo crear el artículo')
        });
    }

    verArticulo(articulo: Articulo): void {
        this.articuloVer = articulo;
    }

    marcarArticuloLeido(articulo: Articulo | null): void {
        const userId = this.authService.id;
        if (!articulo || !userId) { this.alert.warning('Debes iniciar sesión.'); return; }
        const nombre = `Articulo leído: ${articulo.titulo}`;
        this.tareas.create({ usuarioId: userId, tareaCompletada: nombre } as any).subscribe({
            next: () => this.alert.success('Marcado como leído.'),
            error: () => this.alert.error('No se pudo registrar la lectura.')
        });
    }

    eliminarArticulo(id: string): void {
        this.articuloService.delete(id).subscribe({
            next: () => this.cargarArticulos(),
            error: (err) => console.error(err)
        });
    }

    editarArticulo(articulo: Articulo): void {
        this.editando = { ...articulo };
        this.editandoActivo = true;
    }

    actualizarArticulo(): void {
        if (!this.editando._id) return;

        this.articuloService.update(this.editando._id, this.editando).subscribe({
            next: () => {
                this.cargarArticulos();
                this.cancelarEdicion();
            },
            error: (err) => console.error(err)
        });
    }

    cancelarEdicion(): void {
        this.editandoActivo = false;
        this.editando = {
            _id: '',
            titulo: '',
            texto: '',
            autor: '',
            categoriaId: '',
            historialEdiciones: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}
