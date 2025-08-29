export interface HistorialEdicion {
  titulo: string;
  texto: string;
  autor: string;
  categoriaId: string;
  usuarioEdita: string;
  fechaEdicion: Date;
}

export interface Articulo {
  _id?: string;
  titulo: string;
  texto: string;
  autor: string;
  categoriaId: string;
  historialEdiciones: HistorialEdicion[];
  createdAt?: Date;
  updatedAt?: Date;
}
