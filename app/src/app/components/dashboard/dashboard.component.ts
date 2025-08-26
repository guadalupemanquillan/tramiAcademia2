import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { EmpresaService } from '../../core/services/empresa.service';
import { Empresa } from '../../core/models/empresa.model';
import { CategoriaService } from '../../core/services/categoria.service';
import { Categoria } from '../../core/models/categoria.model';
import { TestService } from '../../core/services/test.service';
import { TestItem } from '../../core/models/test.model';
import { TodoService } from '../../core/services/todo.service';
import { TodoItem } from '../../core/models/todo.model';
import { VideoService } from '../../core/services/video.service';
import { VideoItem } from '../../core/models/video.model';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { Tile } from '../../core/models/dashboard.model';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';
import { TestsComponent } from '../tests/tests.component';
import { VideoComponent } from '../video/video.component';
import { CategoriasComponent } from '../categorias/categorias.component';
import { LogrosComponent } from '../logros/logros.component';


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
  todos$: Observable<TodoItem[]> = of([]);
  videos$: Observable<VideoItem[]> = of([]);
  logros$: Observable<Logros[]> = of([]);
  users$: Observable<User[]> = of([]);
  currentUser$: Observable<User | null> = of(null);
  isEditorFlag = false;
  tareasCompletadasPct$: Observable<number> = of(0);
  contenidoPendiente$: Observable<number> = of(0);
  contenidoPendientePct$: Observable<number> = of(0);

  tiles: Tile[] = [];
  // referencias a helpers de hijos
  testsHelper = TestsComponent;
  videoHelper = VideoComponent;
  categoriasHelper = CategoriasComponent;
  logrosHelper = LogrosComponent;

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private empresaService: EmpresaService,
    private categoriaService: CategoriaService,
    private testService: TestService,
    private todoService: TodoService,
    private videoService: VideoService,
    private logrosService: LogrosService,
    private userService: UserService
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
      this.todos$ = this.todoService.getAll().pipe(catchError(() => of([] as TodoItem[])));
      this.videos$ = this.videoService.getAll().pipe(catchError(() => of([] as VideoItem[])));
      this.logros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
      this.users$ = this.userService.getAll().pipe(catchError(() => of([] as User[])));

      this.tiles = [
        { title: 'Tests', obs: this.tests$, link: '/admin/tests', color: 'success', valueProp: 'preguntas.length' },
        { title: 'Video', obs: this.videos$, link: '/admin/video', color: 'dark', valueProp: 'titulo' },
        { title: 'Empresas', obs: this.empresas$, link: '/admin/empresa', color: 'primary', valueProp: 'nombre' },
        { title: 'Categorías', obs: this.categorias$, link: '/admin/categoria', color: 'info', valueProp: 'nombre' },
        { title: 'Logros', obs: this.logros$, link: '/admin/logro', color: 'success', valueProp: 'nombre' }
      ];
    } else {
      // Usuario: logros y todo
      this.todos$ = this.todoService.getAll().pipe(catchError(() => of([] as TodoItem[])));
      this.logros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
      if (userId) {
        this.currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
      }
      // KPIs por usuario: tareas y contenido pendiente
      const tareasUsuario$ = this.userService.getChecklist(userId || null).pipe(catchError(() => of([] as any[])));
      const completasUsuario$ = this.userService.getCompletedCodes(userId || null).pipe(catchError(() => of(new Set<string>())));
      this.tareasCompletadasPct$ = combineLatest([tareasUsuario$, completasUsuario$]).pipe(
        map(([all, done]) => {
          const total = Array.isArray(all) ? all.length : 0;
          if (!total) return 0;
          const completed = all.filter((i: any) => done.has(String(i?.code || ''))).length;
          return (completed / total) * 100;
        })
      );
      const videos$ = this.videoService.getAll().pipe(catchError(() => of([])));
      const articulos$ = of([] as any[]); // Implementar servicio si se desea contar artículos
      this.contenidoPendiente$ = combineLatest([videos$, articulos$, completasUsuario$]).pipe(
        map(([videos, arts, done]) => {
          const all = [...(videos || []).map((v: any) => `video:${v?._id || ''}`), ...(arts || []).map((a: any) => `articulo:${a?._id || ''}`)];
          return all.filter(code => !done.has(String(code))).length;
        })
      );
      this.contenidoPendientePct$ = combineLatest([videos$, articulos$, this.contenidoPendiente$]).pipe(
        map(([videos, arts, pend]) => {
          const total = (Array.isArray(videos) ? videos.length : 0) + (Array.isArray(arts) ? arts.length : 0);
          if (!total) return 0;
          return ((pend as number) / total) * 100;
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
}
