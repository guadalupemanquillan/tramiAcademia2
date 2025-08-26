import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { EmpresaService } from '../../core/services/empresa.service';
import { User } from '../../core/models/user.model';
import { Empresa } from '../../core/models/empresa.model';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  users$: Observable<User[]> = of([]);
  empresas$: Observable<Empresa[]> = of([]);

  // form model
  newUser: Partial<User> = {
    nombre: '',
    nombreCompleto: '',
    roles: 'usuario',
    password: '',
    empresaId: ''
  };

  isSubmitting = false;
  errorMsg = '';
  showCreateModal = false;

  constructor(private userService: UserService, private empresaService: EmpresaService) { }
  ngOnInit(): void {
    this.users$ = this.userService.getAll();
    this.empresas$ = this.empresaService.getAll();
  }

  openModal(): void {
    this.errorMsg = '';
    this.showCreateModal = true;
    const modalEl = document.getElementById('modalCrearUsuario');
    if (modalEl && typeof window !== 'undefined') {
      const anyWin = window as any;
      const modal = anyWin.bootstrap?.Modal?.getOrCreateInstance
        ? anyWin.bootstrap.Modal.getOrCreateInstance(modalEl)
        : new anyWin.bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.showCreateModal = false;
  }

  createUser(): void {
    if (this.isSubmitting) return;
    this.errorMsg = '';
    const { nombre, nombreCompleto, password } = this.newUser;
    if (!nombre && !nombreCompleto) {
      this.errorMsg = 'Nombre o nombre completo requerido';
      return;
    }
    if (!password) {
      this.errorMsg = 'La contraseña es requerida';
      return;
    }
    this.isSubmitting = true;
    this.userService.create(this.newUser).subscribe({
      next: () => {
        // reset form and refresh list
        this.newUser = { nombre: '', nombreCompleto: '', roles: 'usuario', password: '', empresaId: '' };
        this.users$ = this.userService.getAll();
        this.isSubmitting = false;
        this.showCreateModal = false;
        (document.getElementById('crearUsuarioCerrarBtn') as HTMLButtonElement)?.click();
      },
      error: (err) => {
        this.errorMsg = err?.error?.message || 'Error al crear el usuario';
        this.isSubmitting = false;
      }
    });
  }
}


