import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EmpresaService } from '../../core/services/empresa.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { TestService } from '../../core/services/test.service';
import { VideoService } from '../../core/services/video.service';
import { ArticuloService } from '../../core/services/articulo.service';
import { TodoService } from '../../core/services/todo.service';
import { LogrosService } from '../../core/services/logros.service';
import { UserService } from '../../core/services/user.service';
import { TareasService } from '../../core/services/tareas.service';
import { Tile } from '../../core/models/dashboard.model';
import { Empresa } from '../../core/models/empresa.model';
import { Categoria } from '../../core/models/categoria.model';
import { TestItem } from '../../core/models/test.model';
import { VideoItem } from '../../core/models/video.model';
import { Logros } from '../../core/models/logros.model';
import { User } from '../../core/models/user.model';
import { DashboardService } from '../../core/services/dashboard.service';
import { TodoItem } from '../../core/models/todo.model';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
})
export class DashboardComponent implements OnInit {
  empresas$: Observable<Empresa[]> = of([]);
  categorias$: Observable<Categoria[]> = of([]);
  tests$: Observable<TestItem[]> = of([]);
  videos$: Observable<VideoItem[]> = of([]);
  articulos$: Observable<any[]> = of([]);
  logros$: Observable<Logros[]> = of([]);
  tareas$: Observable<any[]> = of([]);
  todos$: Observable<TodoItem[]> = of([]);
  users$: Observable<User[]> = of([]);
  currentUser$: Observable<User | null> = of(null);
  private categoriasSnapshot: Categoria[] = [];
  private empresasSnapshot: Empresa[] = [];
  isEditorFlag = false;
  tareasCompletadasPct$: Observable<number> = of(0);
  tareasCompletadasCount$: Observable<number> = of(0);
  tareasPendientesCount$: Observable<number> = of(0);
  testsPendientesCount$: Observable<number> = of(0);
  tiles: Tile[] = [];
  tilesCrear: Tile[] = [];
  tilesGestion: Tile[] = [];
  testsHelper = {
    getCompletedCount: (tests: TestItem[]) => tests?.filter((t: any) => !t.isDeleted).length || 0
  };
  tareasHelper = {
    esTest: (value: any) => typeof value === 'string' && value.includes('Test')
  };

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private empresaService: EmpresaService,
    private categoriaService: CategoriaService,
    private testService: TestService,
    private videoService: VideoService,
    private articuloService: ArticuloService,
    private todoService: TodoService,
    private logrosService: LogrosService,
    private userService: UserService,
    private tareasService: TareasService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const currentUrl = this.router.url.replace(/\/$/, '');
    if (currentUrl === '/dashboard') {
      const target = this.authService.role === 'editor' ? '/dashboard/admin' : '/dashboard/usuario';
      this.router.navigate([target]);
      return;
    }
    this.isEditorFlag = this.authService.role === 'editor';
    const userId = this.authService.id;

