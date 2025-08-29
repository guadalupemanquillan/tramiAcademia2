export interface User {
  _id?: string;
  nombreCompleto?: string;
  nombre?: string;
  email?: string;
}

export interface Logros {
  _id?: string;
  nombre: string;
  usuarioId?: string | User;
  iconoUrl: string;
  createdAt?: string;
  updatedAt?: string;
}




