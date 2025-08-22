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
  numPreguntas: number = 1;

  private completedKeyPrefix = 'completedTests_';

  // Para realizar test (rol usuario)
  testAResponder: TestItem | null = null;
  respuestasUsuario: string[] = [];

  constructor(
    private testService: TestService,
    private cdr: ChangeDetectorRef,
    private alert: AlertService,
    private logrosService: LogrosService,
    public authService: AuthService
  ) { }

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
      logros: (() => {
        if (!this.selectedLogroId) return [];
        const lg = this.logrosDisponibles.find(x => x._id === this.selectedLogroId);
        return lg ? [{ nombre: lg.nombre, iconoUrl: lg.iconoUrl }] : [];
      })()
    };
    this.testService.create(payload).subscribe({
      next: () => {
        this.nuevoTest = { preguntas: [{ tituloPregunta: '', opcionesRespuesta: ['', ''], respuestaCorrecta: '' }], logros: [] };
        this.selectedLogroId = null;
        this.numPreguntas = this.nuevoTest.preguntas.length;
        (document.getElementById('crearTestCerrarBtn') as HTMLButtonElement)?.click();
        this.cargarTests();
        this.alert.success('El test se creó correctamente.');
      },
      error: () => this.alert.error('No se pudo crear el test.')
    });
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
          this.marcarComoRealizadoLocal(userId, testId);
          this.recalcularListasUsuario();
        } else {
          this.alert.info('No aprobado. ¡Sigue intentando, puedes lograrlo!');
        }
        this.cerrarResponderTest();
      },
      error: (err) => this.alert.error(err?.error?.message || 'No se pudo verificar el test.')
    });
  }

  // LocalStorage para tests completados
  private obtenerCompletadosUsuario(userId: string | null): Set<string> {
    if (!userId) return new Set();
    try {
      const raw = localStorage.getItem(this.completedKeyPrefix + userId);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  }

  private guardarCompletadosUsuario(userId: string, setIds: Set<string>) {
    try { localStorage.setItem(this.completedKeyPrefix + userId, JSON.stringify(Array.from(setIds))); } catch { }
  }

  private marcarComoRealizadoLocal(userId: string, testId: string) {
    const current = this.obtenerCompletadosUsuario(userId);
    current.add(testId);
    this.guardarCompletadosUsuario(userId, current);
  }

  private recalcularListasUsuario(): void {
    const userId = this.authService.id;
    if (!userId) { this.testsPendientes = [...this.tests]; this.testsRealizados = []; return; }
    const done = this.obtenerCompletadosUsuario(userId);
    this.testsRealizados = this.tests.filter(t => t._id && done.has(t._id));
    this.testsPendientes = this.tests.filter(t => !(t._id && done.has(t._id)));
  }
}
