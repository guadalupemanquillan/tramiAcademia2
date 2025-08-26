import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { VideoService } from '../../core/services/video.service';
import { VideoItem } from '../../core/models/video.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { Categoria } from '../../core/models/categoria.model';
import { CategoriaService } from '../../core/services/categoria.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class VideoComponent implements OnInit {
  videos: VideoItem[] = [];
  nuevoVideo: Partial<VideoItem> = { urlYouTube: '', titulo: '', categoriaId: null };
  videoEditar: Partial<VideoItem> | null = null;
  loading = true;
  categorias: Categoria[] = [];
  categoriaSeleccionada: string | null = null;

  constructor(private videoService: VideoService, private cdr: ChangeDetectorRef, private alert: AlertService, public authService: AuthService, private categoriaService: CategoriaService) {}

  ngOnInit(): void {
    this.cargarVideos();
    this.cargarCategorias();
  }

  cargarVideos(): void {
    this.loading = true;
    this.videoService.getAll().subscribe({
      next: data => { this.videos = data; this.loading = false; this.cdr.detectChanges(); },
      error: () => { this.loading = false; }
    });
  }

  private cargarCategorias(): void {
    this.categoriaService.getAll(1, 100, '').subscribe({
      next: resp => { this.categorias = resp.items || []; this.cdr.detectChanges(); },
      error: () => { this.categorias = []; }
    });
  }

  crearVideo(): void {
    if (!this.nuevoVideo.titulo || !this.nuevoVideo.urlYouTube || !this.nuevoVideo.categoriaId) {
      this.alert.warning('Completa título, URL y categoría.');
      return;
    }
    this.videoService.create(this.nuevoVideo).subscribe({
      next: () => { this.nuevoVideo = { urlYouTube: '', titulo: '', categoriaId: null }; this.cargarVideos(); this.alert.success('Video creado.'); },
      error: () => this.alert.error('No se pudo crear el video.')
    });
  }

  abrirEditar(v: VideoItem): void {
    this.videoService.getOne(v._id!).subscribe(res => this.videoEditar = { ...res });
  }

  guardarEdicion(): void {
    if (!this.videoEditar || !this.videoEditar._id) return;
    const { _id, ...rest } = this.videoEditar as VideoItem;
    this.videoService.update(_id!, rest).subscribe({
      next: () => { this.cargarVideos(); this.alert.success('Video actualizado.'); },
      error: () => this.alert.error('No se pudo actualizar el video.')
    });
  }

  confirmarEliminar(v: VideoItem): void {
    this.alert.confirm(`¿Eliminar video "${v.titulo}"?`).then(ok => {
      if (!ok || !v._id) return;
      this.videoService.delete(v._id).subscribe({
        next: () => { this.cargarVideos(); this.alert.success('Video eliminado.'); },
        error: () => this.alert.error('No se pudo eliminar el video.')
      });
    });
  }

  // --- Helpers usados por Dashboard ---
  static filterVideosForUser(videos: any[] | null | undefined, user: any | null | undefined): any[] {
    if (!Array.isArray(videos)) return [];
    const categoriaId = (user as any)?.categoriaId || null;
    if (!categoriaId) return videos;
    return videos.filter(v => String((v as any)?.categoriaId || '') === String(categoriaId));
  }

  get videosFiltrados(): VideoItem[] {
    if (!this.categoriaSeleccionada) return this.videos;
    return this.videos.filter(v => String((v as any)?.categoriaId || '') === String(this.categoriaSeleccionada));
  }

  trackVideo(index: number, v: VideoItem): string | number { return v?._id || index; }
  trackCategoria(index: number, c: Categoria): string | number { return c?._id || index; }
}


