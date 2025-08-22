import { Component, OnDestroy } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div *ngIf="showLayout" class="d-flex align-items-stretch min-vh-100">
      <app-sidebar class="h-100"></app-sidebar>
       <main class="flex-grow-1" [ngClass]="{ 'dashboard-gradient': isDashboard }">
        <app-navbar></app-navbar>
        <router-outlet></router-outlet>
      </main>
    </div>

    <router-outlet *ngIf="!showLayout"></router-outlet>
  `
})
export class AppComponent implements OnDestroy {
  title = 'app';
  showLayout = true;
  isDashboard = false;
  private sub: Subscription;

  constructor(private router: Router) {
    const evaluate = (url: string) => {
      // Ocultar navbar y sidebar en login
      this.showLayout = !url.startsWith('/login');
      this.isDashboard = url.startsWith('/dashboard');
    };
    evaluate(this.router.url);

    this.sub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        evaluate(evt.urlAfterRedirects || evt.url);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
