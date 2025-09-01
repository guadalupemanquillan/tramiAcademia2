import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, combineLatest } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { EmpresaService } from './empresa.service';
import { CategoriaService } from './categoria.service';
import { TestService } from './test.service';
import { VideoService } from './video.service';
import { ArticuloService } from './articulo.service';
import { LogrosService } from './logros.service';
import { UserService } from './user.service';
import { TareasService } from './tareas.service';
import { Empresa } from '../models/empresa.model';
import { Categoria } from '../models/categoria.model';
import { TestItem } from '../models/test.model';
import { VideoItem } from '../models/video.model';
import { Logros } from '../models/logros.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  constructor(
    private empresaService: EmpresaService,
    private categoriaService: CategoriaService,
    private testService: TestService,
    private videoService: VideoService,
    private articuloService: ArticuloService,
    private logrosService: LogrosService,
    private userService: UserService,
    private tareasService: TareasService
  ) {}
  getAdminData() {
    return forkJoin({
      empresas: this.empresaService.getAll().pipe(catchError(() => of([]))),
      categorias: this.categoriaService.getAll(1, 50, '').pipe(map(r => r.items || []), catchError(() => of([]))),
      tests: this.testService.getAll().pipe(catchError(() => of([]))),
      videos: this.videoService.getAll().pipe(catchError(() => of([]))),
      logros: this.logrosService.getAll().pipe(catchError(() => of([]))),
      tareas: this.tareasService.getAll().pipe(catchError(() => of([]))),
      users: this.userService.getAll().pipe(catchError(() => of([]))),
    });
  }
  getUserData(userId: string) {
    const currentUser$ = this.userService.getOne(userId).pipe(catchError(() => of(null)));
    const tests$ = this.testService.getAll().pipe(catchError(() => of([])));
    const logros$ = this.logrosService.getAll().pipe(catchError(() => of([])));
    const tareas$ = this.tareasService.getAll({ usuarioId: userId }).pipe(catchError(() => of([])));

    const tareasCompletadasCount$ = tareas$.pipe(
      map(tareas => tareas.filter(t => t.tareaCompletada).length)
    );

    const tareasPendientesCount$ = this.calcularTareasPendientes(userId);
    const testsPendientesCount$ = this.calcularTestsPendientes(userId);

    const tareasCompletadasPct$ = combineLatest([tareasCompletadasCount$, tareasPendientesCount$]).pipe(
      map(([completadas, pendientes]) => (completadas + pendientes ? (completadas / (completadas + pendientes)) * 100 : 0))
    );

    return {
      currentUser$,
      tests$,
      logros$,
      tareas$,
      tareasCompletadasCount$,
      tareasPendientesCount$,
      testsPendientesCount$,
      tareasCompletadasPct$
    };
  }
  private calcularTareasPendientes(userId: string): Observable<number> {
    if (!userId) return of(0);
    return this.userService.getOne(userId).pipe(
      switchMap(user => {
        const categoriasEmpresa = (user?.categoriasEmpresa || []).map(c => c._id).filter(Boolean);
        if (!categoriasEmpresa.length) return of(0);
        return forkJoin({
          videos: this.videoService.getAll(),
          articulos: this.articuloService.getAll(),
          tareas: this.tareasService.getAll({ usuarioId: userId })
        }).pipe(
          map(({ videos, articulos, tareas }) => {
            const completadas = new Set((tareas || []).map(x => String(x?.tareaCompletada || '')));
            const required = [
              ...videos.filter(v => {
                const catId = typeof v.categoriaId === 'object' && v.categoriaId !== null ? (v.categoriaId as any)._id : v.categoriaId;
                return categoriasEmpresa.includes(catId);
              }).map(v => `Video visualizado: ${v.titulo}`),
              ...articulos.filter(a => {
                const catId = typeof a.categoriaId === 'object' && a.categoriaId !== null ? (a.categoriaId as any)._id : a.categoriaId;
                return categoriasEmpresa.includes(catId);
              }).map(a => `Articulo leído: ${a.titulo}`)
            ];
            return required.filter(code => !completadas.has(code)).length;
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
      map(({ tests, tareas }) => {
        const completadas = new Set((tareas || []).map(x => String(x?.tareaCompletada || '')));
        return tests.filter(test => !test.isDeleted && !completadas.has(`Test completado: ${test.nombre || 'Sin nombre'}`) && !completadas.has(test.nombre || '')).length;
      }),
      catchError(() => of(0))
    );
  }

}
