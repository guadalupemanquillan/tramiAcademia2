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
import { TareasService } from '../../core/services/tareas.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

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
  private ytPlayer: any = null;
  private lastAllowedTime = 0;
  private endedVideos = new Set<string>();

  constructor(private videoService: VideoService, private cdr: ChangeDetectorRef, private alert: AlertService, public authService: AuthService, private categoriaService: CategoriaService, private tareas: TareasService, private userService: UserService) { }

  ngOnInit(): void {
    this.cargarVideos();
    this.cargarCategorias();
    this.cargarTareasExistentes();
  }

  cargarVideos(): void {
    this.loading = true;
    this.videoService.getAll().subscribe({
      next: data => {
        if (this.authService.role === 'editor') {
          // Los editores ven todos los videos
          this.videos = data;
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          // Los usuarios solo ven videos de sus categorías de empresa
          this.filtrarVideosPorEmpresa(data);
        }
      },
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
      next: () => {
        this.resetearFormularioVideo();
        this.alert.successWithAutoClose('Video creado correctamente.');
      },
      error: () => this.alert.error('No se pudo crear el video.')
    });
  }

  private resetearFormularioVideo(): void {
    this.nuevoVideo = { urlYouTube: '', titulo: '', categoriaId: null };
    (document.getElementById('crearVideoCerrarBtn') as HTMLButtonElement)?.click();
    this.cargarVideos();
  }

  abrirEditar(v: VideoItem): void {
    this.videoService.getOne(v._id!).subscribe(res => this.videoEditar = { ...res });
  }

  guardarEdicion(): void {
    if (!this.videoEditar || !this.videoEditar._id) return;
    const { _id, ...rest } = this.videoEditar as VideoItem;
    this.videoService.update(_id!, rest).subscribe({
      next: () => { this.cargarVideos(); },
      error: () => this.alert.error('No se pudo actualizar el video.')
    });
  }

  confirmarEliminar(v: VideoItem): void {
    this.alert.confirm(
      `¿Eliminar video "${v.titulo}"?`,
      'Esta acción no se puede deshacer.',
      'Sí, eliminar',
      'Cancelar',
      'warning'
    ).then(ok => {
      if (!ok || !v._id) return;
      this.videoService.delete(v._id).subscribe({
        next: () => { this.cargarVideos(); },
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

  onVideoEnded(v: VideoItem): void {
    const id = (v as any)?._id as string | undefined;
    if (id) this.endedVideos.add(String(id));
    this.cdr.detectChanges();
  }

  abrirPlayer(v: VideoItem): void {
    const videoId = this.extraerYouTubeId(v.urlYouTube || '');
    if (!videoId) { this.alert.warning('URL de YouTube inválida.'); return; }
    (window as any)['onYouTubeIframeAPIReady'] = () => this.crearPlayer(videoId, v);
    if ((window as any)['YT']?.Player) {
      this.crearPlayer(videoId, v);
    }
    const modalEl = document.getElementById('modalVerVideoUsuario');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  private crearPlayer(videoId: string, v: VideoItem): void {
    const self = this;
    this.lastAllowedTime = 0;
    if (this.ytPlayer && typeof this.ytPlayer.destroy === 'function') {
      try { this.ytPlayer.destroy(); } catch { }
      this.ytPlayer = null;
    }
    const anyWin = window as any;
    this.ytPlayer = new anyWin.YT.Player('yt-player', {
      videoId,
      playerVars: { controls: 1, disablekb: 1, modestbranding: 1 },
      events: {
        onReady: (e: any) => {
          e.target.playVideo();
          self.lastAllowedTime = 0;
          self.vigilarSeek(e.target, v);
        },
        onStateChange: (e: any) => {
          // 0 = ended
          if (e.data === 0) {
            self.onVideoEnded(v);
          }
        }
      }
    });
  }

  private vigilarSeek(player: any, v: VideoItem): void {
    const check = () => {
      if (!player || typeof player.getCurrentTime !== 'function') return;
      const current = player.getCurrentTime();
      // Si el usuario se adelanta más de 1.5s, lo regresamos al último punto permitido
      if (current > this.lastAllowedTime + 1.5) {
        player.seekTo(this.lastAllowedTime, true);
      } else {
        this.lastAllowedTime = Math.max(this.lastAllowedTime, current);
      }
      // terminar cuando finaliza
      const state = player.getPlayerState?.();
      if (state === 0) return; // ended
      requestAnimationFrame(check);
    };
    requestAnimationFrame(check);
  }

  private extraerYouTubeId(url: string): string | null {
    if (!url) return null;
    const m = url.match(/(?:v=|\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m && m[1] ? m[1] : null;
  }

  isVideoEnded(v: VideoItem): boolean {
    const id = (v as any)?._id as string | undefined;
    return !!(id && this.endedVideos.has(String(id)));
  }

  // Verificar si el video ya fue marcado como visto
  isVideoAlreadyWatched(v: VideoItem): boolean {
    const userId = this.authService.id;
    if (!userId) return false;
    
    // Buscar en las tareas existentes si ya existe una tarea para este video
    const videoTaskName = `Video visualizado: ${v.titulo}`;
    return this.existingVideoTasks.has(videoTaskName);
  }

  // Set para almacenar las tareas de video ya completadas
  private existingVideoTasks = new Set<string>();

  // Cargar las tareas existentes del usuario
  private cargarTareasExistentes(): void {
    const userId = this.authService.id;
    if (!userId) return;

    this.tareas.getAll({ usuarioId: userId }).subscribe({
      next: (tareas) => {
        this.existingVideoTasks.clear();
        (tareas || []).forEach((tarea: any) => {
          if (tarea.tareaCompletada && tarea.tareaCompletada.startsWith('Video visualizado:')) {
            this.existingVideoTasks.add(tarea.tareaCompletada);
          }
        });
        this.cdr.detectChanges();
      },
      error: () => {
        // Silenciar error, no es crítico
      }
    });
  }

  marcarVideoVisto(v: VideoItem): void {
    const userId = this.authService.id;
    if (!userId) { 
      this.alert.warning('Debes iniciar sesión.'); 
      return; 
    }

    // Verificar si ya fue marcado como visto
    if (this.isVideoAlreadyWatched(v)) {
      this.alert.info('Ya has marcado este video como visto anteriormente.');
      return;
    }

    const nombre = `Video visualizado: ${v.titulo}`;
    this.tareas.create({ usuarioId: userId, tareaCompletada: nombre } as any).subscribe({
      next: () => {
        // Agregar a la lista local para evitar duplicados
        this.existingVideoTasks.add(nombre);
        this.cdr.detectChanges();
      },
      error: () => this.alert.error('No se pudo registrar la visualización.')
    });
  }

  private filtrarVideosPorEmpresa(videos: VideoItem[]): void {
    const userId = this.authService.id;
    if (!userId) {
      this.videos = [];
      this.loading = false;
      return;
    }

    this.userService.getOne(userId).subscribe({
      next: (user: User) => {
        if (!user?.empresaId || typeof user.empresaId === 'string') {
          // Si no tiene empresa, no puede ver videos
          this.videos = [];
          this.loading = false;
          this.alert.info('No tienes empresa asignada. Contacta al administrador.');
          this.cdr.detectChanges();
          return;
        }

        const categoriasEmpresa = user.categoriasEmpresa || [];
        if (categoriasEmpresa.length === 0) {
          // Si la empresa no tiene categorías, no puede ver videos
          this.videos = [];
          this.loading = false;
          this.alert.info('Tu empresa no tiene categorías asignadas. Contacta al administrador.');
          this.cdr.detectChanges();
          return;
        }

        // Obtener IDs de las categorías de la empresa
        const categoriaIds = categoriasEmpresa.map(cat => cat._id).filter(id => id);

        // Filtrar videos que pertenecen a las categorías de la empresa
        this.videos = videos.filter(video => {
          if (!video.categoriaId) return false;
          
          let videoCatId: string;
          if (typeof video.categoriaId === 'object' && video.categoriaId !== null) {
            videoCatId = (video.categoriaId as any)._id || video.categoriaId;
          } else {
            videoCatId = video.categoriaId as string;
          }
          
          return categoriaIds.includes(String(videoCatId || ''));
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.videos = [];
        this.loading = false;
        this.alert.error('No se pudo obtener la información del usuario.');
        this.cdr.detectChanges();
      }
    });
  }
}


