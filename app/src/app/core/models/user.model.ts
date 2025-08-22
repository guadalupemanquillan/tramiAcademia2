export interface User {
  _id?: string;
  nombre?: string;
  nombreCompleto?: string;
  roles?: 'usuario' | 'editor';
  logros?: string[];
  createdAt?: string;
  updatedAt?: string;
}


