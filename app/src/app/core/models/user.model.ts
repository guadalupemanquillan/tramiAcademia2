import { Empresa } from './empresa.model';
import { Logros } from './logros.model';

export interface Categoria {
  _id?: string;
  nombre?: string;
}

export interface User {
  _id?: string;
  nombre?: string;
  nombreCompleto?: string;
  roles?: 'usuario' | 'editor';
  password?: string;
  empresaId: string | Empresa;
  logros?: (string | Logros)[];
  categoriasEmpresa?: Categoria[];
}
export interface LoginResponse {
  token: string;
}
