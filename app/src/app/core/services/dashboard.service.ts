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
  // Wrappers públicos para reutilizar en componentes
  tareasPendientesCount$(userId: string) { return this.calcularTareasPendientes(userId); }
  testsPendientesCount$(userId: string) { return this.calcularTestsPendientes(userId); }
  // Helpers de agregación/fecha reutilizables
  getLatestDate(items: any[]): Date | null {
    if (!Array.isArray(items) || !items.length) return null;
    let latest = 0;
    for (const it of items) {
      const candidates: Array<string | Date | undefined> = [
        it?.updatedAt,
        it?.createdAt,
        Array.isArray(it?.historialEdiciones) && it.historialEdiciones.length
          ? it.historialEdiciones[it.historialEdiciones.length - 1]?.fechaEdicion
          : undefined,
      ];
      for (const c of candidates) {
        const ts = c ? new Date(c as any).getTime() : 0;
        if (!Number.isNaN(ts)) latest = Math.max(latest, ts);
      }
    }
    return latest ? new Date(latest) : null;
  }

  getRelativeTimeFromNow(date: Date): string {
    const diffMs = Date.now() - date.getTime();
    const sec = Math.round(diffMs / 1000);
    const min = Math.round(sec / 60);
    const hr = Math.round(min / 60);
    const day = Math.round(hr / 24);
    if (sec < 60) return `hace ${sec} segundo${sec !== 1 ? 's' : ''}`;
    if (min < 60) return `hace ${min} minuto${min !== 1 ? 's' : ''}`;
    if (hr < 24) return `hace ${hr} hora${hr !== 1 ? 's' : ''}`;
    if (day < 30) return `hace ${day} día${day !== 1 ? 's' : ''}`;
    const months = Math.round(day / 30);
    if (months < 12) return `hace ${months} mes${months !== 1 ? 'es' : ''}`;
    const years = Math.round(months / 12);
    return `hace ${years} año${years !== 1 ? 's' : ''}`;
  }

  private getEmpresaNombreByCategoriaId(catRef: any, categorias: Categoria[], empresas: Empresa[]): string {
    const catId = typeof catRef === 'object' && catRef !== null ? String((catRef as any)?._id || '') : String(catRef || '');
    if (!catId) return '';
    const categoria = (categorias || []).find((c: any) => String(c?._id || '') === catId);
    const empresaId = typeof (categoria as any)?.empresaId === 'object' && (categoria as any)?.empresaId !== null
      ? String(((categoria as any).empresaId as any)?._id || '')
      : String((categoria as any)?.empresaId || '');
    if (!empresaId) return '';
    const empresa = (empresas || []).find((e: any) => String(e?._id || '') === empresaId);
    return (empresa as any)?.nombre || '';
  }

  getResumenPorEmpresa(items: any[], categorias: Categoria[], empresas: Empresa[], etiqueta: string): string {
    if (!Array.isArray(items) || !items.length) return `${etiqueta}: 0`;
    const conteo = new Map<string, number>();
    for (const it of items) {
      const empresaNombre = this.getEmpresaNombreByCategoriaId(it?.categoriaId, categorias, empresas);
      if (!empresaNombre) continue;
      conteo.set(empresaNombre, (conteo.get(empresaNombre) || 0) + 1);
    }
    if (!conteo.size) return `${etiqueta}: 0`;
    return Array.from(conteo.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([nombre, n]) => `${nombre}: ${n}`)
      .join(' · ');
  }

  getEmpresaBreakdownList(items: any[], categorias: Categoria[], empresas: Empresa[]): string[] {
    const nombres = (empresas || []).map((e: any) => String(e?.nombre || '')).filter(Boolean);
    if (!nombres.length) return [];
    const counts = new Map<string, number>();
    for (const name of nombres) counts.set(name, 0);
    const arr = Array.isArray(items) ? items : [];
    for (const it of arr) {
      const name = this.getEmpresaNombreByCategoriaId(it?.categoriaId, categorias, empresas);
      if (!name) continue;
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, n]) => `${name}: ${n}`);
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
