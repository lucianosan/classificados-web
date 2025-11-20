import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) {}
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    const stream = next.handle(authReq);
    const piped = req.method === 'GET' ? stream.pipe(retry(1)) : stream;
    return piped.pipe(catchError(err => {
      console.error('HTTP error', { url: req.url, status: err?.status, message: err?.message });
      if (err?.status === 401) { this.auth.logout(); this.router.navigate(['/login'], { queryParams: { reason: 'auth', next: this.router.url.split('#')[1] || '/' } }); }
      return throwError(() => err);
    }));
  }
}
