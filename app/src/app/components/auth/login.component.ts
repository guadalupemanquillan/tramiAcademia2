import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {

        this.loading = false;
        if (isPlatformBrowser(this.platformId)) {
          this.router.navigate(['/dashboard']);
        } else {

          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        this.loading = false;

        if (err.status === 0) {
          this.errorMessage = 'Error de conexión. Verifica que la API esté ejecutándose.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.error || 'Credenciales incorrectas';
        } else {
          this.errorMessage = 'Error inesperado. Intenta nuevamente.';
        }
      }
    });
  }
}
