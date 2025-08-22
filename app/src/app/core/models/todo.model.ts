export interface TodoTareaBase {
  tareaId: string;
  completada?: boolean;
}

export interface TodoItem {
  _id?: string;
  titulo: string;
  tareaBase: TodoTareaBase[];
  categoriaId?: string | null;
}


