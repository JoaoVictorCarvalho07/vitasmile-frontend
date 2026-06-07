import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paciente } from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.API}/pacientes`);
  }

  create(paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.API}/pacientes`, paciente);
  }

  update(id: number, paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.put<Paciente>(`${this.API}/pacientes/${id}`, paciente);
  }
}
