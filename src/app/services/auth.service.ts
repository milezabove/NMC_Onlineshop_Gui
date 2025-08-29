import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

interface AuthResponse { token: string; expiresInSeconds: number; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/auth`;

  register(email: string, password: string, fullName: string, address: string) {
    return this.http.post<AuthResponse>(`${this.base}/register`, { email, password, fullName, address })
      .pipe(tap(res => localStorage.setItem('jwt', res.token)));
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/login`, { email, password })
      .pipe(tap(res => localStorage.setItem('jwt', res.token)));
  }

  logout(){ localStorage.removeItem('jwt'); }
  token(){ return localStorage.getItem('jwt'); }
  isLoggedIn(){ return !!this.token(); }
}
