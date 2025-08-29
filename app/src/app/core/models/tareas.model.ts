export interface UsuarioRef { _id?: string; nombre?: string }

export interface Tarea {
  _id?: string;
  usuarioId: string | UsuarioRef;
  tareaCompletada?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UsuarioTareas {
  usuarioId: string;
  nombreUsuario: string;
  totalTareas: number;
  tareas: Tarea[];
  expanded: boolean;
}


