import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowed = route.data?.['roles'] as string[] | undefined;
    
    if (!allowed || allowed.length === 0) return true;
    const role = this.auth.role;
    if (role && allowed.includes(role)) return true;
    return this.router.createUrlTree(['/dashboard']);
    }
}




