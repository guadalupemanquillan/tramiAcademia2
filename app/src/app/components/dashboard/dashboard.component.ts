import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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
    this.empresas$ = this.empresaService.getAll().pipe(catchError(() => of([] as Empresa[])));
    this.categorias$ = this.categoriaService.getAll(1, 50, '').pipe(
      map(r => r.items || []),
      catchError(() => of([] as Categoria[]))
    );
    const allTests$ = this.testService.getAll().pipe(catchError(() => of([] as TestItem[])));
    const allTodos$ = this.todoService.getAll().pipe(catchError(() => of([] as TodoItem[])));
    const allVideos$ = this.videoService.getAll().pipe(catchError(() => of([] as VideoItem[])));
    const allLogros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
    const allUsers$ = this.userService.getAll().pipe(catchError(() => of([] as User[])));

    const userId = this.authService.id;
    const isEditor = this.authService.role === 'editor';
    this.isEditorFlag = isEditor;

    this.tests$ = allTests$;
    this.todos$ = allTodos$;
    this.videos$ = allVideos$;
    this.logros$ = allLogros$;
    this.users$ = allUsers$;
    if (!isEditor && userId) {
      this.currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
    }
    // Definir tiles y filtrar nulls
    this.tiles = [
      !isEditor ? { title: 'Usuario', obs: this.currentUser$.pipe(map(u => u ? [u] : []), catchError(() => of([] as any[]))), link: null, color: 'secondary', valueProp: 'nombre' } : null,
      { title: 'Tests', obs: this.tests$, link: isEditor ? '/admin/tests' : '/usuario/test', color: 'success', valueProp: 'preguntas.length' },
      { title: 'Video', obs: this.videos$, link: isEditor ? '/admin/video' : '/usuario/video', color: 'dark', valueProp: 'titulo' },
      isEditor ? { title: 'Empresas', obs: this.empresas$, link: '/admin/empresa', color: 'primary', valueProp: 'nombre' } : null,
      isEditor ? { title: 'Categorías', obs: this.categorias$, link: '/admin/categoria', color: 'info', valueProp: 'nombre' } : null,
      { title: 'Logros', obs: this.logros$, link: isEditor ? '/admin/logro' : '/usuario/logro', color: 'success', valueProp: 'nombre' },
      isEditor ? null : { title: 'Todo', obs: this.todos$, link: '/usuario/todo', color: 'secondary', valueProp: 'titulo' }
    ].filter(t => t !== null) as Tile[];
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
