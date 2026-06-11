import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { Procedimento } from '../models/procedimento.model';

interface ProcedimentoInput {
  nome: string;
  descricao?: string;
  valorBase?: number | null;
  idEspecialidade?: number | null;
}

@Injectable({ providedIn: 'root' })
export class ProcedimentoService {
  private readonly API = 'http://localhost:8080';
  private readonly http = inject(HttpClient);

  private allCache$?: Observable<Procedimento[]>;

  getAll(): Observable<Procedimento[]> {
    return (this.allCache$ ??= this.http
      .get<Procedimento[]>(`${this.API}/procedimentos`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false })));
  }

  invalidateAll(): void {
    this.allCache$ = undefined;
  }

  create(procedimento: ProcedimentoInput): Observable<Procedimento> {
    return this.http.post<Procedimento>(`${this.API}/procedimentos`, procedimento);
  }
}