    if (this.isEditorFlag) {
      this.loadAdminData();
    } else {
      this.loadUserData(userId || '');
    }
  }
  logout(): void {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) this.router.navigate(['/login']);
  }

  idx = (i: number) => i;

  getTileIcon(tile: Tile): string { // helpers para tiles
    const title = (tile?.title || '').toLowerCase();
    if (title.includes('test')) return 'bi-clipboard-check';
    if (title.includes('video')) return 'bi-camera-video';
    if (title.includes('empresa')) return 'bi-buildings';
    if (title.includes('categor')) return 'bi-tags';
    if (title.includes('logro')) return 'bi-trophy-fill';
    if (title.includes('tarea') || title.includes('checklist')) return 'bi-list-check';
    return 'bi-info-circle';
  }
  getTileValue(tile: Tile, item: any): string {
    switch (tile.valueProp) {
      case 'nombre': return item.nombre || 'Sin título';
      case 'preguntas.length': return `${(item.preguntas || []).length} preguntas`;
      case 'titulo': return item.titulo || 'Sin título';
      default: return 'Sin título';
    }
  }
  private getLatestItem(items: any[], tile?: Tile): any | null {
    if (!Array.isArray(items) || !items.length) return null;
    if ((tile?.title || '').toLowerCase().includes('test')) {
      const filtered = items.filter((t: any) => !t?.isDeleted);
      return filtered.length ? filtered[filtered.length - 1] : items[items.length - 1];
    }
    return items[items.length - 1];
  }
  getTileHeadline(tile: Tile, items: any[]): string {
    const title = (tile?.title || '').toLowerCase();
    const total = Array.isArray(items) ? items.length : 0;
    if (title.includes('video') || title.includes('art')) return `${total} creados`;
    if (title.includes('test')) {
      return `${Array.isArray(items) ? items.filter((t: any) => !t?.isDeleted).length : 0} creados`;
    }
    if (title.includes('logro')) return String(total);
    if (title.includes('categor')) return String(total);
    if (title.includes('todo') || title.includes('checklist')) return `${total} creadas`;
    if (title.includes('tarea')) return String(this.getUsersWithTareasCompletadasCount(items));
    const last = this.getLatestItem(items, tile);
    return last ? this.getTileValue(tile, last) : '—';
  }
  getTileSubtitle(tile: Tile, items: any[]): string {
    const title = (tile?.title || '').toLowerCase();
    if (title.includes('test')) return 'Aprobados 1';
    if (title.includes('logro')) return 'Logros entregados';
    if (title.includes('tarea')) return 'Usuarios con tareas completadas';
    if (title.includes('video')) {
      const detalle = this.getResumenPorEmpresa(items, 'Videos');
      return Array.isArray(items) && items.length ? `${items.length} creados · ${detalle}` : 'Videos: 0';
    }
    if (title.includes('empresa')) return 'Empresa';
    if (title.includes('categor')) return 'Categorías creadas';
    if (title.includes('art')) {
      const detalle = this.getResumenPorEmpresa(items, 'Artículos');
      return Array.isArray(items) && items.length ? `${items.length} creados · ${detalle}` : 'Artículos: 0';
    }
    return '';
  }
  private getResumenPorEmpresa(items: any[], etiqueta: string): string {
    if (!Array.isArray(items) || !items.length) return `${etiqueta}: 0`;
    const conteo = new Map<string, number>();
    for (const it of items) {
      const empresaNombre = this.getEmpresaNombreByCategoriaId(it?.categoriaId);
      if (!empresaNombre) continue;
      conteo.set(empresaNombre, (conteo.get(empresaNombre) || 0) + 1);
    }
    if (!conteo.size) return `${etiqueta}: 0`;
    return Array.from(conteo.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([nombre, n]) => `${nombre}: ${n}`)
      .join(' · ');
  }
  private getEmpresaNombreByCategoriaId(catRef: any): string {
    const catId = typeof catRef === 'object' && catRef !== null ? String((catRef as any)?._id || '') : String(catRef || '');
    if (!catId) return '';
    const categoria = (this.categoriasSnapshot || []).find((c: any) => String(c?._id || '') === catId);
    const empresaId = typeof (categoria as any)?.empresaId === 'object' && (categoria as any)?.empresaId !== null
      ? String(((categoria as any).empresaId as any)?._id || '')
      : String((categoria as any)?.empresaId || '');
    if (!empresaId) return '';
    const empresa = (this.empresasSnapshot || []).find((e: any) => String(e?._id || '') === empresaId);
    return (empresa as any)?.nombre || '';
  }

  getEmpresaBreakdownList(items: any[]): string[] {
    return this.dashboardService.getEmpresaBreakdownList(items, this.categoriasSnapshot, this.empresasSnapshot);
  }
  getLatestDate(items: any[]): Date | null { return this.dashboardService.getLatestDate(items); }
  getRelativeTimeFromNow(date: Date): string { return this.dashboardService.getRelativeTimeFromNow(date); }

  private loadAdminData(): void {
    this.initDataStreams();
    this.initTiles();
  }
  private initDataStreams(): void {
    const safe = <T>(obs$: Observable<T>) => obs$.pipe(catchError(() => of([])));
    this.empresas$ = safe(this.empresaService.getAll()).pipe(tap(list => this.empresasSnapshot = Array.isArray(list) ? list : []));
    this.categorias$ = safe(this.categoriaService.getAll(1, 50, '')).pipe(
      map((r: any) => r.items || []),
      tap(list => this.categoriasSnapshot = Array.isArray(list) ? list : [])
    );
    this.tests$ = safe(this.testService.getAll());
    this.videos$ = safe(this.videoService.getAll());
    this.logros$ = safe(this.logrosService.getAll());
    this.tareas$ = safe(this.tareasService.getAll());
    this.users$ = safe(this.userService.getAll());
    this.todos$ = safe(this.todoService.getAll());
  }
  private initTiles(): void {
    this.tilesCrear = [
      { title: 'Artículos', obs: this.articuloService.getAll().pipe(catchError(() => of([]))), link: '/admin/articulos', color: 'primary', valueProp: 'titulo' },
      { title: 'Video', obs: this.videos$, link: '/admin/video', color: 'dark', valueProp: 'titulo' },
      { title: 'Checklist', obs: this.todos$, link: '/admin/todo', color: 'warning', valueProp: 'titulo' },
      { title: 'Tests', obs: this.tests$, link: '/admin/tests', color: 'success', valueProp: 'preguntas.length' },
    ];
    this.tilesGestion = [
      { title: 'Categorías', obs: this.categorias$, link: '/admin/categoria', color: 'info', valueProp: 'nombre' },
      { title: 'Logros', obs: this.logros$, link: '/admin/logro', color: 'success', valueProp: 'nombre' },
      { title: 'Tareas', obs: this.tareas$, link: '/admin/tareas', color: 'warning', valueProp: 'tareaCompletada' },
    ];
  }

  private loadUserData(userId: string): void {
    this.currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
    this.tests$ = this.testService.getAll().pipe(catchError(() => of([])));
    this.videos$ = this.videoService.getAll().pipe(catchError(() => of([])));
    this.articulos$ = this.articuloService.getAll().pipe(catchError(() => of([])));
    this.logros$ = this.logrosService.getAll().pipe(
      map((logros: Logros[]) => {
        const uid = String(userId);
        return (logros || []).filter(l => {
          const logroUserId = typeof l.usuarioId === 'string'
            ? l.usuarioId
            : (l.usuarioId as any)?._id;
          return String(logroUserId || '') === uid;
        });
      }),
      catchError(() => of([]))
    );
    const tareas$ = this.tareasService.getAll({ usuarioId: userId }).pipe(catchError(() => of([])));
    this.tareasCompletadasCount$ = tareas$.pipe(map((tareas: any) => tareas.filter((t: any) => !this.tareasHelper.esTest(t.tareaCompletada || '')).length));
    this.tareasPendientesCount$ = this.dashboardService['tareasPendientesCount$'](userId);
    this.testsPendientesCount$ = this.dashboardService['testsPendientesCount$'](userId);
    this.tareasCompletadasPct$ = combineLatest([this.tareasCompletadasCount$, this.tareasPendientesCount$]).pipe(
      map(([completadas, pendientes]: [number, number]) => (completadas + pendientes ? (completadas / (completadas + pendientes)) * 100 : 0))
    );
    this.tiles = [];
  }
  getEditorsCount(users: User[]): number {
    return Array.isArray(users) ? users.filter((u: any) => (u?.roles || u?.role) === 'editor').length : 0;
  }
  getStandardUsersCount(users: User[]): number {
    return Array.isArray(users) ? users.filter((u: any) => (u?.roles || u?.role) === 'usuario').length : 0;
  }
  private getUsersWithTareasCompletadasCount(tareas: any[]): number {
    if (!Array.isArray(tareas)) return 0;
    const users = new Set<string>();
    for (const t of tareas) {
      const done: string = String(t?.tareaCompletada || '');
      if (!done) continue;
      if (this.tareasHelper.esTest(done)) continue;
      const u = t?.usuarioId;
      const uid = typeof u === 'object' && u !== null ? String((u as any)?._id || '') : String(u || '');
      if (uid) users.add(uid);
    }
    return users.size;
  }
}
