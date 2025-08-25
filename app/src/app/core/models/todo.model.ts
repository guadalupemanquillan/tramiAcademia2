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
export interface ChecklistItem {
  code: string;
  title: string;
  type: 'test' | 'video' | 'custom';
  completed: boolean;
}

