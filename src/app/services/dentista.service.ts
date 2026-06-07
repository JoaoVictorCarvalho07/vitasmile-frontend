import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Dentista } from '../models/dentista.model';

@Injectable({ providedIn: 'root' })
export class DentistaService {
  private readonly API = 'http://localhost:8080';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Dentista[]> {
    return this.http.get<Dentista[]>(`${this.API}/dentistas`);
  }

  update(id: number, dentista: Partial<Dentista>): Observable<Dentista> {
    return this.http.put<Dentista>(`${this.API}/dentistas/${id}`, dentista);
  }
}
