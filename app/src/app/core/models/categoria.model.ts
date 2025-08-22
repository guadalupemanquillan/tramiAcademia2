export interface Categoria {
  _id?: string;
  nombre: string;
  categoriaPadre?: string | null;
  jerarquia?: number;
  empresaId?: string | null;
}

export interface CategoriaPaginatedResponse {
  items: Categoria[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


