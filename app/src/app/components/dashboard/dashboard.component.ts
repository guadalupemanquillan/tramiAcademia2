import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of, switchMap, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EmpresaService } from '../../core/services/empresa.service';
import { Empresa } from '../../core/models/empresa.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria.model';
import { TestService } from '../../core/services/test.service';
import { TestItem } from '../../core/models/test.model';
import { VideoService } from '../../core/services/video.service';
import { VideoItem } from '../../core/models/video.model';
import { ArticuloService } from '../../core/services/articulo.service';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { Tile } from '../../core/models/dashboard.model';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { TestsComponent } from '../tests/tests.component';
import { VideoComponent } from '../video/video.component';
import { CategoriasComponent } from '../categorias/categorias.component';
import { LogrosComponent } from '../logros/logros.component';
import { TareasComponent } from '../tareas/tareas.component';
import { TareasService } from '../../core/services/tareas.service';


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
  // referencias a helpers de hijos
  testsHelper = TestsComponent;
  videoHelper = VideoComponent;
  categoriasHelper = CategoriasComponent;
  logrosHelper = LogrosComponent;
  tareasHelper = TareasComponent;

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
    private tareasService: TareasService
  ) { }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const currentUrl = this.router.url.replace(/\/$/, '');
    if (currentUrl === '/dashboard') {
      const role = this.authService.role;
      const target = role === 'editor' ? '/dashboard/admin' : '/dashboard/usuario';
      this.router.navigate([target]);
      return;
    }
    const userId = this.authService.id;
    const isEditor = this.authService.role === 'editor';
    this.isEditorFlag = isEditor;

    if (isEditor) {
      // Admin: mantiene vista completa
      this.empresas$ = this.empresaService.getAll().pipe(catchError(() => of([] as Empresa[])));
      this.categorias$ = this.categoriaService.getAll(1, 50, '').pipe(
        map(r => r.items || []),
        catchError(() => of([] as Categoria[]))
      );
      this.tests$ = this.testService.getAll().pipe(catchError(() => of([] as TestItem[])));
      this.videos$ = this.videoService.getAll().pipe(catchError(() => of([] as VideoItem[])));
      this.logros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
      this.tareas$ = this.tareasService.getAll().pipe(catchError(() => of([])));
      this.users$ = this.userService.getAll().pipe(catchError(() => of([] as User[])));

      this.tiles = [
        { title: 'Tests', obs: this.tests$, link: '/admin/tests', color: 'success', valueProp: 'preguntas.length' },
        { title: 'Video', obs: this.videos$, link: '/admin/video', color: 'dark', valueProp: 'titulo' },
        { title: 'Empresas', obs: this.empresas$, link: '/admin/empresa', color: 'primary', valueProp: 'nombre' },
        { title: 'Categorías', obs: this.categorias$, link: '/admin/categoria', color: 'info', valueProp: 'nombre' },
        { title: 'Logros', obs: this.logros$, link: '/admin/logro', color: 'success', valueProp: 'nombre' },
        { title: 'Tareas', obs: this.tareas$, link: '/admin/tareas', color: 'warning', valueProp: 'tareaCompletada' }
      ];
    } else {
      // Usuario: logros y todo
      this.logros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
      // Cargar tests para KPIs del perfil
      this.tests$ = this.testService.getAll().pipe(catchError(() => of([] as TestItem[])));
      if (userId) {
        this.currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
      }
      // KPIs por usuario: tests pendientes
      this.testsPendientesCount$ = this.calcularTestsPendientes(userId || '');
      // KPIs por usuario: tareas completadas del sistema de tareas
      const tareasCompletadas$ = this.tareasService.getAll({ usuarioId: userId || '' }).pipe(
        catchError(() => of([] as any[]))
      );
      
      this.tareasCompletadasCount$ = tareasCompletadas$.pipe(
        map(tareas => {
          // Filtrar tareas que NO son tests usando la función helper
          const tareasSinTests = tareas.filter((tarea: any) => {
            return !TareasComponent.esTest(tarea?.tareaCompletada || '');
          });
          return tareasSinTests.length;
        })
      );
      
      // KPIs por usuario: tareas pendientes basadas en contenido requerido por categoría
      this.tareasPendientesCount$ = this.calcularTareasPendientes(userId || '');
      
      // Porcentaje basado en tareas completadas vs total de tareas disponibles
      this.tareasCompletadasPct$ = combineLatest([tareasCompletadas$, this.calcularTareasPendientes(userId || '')]).pipe(
        map(([completadas, pendientes]) => {
          // Filtrar tareas que NO son tests para el cálculo del porcentaje
          const tareasSinTests = completadas.filter((tarea: any) => {
            return !TareasComponent.esTest(tarea?.tareaCompletada || '');
          });
          
          const total = tareasSinTests.length + pendientes;
          if (!total) return 0;
          return (tareasSinTests.length / total) * 100;
        })
      );
      // En vista de usuario no mostramos tiles adicionales
      this.tiles = [];
    }
  }
  logout(): void {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
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
    
    // Si es un objeto poblado
    if (typeof user.empresaId === 'object' && user.empresaId?.nombre) {
      return user.empresaId.nombre;
    }
    
    // Si es solo un ID
    if (typeof user.empresaId === 'string') {
      return 'ID: ' + user.empresaId;
    }
    
    return '—';
  }

  private calcularTareasPendientes(userId: string): Observable<number> {
    if (!userId) return of(0);

    return this.userService.getOne(userId).pipe(
      switchMap((user: User) => {
        if (!user?.empresaId || typeof user.empresaId === 'string') {
          return of(0); // Sin empresa o solo ID, no hay tareas pendientes
        }

        const categoriasEmpresa = user.categoriasEmpresa || [];
        if (categoriasEmpresa.length === 0) {
          return of(0); // Sin categorías, no hay tareas pendientes
        }

        const categoriaIds = categoriasEmpresa.map(cat => cat._id).filter(id => id);

        return forkJoin({
          videos: this.videoService.getAll(),
          articulos: this.articuloService.getAll(),
          tareas: this.tareasService.getAll({ usuarioId: userId })
        }).pipe(
          map(({ videos, articulos, tareas }) => {
            const completadas = new Set<string>((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));

            // Filtrar videos y artículos que pertenezcan a las categorías de la empresa
            const vidsCat = (videos || []).filter((v: any) => {
              const videoCatId = typeof v.categoriaId === 'object' ? v.categoriaId?._id : v.categoriaId;
              return categoriaIds.includes(String(videoCatId || ''));
            });
            
            const artsCat = (articulos || []).filter((a: any) => {
              const artCatId = typeof a.categoriaId === 'object' ? a.categoriaId?._id : a.categoriaId;
              return categoriaIds.includes(String(artCatId || ''));
            });

            const requiredCodes: string[] = [];
            for (const v of vidsCat) requiredCodes.push(`Video visualizado: ${v.titulo}`);
            for (const a of artsCat) requiredCodes.push(`Articulo leído: ${a.titulo}`);

            const faltantes = requiredCodes.filter(code => !completadas.has(code));
            return faltantes.length;
          }),
          catchError(() => of(0))
        );
      }),
      catchError(() => of(0))
    );
  }

  getTestsActivosCount(tests: TestItem[]): number {
    if (!Array.isArray(tests)) return 0;
    return tests.filter(test => !test.isDeleted).length;
  }

  private calcularTestsPendientes(userId: string): Observable<number> {
    if (!userId) return of(0);

    return forkJoin({
      tests: this.testService.getAll(),
      tareas: this.tareasService.getAll({ usuarioId: userId })
    }).pipe(
      map(({ tests, tareas }) => {
        // Filtrar solo tests activos
        const testsActivos = tests.filter(test => !test.isDeleted);
        
        // Obtener tareas completadas del usuario
        const tareasCompletadas = new Set<string>((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));

        // Contar tests que no están completados
        let testsPendientes = 0;
        for (const test of testsActivos) {
          const testCompletado = `Test completado: ${test.nombre || 'Sin nombre'}`;
          const testNombreDirecto = test.nombre || 'Sin nombre';
          
          const encontradoCompletado = tareasCompletadas.has(testCompletado);
          const encontradoDirecto = tareasCompletadas.has(testNombreDirecto);
          
          if (!encontradoCompletado && !encontradoDirecto) {
            testsPendientes++;
          }
        }
        
        return testsPendientes;
      }),
      catchError(() => of(0))
    );
  }
}
