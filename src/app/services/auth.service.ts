import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthRequest, AuthResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  private readonly http: HttpClient = inject(HttpClient);
  
  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/auth/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('vitasmile_token', res.token);
        localStorage.setItem('vitasmile_perfil', res.perfil);
        localStorage.setItem('vitasmile_nome', res.NomeUsuario);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('vitasmile_token');
    localStorage.removeItem('vitasmile_perfil');
    localStorage.removeItem('vitasmile_nome');
  }

  getToken(): string | null {
    return localStorage.getItem('vitasmile_token');
  }

  getPerfil(): string | null {
    return localStorage.getItem('vitasmile_perfil');
  }

  getNome(): string | null {
    return localStorage.getItem('vitasmile_nome');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    return this.getPerfil() === 'ADMIN';
  }

  isDentista(): boolean {
    return this.getPerfil() === 'DENTISTA';
  }

  isPaciente(): boolean {
    return this.getPerfil() === 'PACIENTE';
  }
}
