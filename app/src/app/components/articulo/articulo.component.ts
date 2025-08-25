import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ArticuloService } from '../../core/services/articulo.service';
import { Articulo } from '../../core/models/articulo.model';

@Component({
    selector: 'app-articulos',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './articulo.component.html'
})
export class ArticuloComponent implements OnInit {
    articulos: Articulo[] = [];
    nuevoArticulo: Partial<Articulo> = { titulo: '', texto: '', autor: '', categoriaId: '' };

    // inicializado vacío
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

    editandoActivo: boolean = false; // para saber si estamos editando

    constructor(private articuloService: ArticuloService) { }

    ngOnInit(): void {
        this.cargarArticulos();
    }

    cargarArticulos(): void {
        this.articuloService.getAll().subscribe({
            next: (data) => (this.articulos = data),
            error: (err) => console.error(err)
        });
    }

    crearArticulo(): void {
        if (!this.nuevoArticulo.titulo || !this.nuevoArticulo.texto) return;

        this.articuloService.create(this.nuevoArticulo as Articulo).subscribe({
            next: () => {
                this.cargarArticulos();
                this.nuevoArticulo = { titulo: '', texto: '', autor: '', categoriaId: '' };
            },
            error: (err) => console.error(err)
        });
    }

    eliminarArticulo(id: string): void {
        this.articuloService.delete(id).subscribe({
            next: () => this.cargarArticulos(),
            error: (err) => console.error(err)
        });
    }

    editarArticulo(articulo: Articulo): void {
        this.editando = { ...articulo }; // clonar
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
