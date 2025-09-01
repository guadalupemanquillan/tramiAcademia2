import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of, combineLatest, forkJoin } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EmpresaService } from '../../core/services/empresa.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { TestService } from '../../core/services/test.service';
import { VideoService } from '../../core/services/video.service';
import { ArticuloService } from '../../core/services/articulo.service';
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
  logros$: Observable<Logros[]> = of([]);
  tareas$: Observable<any[]> = of([]);
  users$: Observable<User[]> = of([]);
  currentUser$: Observable<User | null> = of(null);

  isEditorFlag = false;

  tareasCompletadasPct$: Observable<number> = of(0);
  tareasCompletadasCount$: Observable<number> = of(0);
  tareasPendientesCount$: Observable<number> = of(0);
  testsPendientesCount$: Observable<number> = of(0);

  tiles: Tile[] = [];
  testsHelper = {
    getCompletedCount: (tests: TestItem[]) => tests?.filter((t: any) => !t.isDeleted).length || 0
  };

  tareasHelper = {
    esTest: (value: any) => typeof value === 'string' && value.includes('Test')
  };

  logrosHelper = {
    getUserLogrosCount: (user: User, logros: Logros[]) => {
      if (!user?._id || !logros?.length) return 0;
      
      const uid = String(user._id);
      const userLogros = logros.filter(l => {
        const logroUserId = typeof l.usuarioId === 'string' 
          ? l.usuarioId 
          : (l.usuarioId as any)?._id;
        
        return String(logroUserId || '') === uid;
      });
      
      return userLogros.length;
    },
  
    getDashboardLogrosCount: (logros: Logros[]) => {
      if (!logros?.length) return 0;
      return logros.length;
    }
  };

  videoHelper = {
    filterVideosForUser: (videos: VideoItem[], user: User) => videos?.filter((v: any) => v.usuarioId === user?._id) || []
  };

  categoriasHelper = {
    getParentCount: (categorias: Categoria[]) => categorias?.filter((c: any) => !!c.categoriaPadre).length || 0
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
    private logrosService: LogrosService,
    private userService: UserService,
    private tareasService: TareasService,
    private dashboardService: DashboardService
  ) {}

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

  getTileValue(tile: Tile, item: any): string {
    switch (tile.valueProp) {
      case 'nombre': return item.nombre || 'Sin título';
      case 'preguntas.length': return `${(item.preguntas || []).length} preguntas`;
      case 'titulo': return item.titulo || 'Sin título';
      default: return 'Sin título';
    }
  }

  getEmpresaNombre(user: User): string {
    if (!user?.empresaId) return '—';
    if (typeof user.empresaId === 'object' && user.empresaId.nombre) return user.empresaId.nombre;
    if (typeof user.empresaId === 'string') return 'ID: ' + user.empresaId;
    return '—';
  }

  private loadAdminData(): void {
    this.empresas$ = this.empresaService.getAll().pipe(catchError(() => of([])));
    this.categorias$ = this.categoriaService.getAll(1, 50, '').pipe(map((r: any) => r.items || []), catchError(() => of([])));
    this.tests$ = this.testService.getAll().pipe(catchError(() => of([])));
    this.videos$ = this.videoService.getAll().pipe(catchError(() => of([])));
    this.logros$ = this.logrosService.getAll().pipe(catchError(() => of([])));
    this.tareas$ = this.tareasService.getAll().pipe(catchError(() => of([])));
    this.users$ = this.userService.getAll().pipe(catchError(() => of([])));

    this.tiles = [
      { title: 'Tests', obs: this.tests$, link: '/admin/tests', color: 'success', valueProp: 'preguntas.length' },
      { title: 'Video', obs: this.videos$, link: '/admin/video', color: 'dark', valueProp: 'titulo' },
      { title: 'Empresas', obs: this.empresas$, link: '/admin/empresa', color: 'primary', valueProp: 'nombre' },
      { title: 'Categorías', obs: this.categorias$, link: '/admin/categoria', color: 'info', valueProp: 'nombre' },
      { title: 'Logros', obs: this.logros$, link: '/admin/logro', color: 'success', valueProp: 'nombre' },
      { title: 'Tareas', obs: this.tareas$, link: '/admin/tareas', color: 'warning', valueProp: 'tareaCompletada' }
    ];
  }

  private loadUserData(userId: string): void {
    this.currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
    this.tests$ = this.testService.getAll().pipe(catchError(() => of([])));
    
    // Filtrar logros para mostrar solo los del usuario actual
    this.logros$ = this.logrosService.getAll().pipe(
      map((logros: Logros[]) => {
        const uid = String(userId);
        let userLogros = (logros || []).filter(l => {
          const logroUserId = typeof l.usuarioId === 'string'
            ? l.usuarioId
            : (l.usuarioId as any)?._id;
          return String(logroUserId || '') === uid;
        });

        // Si no tiene logros ganados, no mostrar ninguno (no mostrar disponibles)
        return userLogros;
      }),
      catchError(() => of([]))
    );

    const tareas$ = this.tareasService.getAll({ usuarioId: userId }).pipe(catchError(() => of([])));
    this.tareasCompletadasCount$ = tareas$.pipe(map((tareas: any) => tareas.filter((t: any) => !this.tareasHelper.esTest(t.tareaCompletada || '')).length));
    this.tareasPendientesCount$ = this.calcularTareasPendientes(userId);
    this.testsPendientesCount$ = this.calcularTestsPendientes(userId);

    this.tareasCompletadasPct$ = combineLatest([this.tareasCompletadasCount$, this.tareasPendientesCount$]).pipe(
      map(([completadas, pendientes]: [number, number]) => (completadas + pendientes ? (completadas / (completadas + pendientes)) * 100 : 0))
    );

    this.tiles = [];
  }

  getTestsActivosCount(tests: TestItem[]): number {
    return Array.isArray(tests) ? tests.filter(t => !t.isDeleted).length : 0;
  }

  getTareasCompletadasCount(tareas: any[]): number {
    return Array.isArray(tareas) ? tareas.filter(t => t.tareaCompletada).length : 0;
  }

  // Método de debug para logros
  debugLogros(user: User, logros: Logros[]): string {
    if (!user?._id || !logros?.length) return 'No hay datos';
    
    const uid = String(user._id);
    const userLogros = logros.filter(l => {
      const logroUserId = typeof l.usuarioId === 'string' 
        ? l.usuarioId 
        : (l.usuarioId as any)?._id;
      
      return String(logroUserId || '') === uid || 
             (Array.isArray((this as any)?.authService?.logros) && 
              (this as any).authService.logros.includes(String((l as any)?._id || '')));
    });
    
    // Debug más detallado
    const logroIds = logros.map(l => {
      const logroUserId = typeof l.usuarioId === 'string' 
        ? l.usuarioId 
        : (l.usuarioId as any)?._id;
      return logroUserId;
    }).join(', ');
    
    return `Usuario ID: ${user._id}, Logros encontrados: ${userLogros.length}, Total logros: ${logros.length}, IDs en logros: [${logroIds}]`;
  }

  private calcularTareasPendientes(userId: string): Observable<number> {
    if (!userId) return of(0);
    return this.userService.getOne(userId).pipe(
      switchMap((user: any) => {
        const categoriasEmpresa = (user?.categoriasEmpresa || []).map((c: any) => c._id).filter(Boolean);
        if (!categoriasEmpresa.length) return of(0);

        return forkJoin({
          videos: this.videoService.getAll(),
          articulos: this.articuloService.getAll(),
          tareas: this.tareasService.getAll({ usuarioId: userId })
        }).pipe(
          map(({ videos, articulos, tareas }: any) => {
            const completadas = new Set((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));
            const required = [
              ...videos.filter((v: any) => {
                const catId = typeof v.categoriaId === 'object' && v.categoriaId !== null ? (v.categoriaId as any)._id : v.categoriaId;
                return categoriasEmpresa.includes(catId);
              }).map((v: any) => `Video visualizado: ${v.titulo}`),
              ...articulos.filter((a: any) => {
                const catId = typeof a.categoriaId === 'object' && a.categoriaId !== null ? (a.categoriaId as any)._id : a.categoriaId;
                return categoriasEmpresa.includes(catId);
              }).map((a: any) => `Articulo leído: ${a.titulo}`)
            ];
            return required.filter((code: string) => !completadas.has(code)).length;
          }),
          catchError(() => of(0))
        );
      }),
      catchError(() => of(0))
    );
  }

  private calcularTestsPendientes(userId: string): Observable<number> {
    if (!userId) return of(0);
    return forkJoin({ tests: this.testService.getAll(), tareas: this.tareasService.getAll({ usuarioId: userId }) }).pipe(
      map(({ tests, tareas }: any) => {
        const completadas = new Set((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));
        return tests.filter((test: any) => !test.isDeleted && !completadas.has(`Test completado: ${test.nombre || 'Sin nombre'}`) && !completadas.has(test.nombre || '')).length;
      }),
      catchError(() => of(0))
    );
  }
}

