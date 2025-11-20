import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { User } from '../models/user';
import { HttpClient } from '@angular/common/http';
import { apiBase } from '../env';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = apiBase();
  private sessionKey = 'sessionToken';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.sessionKey);
    if (token) { this.fetchMe().catch(() => this.logout()); }
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const res: any = await firstValueFrom(this.http.post(`${this.api}/auth/register`, { name, email, password }));
    if (res?.token) localStorage.setItem(this.sessionKey, res.token);
    const user = res?.user || await this.fetchMe();
    return user;
  }

  async login(email: string, password: string): Promise<User> {
    const res: any = await firstValueFrom(this.http.post(`${this.api}/auth/login`, { email, password }));
    if (!res?.token) throw new Error('Credenciais inválidas');
    localStorage.setItem(this.sessionKey, res.token);
    const user = res?.user || await this.fetchMe();
    return user;
  }

  logout() {
    localStorage.removeItem(this.sessionKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null { return localStorage.getItem(this.sessionKey); }

  async fetchMe(): Promise<User> {
    const user = await firstValueFrom(this.http.get<User>(`${this.api}/auth/me`));
    this.currentUserSubject.next(user);
    return user;
  }

  isAdmin(): boolean { const u = this.currentUserSubject.getValue(); return !!u && u.role === 'admin'; }
}
