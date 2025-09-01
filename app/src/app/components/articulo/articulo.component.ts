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
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
    selector: 'app-articulos',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './articulo.component.html'
})
export class ArticuloComponent implements OnInit {
    articulos: Articulo[] = [];
    categorias: Categoria[] = [];
    nuevoArticulo: Partial<Articulo> = { titulo: '', texto: '', autor: '', categoriaId: '' };
    editando: Articulo = this.getArticuloVacio();
    editandoActivo = false;

    categoriaSeleccionada = '';
    rolActual: string | null = null;
    articuloVer: Articulo | null = null;

    private existingArticleTasks = new Set<string>();

    constructor(
        private articuloService: ArticuloService,
        private categoriaService: CategoriaService,
        private authService: AuthService,
        private alert: AlertService,
        private tareas: TareasService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.rolActual = this.authService.role;
        this.cargarArticulos();
        this.cargarCategorias();
        this.cargarTareasExistentes();
    }

    trackArticulo = (_: number, a: Articulo) => a?._id;
    trackCategoria = (_: number, c: Categoria) => c?._id;

    get articulosFiltrados(): Articulo[] {
        return this.categoriaSeleccionada
            ? this.articulos.filter(a => a.categoriaId === this.categoriaSeleccionada)
            : this.articulos;
    }

    obtenerNombreCategoria(categoriaId: string): string {
        return this.categorias.find(c => c._id === categoriaId)?.nombre || 'Sin categoría';
    }

    private getArticuloVacio(): Articulo {
        return { _id: '', titulo: '', texto: '', autor: '', categoriaId: '', historialEdiciones: [], createdAt: new Date(), updatedAt: new Date() };
    }

    cargarArticulos(): void {
        this.articuloService.getAll().subscribe({
            next: data => {
                const articulosNormalizados = data.map(a => ({
                    ...a,
                    categoriaId: typeof a.categoriaId === 'object' ? (a.categoriaId as any)._id : a.categoriaId
                }));
                this.articulos = this.rolActual === 'editor' ? articulosNormalizados : [];
                if (this.rolActual !== 'editor') this.filtrarArticulosPorEmpresa(articulosNormalizados);
            },
            error: err => console.error(err)
        });
    }

    cargarCategorias(): void {
        this.categoriaService.getAll(1, 100).subscribe({
            next: resp => (this.categorias = resp.items || []),
            error: err => console.error(err)
        });
    }

    crearArticulo(): void {
        if (!this.nuevoArticulo.titulo || !this.nuevoArticulo.texto || !this.nuevoArticulo.categoriaId) return;

        this.articuloService.create(this.nuevoArticulo as Articulo).subscribe({
            next: () => {
                this.nuevoArticulo = { titulo: '', texto: '', autor: '', categoriaId: '' };
                (document.getElementById('crearArticuloCerrarBtn') as HTMLButtonElement)?.click();
                this.cargarArticulos();
                this.alert.successWithAutoClose('Artículo creado correctamente.');
            },
            error: () => this.alert.error('No se pudo crear el artículo')
        });
    }

    verArticulo(articulo: Articulo): void {
        this.articuloVer = articulo;
    }

    isArticuloAlreadyRead = (a: Articulo) => this.existingArticleTasks.has(`Articulo leído: ${a.titulo}`);

    marcarArticuloLeido(articulo: Articulo | null): void {
        const userId = this.authService.id;
        if (!articulo || !userId) {
            this.alert.warning('Debes iniciar sesión.');
            return;
        }

        if (this.isArticuloAlreadyRead(articulo)) {
            this.alert.info('Ya lo habías marcado como leído.');
            return;
        }

        const nombre = `Articulo leído: ${articulo.titulo}`;
        this.tareas.create({ usuarioId: userId, tareaCompletada: nombre } as any).subscribe({
            next: () => this.existingArticleTasks.add(nombre),
            error: () => this.alert.error('No se pudo registrar la lectura.')
        });
    }

    eliminarArticulo(id: string): void {
        this.articuloService.getOne(id).subscribe({
            next: articulo => {
                this.alert.confirm(`¿Eliminar "${articulo.titulo}"?`, 'Esta acción no se puede deshacer.', 'Sí, eliminar', 'Cancelar', 'warning')
                    .then(confirmed => {
                        if (confirmed) {
                            this.articuloService.delete(id).subscribe({
                                next: () => {
                                    this.cargarArticulos();
                                    this.alert.success('El artículo se eliminó correctamente.');
                                },
                                error: () => this.alert.error('No se pudo eliminar el artículo.')
                            });
                        }
                    });
            },
            error: () => this.alert.error('No se pudo obtener el artículo.')
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
            error: err => console.error(err)
        });
    }

    cancelarEdicion(): void {
        this.editandoActivo = false;
        this.editando = this.getArticuloVacio();
    }

    private cargarTareasExistentes(): void {
        const userId = this.authService.id;
        if (!userId) return;

        this.tareas.getAll({ usuarioId: userId }).subscribe({
            next: tareas => {
                this.existingArticleTasks.clear();
                (tareas || []).forEach((t: any) => {
                    if (t.tareaCompletada?.startsWith('Articulo leído:')) this.existingArticleTasks.add(t.tareaCompletada);
                });
            }
        });
    }

    private filtrarArticulosPorEmpresa(articulos: Articulo[]): void {
        const userId = this.authService.id;
        if (!userId) {
            this.articulos = [];
            return;
        }

        this.userService.getOne(userId).subscribe({
            next: (user: User) => {
                const categoriasEmpresa = user?.categoriasEmpresa || [];
                if (!categoriasEmpresa.length) {
                    this.articulos = [];
                    this.alert.info('Tu empresa no tiene categorías asignadas.');
                    return;
                }

                const ids = categoriasEmpresa.map(c => c._id);
                this.articulos = articulos.filter(a => ids.includes(String(a.categoriaId || '')));
            },
            error: () => {
                this.articulos = [];
                this.alert.error('No se pudo obtener la información del usuario.');
            }
        });
    }
}
