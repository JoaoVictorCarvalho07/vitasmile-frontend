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
}
