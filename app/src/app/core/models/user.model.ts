export interface User {
  _id?: string;
  nombre?: string;
  nombreCompleto?: string;
  roles?: 'usuario' | 'editor';
  password?: string;
  empresaId?: string;
  logros?: string[];
  createdAt?: string;
  updatedAt?: string;
}
export interface LoginResponse {
  token: string;
}
