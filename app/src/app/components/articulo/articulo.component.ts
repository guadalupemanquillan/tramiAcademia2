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
        private tareas: TareasService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.rolActual = this.authService.role;
        this.cargarArticulos();
        this.cargarCategorias();
        this.cargarTareasExistentes();
    }

    trackArticulo(index: number, a: Articulo): string | number { return a?._id || index; }
    trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }

    cargarArticulos(): void {
        this.articuloService.getAll().subscribe({
            next: (data) => {
                if (this.rolActual === 'editor') {
                    // Los editores ven todos los artículos
                    this.articulos = data;
                } else {
                    // Los usuarios solo ven artículos de sus categorías de empresa
                    this.filtrarArticulosPorEmpresa(data);
                }
            },
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
                this.resetearFormularioArticulo();
                this.alert.successWithAutoClose('Artículo creado correctamente.');
            },
            error: () => this.alert.error('No se pudo crear el artículo')
        });
    }

    private resetearFormularioArticulo(): void {
        this.nuevoArticulo = { titulo: '', texto: '', autor: '', categoriaId: '' };
        (document.getElementById('crearArticuloCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarArticulos();
    }

    verArticulo(articulo: Articulo): void {
        this.articuloVer = articulo;
    }

    // Set para almacenar las tareas de artículos ya completadas
    private existingArticleTasks = new Set<string>();

    // Cargar las tareas existentes del usuario
    private cargarTareasExistentes(): void {
        const userId = this.authService.id;
        if (!userId) return;

        this.tareas.getAll({ usuarioId: userId }).subscribe({
            next: (tareas) => {
                this.existingArticleTasks.clear();
                (tareas || []).forEach((tarea: any) => {
                    if (tarea.tareaCompletada && tarea.tareaCompletada.startsWith('Articulo leído:')) {
                        this.existingArticleTasks.add(tarea.tareaCompletada);
                    }
                });
            },
            error: () => {
                // Silenciar error, no es crítico
            }
        });
    }

    // Verificar si el artículo ya fue marcado como leído
    isArticuloAlreadyRead(articulo: Articulo): boolean {
        const userId = this.authService.id;
        if (!userId) return false;
        
        const articleTaskName = `Articulo leído: ${articulo.titulo}`;
        return this.existingArticleTasks.has(articleTaskName);
    }

    marcarArticuloLeido(articulo: Articulo | null): void {
        const userId = this.authService.id;
        if (!articulo || !userId) { 
            this.alert.warning('Debes iniciar sesión.'); 
            return; 
        }

        // Verificar si ya fue marcado como leído
        if (this.isArticuloAlreadyRead(articulo)) {
            this.alert.info('Ya has marcado este artículo como leído anteriormente.');
            return;
        }

        const nombre = `Articulo leído: ${articulo.titulo}`;
            this.tareas.create({ usuarioId: userId, tareaCompletada: nombre } as any).subscribe({
      next: () => {
        // Agregar a la lista local para evitar duplicados
        this.existingArticleTasks.add(nombre);
      },
      error: () => this.alert.error('No se pudo registrar la lectura.')
    });
    }

    eliminarArticulo(id: string): void {
        // Primero necesitamos obtener el artículo para mostrar su título
        this.articuloService.getOne(id).subscribe({
            next: (articulo) => {
                this.alert.confirm(
                    `¿Confirmas eliminar el artículo "${articulo.titulo}"?`,
                    'Esta acción no se puede deshacer.',
                    'Sí, eliminar',
                    'Cancelar',
                    'warning'
                ).then(confirmed => {
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
            error: () => this.alert.error('No se pudo obtener la información del artículo.')
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

    private filtrarArticulosPorEmpresa(articulos: Articulo[]): void {
        const userId = this.authService.id;
        if (!userId) {
            this.articulos = [];
            return;
        }

        this.userService.getOne(userId).subscribe({
            next: (user: User) => {
                if (!user?.empresaId || typeof user.empresaId === 'string') {
                    // Si no tiene empresa, no puede ver artículos
                    this.articulos = [];
                    this.alert.info('No tienes empresa asignada. Contacta al administrador.');
                    return;
                }

                const categoriasEmpresa = user.categoriasEmpresa || [];
                if (categoriasEmpresa.length === 0) {
                    // Si la empresa no tiene categorías, no puede ver artículos
                    this.articulos = [];
                    this.alert.info('Tu empresa no tiene categorías asignadas. Contacta al administrador.');
                    return;
                }

                // Obtener IDs de las categorías de la empresa
                const categoriaIds = categoriasEmpresa.map(cat => cat._id).filter(id => id);

                // Filtrar artículos que pertenecen a las categorías de la empresa
                this.articulos = articulos.filter(articulo => {
                    if (!articulo.categoriaId) return false;
                    
                    let articuloCatId: string;
                    if (typeof articulo.categoriaId === 'object' && articulo.categoriaId !== null) {
                        articuloCatId = (articulo.categoriaId as any)._id || articulo.categoriaId;
                    } else {
                        articuloCatId = articulo.categoriaId as string;
                    }
                    
                    return categoriaIds.includes(String(articuloCatId || ''));
                });
            },
            error: () => {
                this.articulos = [];
                this.alert.error('No se pudo obtener la información del usuario.');
            }
        });
    }
}
