import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Especialidade } from '../models/especialidade.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EspecialidadeService {
  private readonly API = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private allCache$?: Observable<Especialidade[]>;

  getAll(): Observable<Especialidade[]> {
    return (this.allCache$ ??= this.http
      .get<Especialidade[]>(`${this.API}/especialidades/listar`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false })));
  }

  invalidateAll(): void {
    this.allCache$ = undefined;
  }

  create(especialidade: Partial<Especialidade>): Observable<Especialidade> {
    return this.http.post<Especialidade>(`${this.API}/especialidades/criar-especialidade`, especialidade);
  }
}
