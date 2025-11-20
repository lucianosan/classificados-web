import { Injectable } from '@angular/core';
import { CanMatch, Router, Route, UrlSegment } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanMatch {
  constructor(private auth: AuthService, private router: Router) {}
  canMatch(route: Route, segments: UrlSegment[]) {
    return this.auth.currentUser$.pipe(
      take(1),
      map(u => {
        const roles = (route.data as any)?.roles as string[] | undefined;
        if (!u) return this.router.createUrlTree(['/login']);
        if (roles && !roles.includes(u.role || 'user')) return this.router.createUrlTree(['/']);
        return true;
      })
    );
  }
}
