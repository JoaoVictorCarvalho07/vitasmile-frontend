import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta } from '../models/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.API}/consultas`);
  }

  create(body: Partial<Consulta>): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API}/consultas`, body);
  }

  cancelar(id: number, motivo: string): Observable<Consulta> {
    return this.http.patch<Consulta>(`${this.API}/consultas/${id}/cancelar`, { motivo });
  }

  finalizar(id: number): Observable<Consulta> {
    return this.http.patch<Consulta>(`${this.API}/consultas/${id}/finalizar`, {});
  }
}
