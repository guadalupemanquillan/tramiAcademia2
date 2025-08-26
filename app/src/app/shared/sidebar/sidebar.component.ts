import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  imports: [CommonModule, RouterModule]
})
export class SidebarComponent {
  constructor(public authService: AuthService) { }
  adminMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-house-fill', route: '/dashboard/admin' },
    { label: 'Empresas', icon: 'bi-building-fill', route: '/admin/empresa' },
    { label: 'Categorías', icon: 'bi-tags-fill', route: '/admin/categoria' },
    { label: 'Tests', icon: 'bi-clipboard2-check-fill', route: '/admin/tests' },
    { label: 'Tareas', icon: 'bi-clipboard2-data-fill', route: '/admin/tareas' },
    { label: 'Tareas a realizar', icon: 'bi-list-task', route: '/admin/todo' },
    { label: 'Video', icon: 'bi-camera-video-fill', route: '/admin/video' },
    { label: 'Logros', icon: 'bi-trophy-fill', route: '/admin/logro' },
    { label: 'Artículos', icon: 'bi-journal-text', route: '/admin/articulos' },
    { label: 'Usuarios', icon: 'bi-people-fill', route: '/users' },
  ];

  userMenu: MenuItem[] = [
    { label: 'Dashboard', icon: 'bi-house-fill', route: '/dashboard/usuario' },
    { label: 'Tests', icon: 'bi-clipboard2-check-fill', route: '/usuario/test' },
    { label: 'Tareas a realizar', icon: 'bi-list-task', route: '/usuario/todo' },
    { label: 'Video', icon: 'bi-camera-video-fill', route: '/usuario/video' },
    { label: 'Logros', icon: 'bi-trophy-fill', route: '/usuario/logro' },
    { label: 'Artículos', icon: 'bi-journal-text', route: '/usuario/articulos' },
  ];
  get filteredMenu(): MenuItem[] {
    return this.authService.role === 'editor' ? this.adminMenu : this.userMenu;
  }
  get role(): string | null { return this.authService.role; }
}
