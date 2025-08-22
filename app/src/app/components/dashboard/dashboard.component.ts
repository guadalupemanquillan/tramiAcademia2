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
import { TareasService } from '../../core/services/tareas.service';
import { Tarea, UsuarioRef } from '../../core/models/tareas.model';
import { TodoService } from '../../core/services/todo.service';
import { TodoItem } from '../../core/models/todo.model';
import { VideoService } from '../../core/services/video.service';
import { VideoItem } from '../../core/models/video.model';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { Tile } from '../../core/models/dashboard.model';
import { User } from '../../core/models/user.model';
import { UserService } from '../../core/services/user.service';


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
  tareas$: Observable<Tarea[]> = of([]);
  todos$: Observable<TodoItem[]> = of([]);
  videos$: Observable<VideoItem[]> = of([]);
  logros$: Observable<Logros[]> = of([]);
  users$: Observable<User[]> = of([]);
  currentUser$: Observable<User | null> = of(null);
  isEditorFlag = false;

  tiles: Tile[] = [];

  constructor(
    public authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private empresaService: EmpresaService,
    private categoriaService: CategoriaService,
    private testService: TestService,
    private tareasService: TareasService,
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
    const allTareas$ = this.tareasService.getAll().pipe(catchError(() => of([] as Tarea[])));
    const allTodos$ = this.todoService.getAll().pipe(catchError(() => of([] as TodoItem[])));
    const allVideos$ = this.videoService.getAll().pipe(catchError(() => of([] as VideoItem[])));
    const allLogros$ = this.logrosService.getAll().pipe(catchError(() => of([] as Logros[])));
    const allUsers$ = this.userService.getAll().pipe(catchError(() => of([] as User[])));

    const userId = this.authService.id;
    const isEditor = this.authService.role === 'editor';
    this.isEditorFlag = isEditor;

    this.tests$ = allTests$;
    this.tareas$ = isEditor || !userId
      ? allTareas$
      : allTareas$.pipe(map(arr => arr.filter(t => String((t.usuarioId as any)?._id || t.usuarioId) === userId)));
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
      null,
      isEditor ? null : { title: 'Todo', obs: this.todos$, link: '/usuario/todo', color: 'secondary', valueProp: 'titulo' }
    ].filter(t => t !== null) as Tile[];
  }

  // Helpers for Categoria summaries
  getLastParentName(categories: any[] | null | undefined): string {
    if (!Array.isArray(categories) || categories.length === 0) return '';
    for (let i = categories.length - 1; i >= 0; i--) {
      const c = categories[i];
      if (!c?.categoriaPadre) return c?.nombre || '';
    }
    return '';
  }

  getLastChangeDate(categories: any[] | null | undefined): string {
    if (!Array.isArray(categories) || categories.length === 0) return '';
    for (let i = categories.length - 1; i >= 0; i--) {
      const c = categories[i] as any;
      const date = c?.updatedAt || c?.createdAt;
      if (date) {
        try { return new Date(date).toLocaleDateString(); } catch { return String(date); }
      }
    }
    return '';
  }

  getParentCount(categories: any[] | null | undefined): number {
    if (!Array.isArray(categories) || categories.length === 0) return 0;
    return categories.filter(c => !c?.categoriaPadre).length;
  }

  getTotalQuestions(tests: any[] | null | undefined): number {
    if (!Array.isArray(tests) || tests.length === 0) return 0;
    return tests.reduce((sum, t) => sum + ((t?.preguntas ?? []).length), 0);
  }

  getTestDonutStyles(tests: any[] | null | undefined): {[k:string]: string} {
    const total = Array.isArray(tests) ? tests.length : 0;
    if (!total) return { background: 'conic-gradient(var(--bs-secondary) 0 360deg)' };
    // Completado si tiene al menos un logro asociado
    const completed = tests!.filter(t => (t?.logros ?? []).length > 0).length;
    const pending = total - completed;
    const pctCompleted = (completed / total) * 360;
    return {
      background: `conic-gradient(#15297c 0 ${pctCompleted}deg, var(--bs-primary) ${pctCompleted}deg 360deg)`
    };
  }

  getCompletedPercent(tests: any[] | null | undefined): number {
    if (!Array.isArray(tests) || tests.length === 0) return 0;
    const completed = tests.filter(t => (t?.logros ?? []).length > 0).length;
    return (completed / tests.length) * 100;
  }

  getUserCompletedTestsCount(user: User | null | undefined): number {
    return Array.isArray(user?.logros) ? user!.logros!.length : 0;
  }

  getUserPendingTestsCount(tests: TestItem[] | null | undefined, user: User | null | undefined): number {
    const total = Array.isArray(tests) ? tests.length : 0;
    const done = this.getUserCompletedTestsCount(user);
    return Math.max(0, total - done);
  }

  getCompletedPercentForUser(tests: TestItem[] | null | undefined, user: User | null | undefined): number {
    const total = Array.isArray(tests) ? tests.length : 0;
    if (!total) return 0;
    const done = this.getUserCompletedTestsCount(user);
    return (done / total) * 100;
  }

  getTestDonutStylesForUser(tests: TestItem[] | null | undefined, user: User | null | undefined): { [k: string]: string } {
    const total = Array.isArray(tests) ? tests.length : 0;
    if (!total) return { background: 'conic-gradient(var(--bs-secondary) 0 360deg)' };
    const pctCompleted = (this.getUserCompletedTestsCount(user) / total) * 360;
    return { background: `conic-gradient(#15297c 0 ${pctCompleted}deg, var(--bs-primary) ${pctCompleted}deg 360deg)` };
  }

  // ------- Logros helpers -------
  countActiveLogros(items: any[] | null | undefined): number {
    if (!Array.isArray(items)) return 0;
    return items.filter(l => l?.activo === true || l?.isActive === true || l?.estado === 'activo').length;
  }

  getUserLogrosCount(user: User | null | undefined, allLogros: Logros[] | null | undefined): number {
    if (user && Array.isArray(user.logros)) return user.logros.length;
    if (!user || !Array.isArray(allLogros)) return 0;
    return allLogros.filter((l: any) => String(l?.usuarioId) === String(user._id)).length;
  }

  countInactiveLogros(items: any[] | null | undefined): number {
    if (!Array.isArray(items)) return 0;
    return items.filter(l => l?.activo === false || l?.isActive === false || l?.estado === 'inactivo').length;
  }

  getPendingTasksCount(tareas: Tarea[] | null | undefined): number {
    if (!Array.isArray(tareas)) return 0;
    return tareas.filter(t => !t?.completada).length;
  }

  filterVideosForUser(videos: VideoItem[] | null | undefined, user: User | null | undefined): VideoItem[] {
    if (!Array.isArray(videos)) return [];
    const categoriaId = (user as any)?.categoriaId || null;
    if (!categoriaId) return videos;
    return videos.filter(v => String((v as any)?.categoriaId || '') === String(categoriaId));
  }

  getRecentLogrosNames(items: any[] | null | undefined, limit: number = 3): string[] {
    if (!Array.isArray(items) || items.length === 0) return [];
    const sorted = items.slice().sort((a, b) => {
      const aDate = new Date(a?.createdAt || a?.updatedAt || 0).getTime();
      const bDate = new Date(b?.createdAt || b?.updatedAt || 0).getTime();
      return bDate - aDate;
    });
    return sorted.slice(0, limit).map(x => x?.nombre || x?.titulo || '—');
  }

  getMostRecentLogroName(items: any[] | null | undefined): string {
    if (!Array.isArray(items) || items.length === 0) return '';
    let latest = items[0];
    let latestTime = new Date(latest?.createdAt || latest?.updatedAt || 0).getTime();
    for (let i = 1; i < items.length; i++) {
      const t = new Date(items[i]?.createdAt || items[i]?.updatedAt || 0).getTime();
      if (t > latestTime) {
        latest = items[i];
        latestTime = t;
      }
    }
    return latest?.nombre || latest?.titulo || '';
  }

  getMostRecentLogroDisplay(logros: Logros[] | null | undefined, users: User[] | null | undefined): string {
    if (!Array.isArray(logros) || logros.length === 0) return '';
    let latest = logros[0] as any;
    let latestTime = new Date(latest?.createdAt || latest?.updatedAt || 0).getTime();
    for (let i = 1; i < logros.length; i++) {
      const t = new Date((logros[i] as any)?.createdAt || (logros[i] as any)?.updatedAt || 0).getTime();
      if (t > latestTime) {
        latest = logros[i];
        latestTime = t;
      }
    }
    const logroName = latest?.nombre || latest?.titulo || '';
    if (!Array.isArray(users) || users.length === 0) return logroName;
    const latestId = String(latest?._id || '');
    const targetUser = users.find(u => (u?.logros || []).some(id => String(id) === latestId) || String(u?._id) === String((latest as any)?.usuarioId));
    const userName = targetUser?.nombreCompleto || targetUser?.nombre || '';
    return userName ? `${logroName} — ${userName}` : logroName;
  }

  getTopUserByLogros(users: User[] | null | undefined): { name: string; count: number } | null {
    if (!Array.isArray(users) || users.length === 0) return null;
    let best: { name: string; count: number } | null = null;
    for (const u of users) {
      const count = (u?.logros || []).length;
      const name = u?.nombreCompleto || u?.nombre || 'Usuario';
      if (!best || count > best.count) best = { name, count };
    }
    return best;
  }

  getTopAssignedLogrosSummary(logros: Logros[] | null | undefined, users: User[] | null | undefined, limit: number = 3): string {
    if (!Array.isArray(logros) || !Array.isArray(users) || logros.length === 0 || users.length === 0) return '';
    const idToName = new Map<string, string>();
    for (const l of logros) {
      if (l?._id) idToName.set(l._id, l.nombre || '—');
    }
    const counts = new Map<string, number>();
    for (const u of users) {
      for (const lid of (u?.logros || [])) {
        counts.set(String(lid), (counts.get(String(lid)) || 0) + 1);
      }
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, cnt]) => `${idToName.get(id) || '—'} (${cnt})`);
    return top.join(', ');
  }

  logout(): void {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }

  idx = (i: number) => i;

  displayUsuario(usuarioId: string | UsuarioRef): string {
    if (usuarioId && typeof usuarioId === 'object' && (usuarioId as UsuarioRef).nombre) {
      return String((usuarioId as UsuarioRef).nombre);
    }
    return String(usuarioId ?? '');
  }

  getTileValue(tile: Tile, item: any): string {
    switch (tile.valueProp) {
      case 'nombre': return item.nombre || 'Sin título';
      case 'preguntas.length': return `${(item.preguntas || []).length} preguntas`;
      case 'usuarioId': return this.displayUsuario(item.usuarioId);
      case 'titulo': return item.titulo || 'Sin título';
      default: return 'Sin título';
    }
  }
}
