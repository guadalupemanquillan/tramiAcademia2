import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['editor'] }
  },
  {
    path: 'dashboard/usuario',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['usuario', 'editor'] }
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['editor'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'categoria' },
      {
        path: 'empresa',
        loadComponent: () => import('./components/empresas/empresas.component').then(m => m.EmpresasComponent)
      },
      {
        path: 'categoria',
        loadComponent: () => import('./components/categorias/categorias.component').then(m => m.CategoriasComponent)
      },
      {
        path: 'tests',
        loadComponent: () => import('./components/tests/tests.component').then(m => m.TestsComponent)
      },
      {
        path: 'tareas',
        loadComponent: () => import('./components/tareas/tareas.component').then(m => m.TareasComponent)
      },
      {
        path: 'todo',
        loadComponent: () => import('./components/todo/todo.component').then(m => m.TodoComponent)
      },
      {
        path: 'video',
        loadComponent: () => import('./components/video/video.component').then(m => m.VideoComponent)
      },
      {
        path: 'logro',
        loadComponent: () => import('./components/logros/logros.component').then(m => m.LogrosComponent)
      }
    ]
  },
  {
    path: 'usuario',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['usuario', 'editor'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'test' },
      {
        path: 'test',
        loadComponent: () => import('./components/tests/tests.component').then(m => m.TestsComponent)
      },
      {
        path: 'tareas',
        loadComponent: () => import('./components/tareas/tareas.component').then(m => m.TareasComponent)
      },
      {
        path: 'todo',
        loadComponent: () => import('./components/todo/todo.component').then(m => m.TodoComponent)
      },
      {
        path: 'video',
        loadComponent: () => import('./components/video/video.component').then(m => m.VideoComponent)
      },
      {
        path: 'logro',
        loadComponent: () => import('./components/logros/logros.component').then(m => m.LogrosComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

