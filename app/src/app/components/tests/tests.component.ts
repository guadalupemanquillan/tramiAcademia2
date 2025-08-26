import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TestService } from '../../core/services/test.service';
import { TestItem } from '../../core/models/test.model';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { LogrosService } from '../../core/services/logros.service';
import { Logros } from '../../core/models/logros.model';
import { TodoService } from '../../core/services/todo.service';
import { TareasService } from '../../core/services/tareas.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tests',
  templateUrl: './tests.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule]
})
export class TestsComponent implements OnInit {
  tests: TestItem[] = [];
  testsPendientes: TestItem[] = [];
  testsRealizados: TestItem[] = [];

  nuevoTest: TestItem = { preguntas: [{ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' }], logros: [] };
  testEditar: Partial<TestItem> | null = null;
  loading: boolean = true;

  logrosDisponibles: Logros[] = [];
  selectedLogroId: string | null = null;
  selectedLogros: { nombre: string; iconoUrl: string; _id?: string }[] = [];
  numPreguntas: number = 1;

  // Eliminado localStorage legacy: usamos TareasService

  // Para realizar test (rol usuario)
  testAResponder: TestItem | null = null;
  respuestasUsuario: string[] = [];

  constructor(
    private testService: TestService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private logrosService: LogrosService,
    public authService: AuthService,
    private todoService: TodoService,
    private tareasService: TareasService
  ) { }

  // --- Helpers usados por Dashboard ---
  static getTotalQuestions(tests: any[] | null | undefined): number {
    if (!Array.isArray(tests) || tests.length === 0) return 0;
    return tests.reduce((sum, t) => sum + ((t?.preguntas ?? []).length), 0);
  }


  static getCompletedPercent(tests: any[] | null | undefined): number {
    if (!Array.isArray(tests) || tests.length === 0) return 0;
    const completed = tests.filter(t => (t?.logros ?? []).length > 0).length;
    return (completed / tests.length) * 100;
  }

  ngOnInit(): void {
    this.cargarTests();
    this.cargarLogrosDisponibles();
    this.numPreguntas = this.nuevoTest.preguntas.length;
  }

  cargarTests(): void {
    this.loading = true;
    this.testService.getAll().subscribe({
      next: tests => {
        this.tests = tests;
        this.recalcularListasUsuario();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => this.loading = false
    });
  }

  cargarLogrosDisponibles(): void {
    this.logrosService.getAll().subscribe({
      next: logros => this.logrosDisponibles = logros,
      error: () => this.logrosDisponibles = []
    });
  }

  trackPregunta(index: number) { return index; }
  trackOpcion(index: number) { return index; }

  // Métodos generales para agregar elementos
  agregarPregunta(enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    test?.preguntas?.push({ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' });
    this.numPreguntas = Math.max(1, (test?.preguntas?.length ?? 0));
  }

  agregarOpcion(indexPregunta: number, enEdicion: boolean = false) {
    const test = enEdicion ? this.testEditar : this.nuevoTest;
    test?.preguntas?.[indexPregunta]?.opcionesRespuesta.push('');
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
      preguntas: this.nuevoTest.preguntas.map(p => ({
        tituloPregunta: p.tituloPregunta,
        opcionesRespuesta: p.opcionesRespuesta.filter(o => !!o?.trim()),
        respuestaCorrecta: p.respuestaCorrecta
      })),
      logros: this.selectedLogros.map(l => ({ nombre: l.nombre, iconoUrl: l.iconoUrl }))
    };
    this.testService.create(payload).subscribe({
      next: () => {
        this.nuevoTest = { preguntas: [{ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' }], logros: [] };
        this.selectedLogroId = null;
        this.selectedLogros = [];
        this.numPreguntas = this.nuevoTest.preguntas.length;
        (document.getElementById('crearTestCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarTests();
        this.alert.success('El test se creó correctamente.');
      },
      error: () => this.alert.error('No se pudo crear el test.')
    });
  }

  // --- Selección múltiple de logros (Crear Test) ---
  agregarLogroSeleccionado(): void {
    if (!this.selectedLogroId) return;
    const lg = this.logrosDisponibles.find(x => x._id === this.selectedLogroId);
    if (!lg) return;
    // Evitar duplicados por id o nombre
    const existe = this.selectedLogros.some(s => (lg._id && s._id === lg._id) || s.nombre === lg.nombre);
    if (existe) return;
    this.selectedLogros.push({ nombre: lg.nombre, iconoUrl: lg.iconoUrl, _id: lg._id });
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

  confirmarEliminarTest(t: TestItem): void {
    this.alert.confirm('¿Confirmas eliminar este test?').then(confirmed => {
      if (!confirmed || !t._id) return;
      this.testService.delete(t._id).subscribe({
        next: () => { this.cargarTests(); this.alert.success('El test se eliminó correctamente.'); },
        error: () => this.alert.error('No se pudo eliminar el test.')
      });
    });
  }

  // Flujo usuario
  abrirResponderTest(t: TestItem): void {
    // Gatear por TODOs de la categoría del usuario
    const categoriaId = this.authService.categoriaId;
    const userId = this.authService.id;
    if (!userId) { this.alert.warning('Debes iniciar sesión.'); return; }

    forkJoin({ todos: this.todoService.getAll(), tareas: this.tareasService.getAll({ usuarioId: userId }) }).subscribe({
      next: ({ todos, tareas }) => {
        const completadas = new Set<string>((tareas || []).map((x: any) => String(x?.tareaCompletada || '')));
        const todosDeCategoria = (todos || []).filter(td => (!categoriaId || String(td.categoriaId || '') === String(categoriaId)));
        const tienePendientes = todosDeCategoria.some(td => {
          const todoId = String((td as any)?._id || '');
          const bases = Array.isArray((td as any)?.tareasBase) ? (td as any).tareasBase : [];
          return bases.some((_: any, idx: number) => !completadas.has(`custom:${todoId}#${idx}`));
        });
        if (tienePendientes) {
          this.alert.info('Debes completar tus tareas asignadas antes de realizar el test.');
          return;
        }

        // Auto-crear una tarea completada al iniciar el test
        const code = `test:start:${t._id}`;
        this.tareasService.create({ usuarioId: userId, tareaCompletada: code } as any).subscribe({ next: () => {}, error: () => {} });

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
      },
      error: () => this.alert.error('No se pudieron validar tus tareas pendientes.')
    });
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
          // Registrar tarea completada para checklist de test
          this.tareasService.create({ usuarioId: userId, tareaCompletada: `test:${testId}` } as any).subscribe({ next: () => {}, error: () => {} });
          this.recalcularListasUsuario();
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
    if (!userId) { this.testsPendientes = [...this.tests]; this.testsRealizados = []; return; }
    // Marcamos realizados con presencia de logros (proxy) o usando Tareas si se quiere refinar
    const realizados = new Set<string>((this.tests || []).filter(t => (t?.logros ?? []).length > 0).map(t => String(t._id)));
    this.testsRealizados = this.tests.filter(t => t._id && realizados.has(String(t._id)));
    this.testsPendientes = this.tests.filter(t => !(t._id && realizados.has(String(t._id))));
  }
}
