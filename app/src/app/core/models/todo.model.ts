export interface TodoTareaBase {
  nombreTarea: string;
  completada?: boolean;
}

export interface TodoItem {
  _id?: string;
  titulo: string;
  tareasBase: TodoTareaBase[];
  categoriaId?: string | null;
  completada?: boolean;
}
export interface ChecklistItem {
  code: string;
  title: string;
  type: 'test' | 'video' | 'articulo' | 'custom';
  completed: boolean;
  categoriaId?: string | null;
}

