export interface TodoTareaBase {
  nombreTarea: string;
}

export interface TodoItem {
  _id?: string;
  titulo: string;
  tareasBase: TodoTareaBase[];
  categoriaId?: string | null;
  completada?: boolean;// solo en front 
}


