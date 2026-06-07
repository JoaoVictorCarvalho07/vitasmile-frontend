import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Especialidade } from '../models/especialidade.model';

@Injectable({ providedIn: 'root' })
export class EspecialidadeService {
  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Especialidade[]> {
    return this.http.get<Especialidade[]>(`${this.API}/especialidades`);
  }

  create(especialidade: Partial<Especialidade>): Observable<Especialidade> {
    return this.http.post<Especialidade>(`${this.API}/especialidades`, especialidade);
  }
}
