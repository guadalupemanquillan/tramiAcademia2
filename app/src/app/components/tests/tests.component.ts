import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TestService } from '../../core/services/test.service';
import { TestItem } from '../../core/models/test.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { TareasService } from '../../core/services/tareas.service';
import { forkJoin } from 'rxjs';
import { VideoService } from '../../core/services/video.service';
import { ArticuloService } from '../../core/services/articulo.service';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TestsComponent implements OnInit {
  // Método estático para el Dashboard
  static getCompletedCount(tests: TestItem[]): number {
    if (!Array.isArray(tests)) return 0;
    return tests.filter(test => !test.isDeleted).length;
  }
  tests: TestItem[] = [];
  testsPendientes: TestItem[] = [];
  testsRealizados: TestItem[] = [];

  nuevoTest: TestItem = { nombre: '', preguntas: [{ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' }], logros: [], isDeleted: false };
  testEditar: Partial<TestItem> | null = null;
  loading: boolean = true;

  selectedLogros: { nombre: string; iconoUrl: string; _id?: string }[] = [];
  nuevoLogro: { nombre: string; iconoUrl: string } = { nombre: '', iconoUrl: '' };
  mostrarFormularioLogro: boolean = false;
  numPreguntas: number = 1;

  testAResponder: TestItem | null = null;
  respuestasUsuario: string[] = [];

  constructor(
    private testService: TestService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    public authService: AuthService,
    private userService: UserService,
    private tareasService: TareasService,
    private videoService: VideoService,
    private articuloService: ArticuloService
  ) { }



  ngOnInit(): void {
    this.cargarTests();
    this.numPreguntas = this.nuevoTest.preguntas.length;
    this.testService.changes$.subscribe(() => this.cargarTests());
  }

  cargarTests(): void {
    this.loading = true;
    if (this.authService.role === 'editor') {
      this.testService.getAll().subscribe({
        next: tests => {
          this.tests = tests.filter(test => !test.isDeleted);
          this.recalcularListasUsuario();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => this.loading = false
      });
    } else {
      this.testService.getAll().subscribe({
        next: tests => {
          this.tests = tests.filter(test => !test.isDeleted);
          this.recalcularListasUsuario();
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => this.loading = false
      });
    }
  }

  trackPregunta(index: number) { return index; }
  trackOpcion(index: number) { return index; }
  agregarPregunta(enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    test?.preguntas?.push({ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' });
    this.numPreguntas = Math.max(1, (test?.preguntas?.length ?? 0));
  }

  agregarOpcion(indexPregunta: number, enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    test?.preguntas?.[indexPregunta]?.opcionesRespuesta.push('');
  }

  eliminarPregunta(indexPregunta: number, enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    if (!test?.preguntas) return;
    if (test.preguntas.length <= 1) return; // mantener al menos una
    test.preguntas.splice(indexPregunta, 1);
    if (!enEdicion) this.numPreguntas = test.preguntas.length;
  }

  eliminarOpcion(indexPregunta: number, indexOpcion: number, enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    const opciones = test?.preguntas?.[indexPregunta]?.opcionesRespuesta;
    if (!opciones) return;
    if (opciones.length <= 1) return; // al menos una opción
    opciones.splice(indexOpcion, 1);
  }

  actualizarNumeroPreguntas(): void {
    const n = Math.max(1, Math.floor(this.numPreguntas || 1));
    this.numPreguntas = n;
    const actual = this.nuevoTest.preguntas.length;
    if (n > actual) for (let i = actual; i < n; i++) this.agregarPregunta(false);
    else if (n < actual) this.nuevoTest.preguntas.splice(n);
  }

  crearTest(): void {
    const payload: TestItem = {
      nombre: this.nuevoTest.nombre,
      preguntas: this.nuevoTest.preguntas.map(p => ({
        tituloPregunta: p.tituloPregunta,
        opcionesRespuesta: p.opcionesRespuesta.filter(o => !!o?.trim()),
        respuestaCorrecta: p.respuestaCorrecta
      })),
      logros: this.selectedLogros.map(l => ({ nombre: l.nombre, iconoUrl: l.iconoUrl })),
      isDeleted: this.nuevoTest.isDeleted
    };

    this.testService.create(payload).subscribe({
      next: () => {
        this.resetearFormulario();
        this.alert.success('El test se creó correctamente.');
      },
      error: () => this.alert.error('No se pudo crear el test.')
    });
  }

  private resetearFormulario(): void {
    this.nuevoTest = { nombre: '', preguntas: [{ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' }], logros: [], isDeleted: false };
    this.selectedLogros = [];
    this.nuevoLogro = { nombre: '', iconoUrl: '' };
    this.mostrarFormularioLogro = false;
    this.numPreguntas = this.nuevoTest.preguntas.length;
    (document.getElementById('crearTestCerrarBtn') as HTMLButtonElement)?.click();
    this.cargarTests();
  }
  agregarNuevoLogro(): void {
    if (!this.nuevoLogro.nombre?.trim()) return;
    const existe = this.selectedLogros.some(s => s.nombre.toLowerCase() === this.nuevoLogro.nombre.toLowerCase());
    if (existe) {
      this.alert.warning('Ya existe un logro con ese nombre.');
      return;
    }

    this.selectedLogros.push({
      nombre: this.nuevoLogro.nombre.trim(),
      iconoUrl: this.nuevoLogro.iconoUrl?.trim() || ''
    });
    this.nuevoLogro = { nombre: '', iconoUrl: '' };
    this.mostrarFormularioLogro = false;
  }

  cancelarNuevoLogro(): void {
    this.nuevoLogro = { nombre: '', iconoUrl: '' };
    this.mostrarFormularioLogro = false;
  }

  quitarLogroSeleccionado(index: number): void {
    if (index < 0 || index >= this.selectedLogros.length) return;
    this.selectedLogros.splice(index, 1);
  }

  abrirEditarTest(t: TestItem): void {
    this.testService.getOne(t._id!).subscribe(res => this.testEditar = { ...res });
  }

  guardarEdicionTest(): void {
    if (!this.testEditar?._id) return;
    const id = this.testEditar._id!;
    const { _id, ...rest } = this.testEditar as TestItem;
    this.testService.update(id, rest).subscribe({
      next: () => {
        (document.getElementById('editarTestCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarTests();
        this.alert.success('El test se actualizó correctamente.');
      },
      error: () => this.alert.error('No se pudo actualizar el test.')
    });
  }

  toggleTestStatus(t: TestItem): void {
    if (t.isDeleted) {
      this.alert.confirm(`¿Confirmas activar el test "${t.nombre}"?`).then(confirmed => {
        if (!confirmed || !t._id) return;
        
        const payload = { isDeleted: false };
        this.testService.update(t._id, payload).subscribe({
          next: () => {
            this.cargarTests();
            this.alert.success('El test se activó correctamente.');
          },
          error: () => {
            this.alert.error('No se pudo activar el test.');
          }
        });
      });
    } else {
      this.alert.confirm(
        `¿Confirmas desactivar el test "${t.nombre}"?`,
        'Los usuarios dejarán de ver este test hasta que lo actives nuevamente.'
      ).then(confirmed => {
        if (!confirmed || !t._id) return;
        
        const payload = { isDeleted: true };
        this.testService.update(t._id, payload).subscribe({
          next: () => {
            this.cargarTests();
            this.alert.success('El test se desactivó correctamente.');
          },
          error: () => {
            this.alert.error('No se pudo desactivar el test.');
          }
        });
      });
    }
  }

  confirmarEliminarTest(t: TestItem): void {
    this.alert.confirm(
      `¿Confirmas eliminar PERMANENTEMENTE el test "${t.nombre}"?`,
      '⚠️ ATENCIÓN: Esta acción NO se puede deshacer. El test será eliminado completamente de la base de datos.',
      'Sí, eliminar permanentemente',
      'Cancelar',
      'error'
    ).then(confirmed => {
      if (!confirmed || !t._id) return;
      this.testService.delete(t._id).subscribe({
        next: () => { 
          this.cargarTests(); 
          this.alert.success('El test se eliminó permanentemente.'); 
        },
        error: () => this.alert.error('No se pudo eliminar el test.')
      });
    });
  }
  abrirResponderTest(t: TestItem): void {
    const userId = this.authService.id;
    if (!userId) { this.alert.warning('Debes iniciar sesión.'); return; }

    this.userService.getOne(userId).subscribe({
      next: (user: User) => {
        if (!user.empresaId || typeof user.empresaId === 'string') {

          this.prepararYMostrarTest(t, userId);
          return;
        }
        const categoriasEmpresa = user.categoriasEmpresa || [];
        
        if (categoriasEmpresa.length === 0) {
          this.prepararYMostrarTest(t, userId);
          return;
        }
        this.validarContenidoPorCategorias(t, userId, categoriasEmpresa);
      },
      error: () => {
        this.alert.error('No se pudo obtener la información del usuario.');
      }
    });
  }

  private validarContenidoPorCategorias(t: TestItem, userId: string, categoriasEmpresa: any[]): void {
    const categoriaIds = categoriasEmpresa.map(cat => cat._id).filter(id => id);

    forkJoin({
      videos: this.videoService.getAll(),
      articulos: this.articuloService.getAll(),
      tareas: this.tareasService.getAll({ usuarioId: userId })
    }).subscribe({
      next: ({ videos, articulos, tareas }) => {
        const completadas = new Set<string>((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));
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
        
        if (faltantes.length > 0) {
          const nombresTareas = faltantes.map(code => {
            if (code.startsWith('Video visualizado: ')) {
              return code.replace('Video visualizado: ', '');
            }
            if (code.startsWith('Articulo leído: ')) {
              return code.replace('Articulo leído: ', '');
            }
            return code;
          });
          
          this.alert.info(`Para poder realizar este test debes tener tus tareas completas: ${nombresTareas.join(', ')}`);
          return;
        }

        this.prepararYMostrarTest(t, userId);
      },
      error: () => this.alert.error('No se pudieron validar los contenidos previos.')
    });
  }

  private prepararYMostrarTest(t: TestItem, userId: string): void {
    this.testAResponder = t;
    this.respuestasUsuario = (t.preguntas || []).map(() => '');
    const modalEl = document.getElementById('modalResponderTest');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  cerrarResponderTest(): void {
    this.testAResponder = null;
    this.respuestasUsuario = [];
  }

  enviarRespuestasTest(): void {
    const userId = this.authService.id;
    const testActual = this.testAResponder;
    if (!userId || !testActual?._id) return;

    if (this.respuestasUsuario.some(r => !r?.trim())) {
      this.alert.warning('Responde todas las preguntas antes de enviar.');
      return;
    }

    const respuestas = (testActual.preguntas || []).map((p, i) => ({
      pregunta: p.tituloPregunta,
      respuesta: this.respuestasUsuario[i]
    }));

    const testId = String(testActual._id);
    this.testService.verificarTest(userId, testId, respuestas).subscribe({
      next: (res) => {
        (document.getElementById('responderTestCerrarBtn') as HTMLButtonElement)?.click();

        const aprobado: boolean = !!res?.resultado?.aprobado;
        const nombresLogros = Array.isArray(res?.resultado?.logrosOtorgados)
          ? res.resultado.logrosOtorgados
            .map((l: any) => (l && typeof l.nombre === 'string' ? l.nombre : ''))
            .filter((n: string) => n.length > 0)
            .join(', ')
          : '';

        if (aprobado) {
          this.alert.success(nombresLogros ? `¡Aprobado! Logros obtenidos: ${nombresLogros}` : '¡Aprobado! Sin nuevos logros.');
          this.cargarTests();
        } else {
          this.alert.info('No aprobado. ¡Sigue intentando, puedes lograrlo!');
        }
        this.cerrarResponderTest();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo verificar el test.')
    });
  }

  private recalcularListasUsuario(): void {
    const userId = this.authService.id;

    if (!userId) {
      this.testsPendientes = [...(this.tests || [])];
      this.testsRealizados = [];
      return;
    }

    this.tareasService.getAll({ usuarioId: userId }).subscribe({
              next: (tareas) => {
          const tareasCompletadas = new Set<string>(
            (tareas || []).map((t: any) => String(t?.tareaCompletada || ''))
          );

          this.testsPendientes = [];
          this.testsRealizados = [];

          for (const test of this.tests || []) {
          const testCompletado = `Test completado: ${test.nombre || 'Sin nombre'}`;
          const testIntentado = `Test intentado: ${test.nombre || 'Sin nombre'}`;
          const testNombreDirecto = test.nombre || 'Sin nombre';
          
          const encontradoCompletado = tareasCompletadas.has(testCompletado);
          const encontradoDirecto = tareasCompletadas.has(testNombreDirecto);

          if (encontradoCompletado || encontradoDirecto) {
            this.testsRealizados.push(test);
          } else {
            this.testsPendientes.push(test);
          }
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al recalcular listas:', error);
        this.testsPendientes = [...(this.tests || [])];
        this.testsRealizados = [];
      }
    });
  }
}

