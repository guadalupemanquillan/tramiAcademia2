import { Categoria } from './categoria.model';

export interface Empresa {
  _id?: string;
  nombre: string;
  imagen: string;
  categorias?: Categoria[];
}


