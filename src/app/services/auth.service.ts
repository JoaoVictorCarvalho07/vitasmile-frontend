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
        sessionStorage.setItem('vitasmile_token', res.token);
        sessionStorage.setItem('vitasmile_perfil', res.perfil);
        sessionStorage.setItem('vitasmile_nome', res.NomeUsuario);
      })
    );
  }

  logout(): void {
    sessionStorage.removeItem('vitasmile_token');
    sessionStorage.removeItem('vitasmile_perfil');
    sessionStorage.removeItem('vitasmile_nome');
  }

  getToken(): string | null {
    return sessionStorage.getItem('vitasmile_token');
  }

  getPerfil(): string | null {
    return sessionStorage.getItem('vitasmile_perfil');
  }

  getNome(): string | null {
    return sessionStorage.getItem('vitasmile_nome');
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
