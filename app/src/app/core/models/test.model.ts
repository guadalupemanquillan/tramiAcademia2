export interface TestPregunta {
  tituloPregunta: string;
  opcionesRespuesta: string[];
  respuestaCorrecta: string;
}

export interface TestItem {
  _id?: string;
  preguntas: TestPregunta[];
  logros?: { nombre: string; iconoUrl: string }[];
}


