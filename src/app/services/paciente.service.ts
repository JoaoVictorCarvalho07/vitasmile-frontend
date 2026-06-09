import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Paciente } from '../models/paciente.model';
import { Page, PageQuery } from '../models/page.model';
import { PagedCollection } from '../core/paged-collection';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly API = 'http://localhost:8080';
  private readonly http = inject(HttpClient);

  readonly lista = new PagedCollection<Paciente>((query) => this.getPage(query));

  private allCache$?: Observable<Paciente[]>;

  private getPage(query: PageQuery): Observable<Page<Paciente>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http.get<Page<Paciente>>(`${this.API}/pacientes/lista-todos`, { params });
  }

  getAll(): Observable<Paciente[]> {
    return (this.allCache$ ??= this.getPage({ page: 0, size: 1000 }).pipe(
      map((p) => p.content),
      shareReplay({ bufferSize: 1, refCount: false }),
    ));
  }

  create(paciente: Partial<Paciente>): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.API}/pacientes/cria-paciente`, paciente);
  }

  update(id: number, paciente: Partial<Paciente>): Observable<Paciente> {
    const params = new HttpParams().set('id', id);
    return this.http.put<Paciente>(`${this.API}/pacientes/edita-paciente`, paciente, { params });
  }
}
