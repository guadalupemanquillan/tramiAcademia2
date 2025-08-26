export interface UsuarioRef { _id?: string; nombre?: string }

export interface Tarea {
  _id?: string;
  usuarioId: string | UsuarioRef;
  tareaCompletada?: string;
  completada?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


