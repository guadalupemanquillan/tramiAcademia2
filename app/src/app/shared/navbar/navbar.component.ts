import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router, @Inject(PLATFORM_ID) private platformId: Object) { }

  get roleLabel(): string {
    return this.authService.role === 'editor' ? 'editor' : 'usuario';
  }

  get displayName(): string {
    return this.authService.name || 'usuario';
  }

  logout(): void {
    this.authService.logout();
    if (isPlatformBrowser(this.platformId)) {
      this.router.navigate(['/login']);
    }
  }


}


