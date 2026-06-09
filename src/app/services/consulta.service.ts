import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Consulta } from '../models/consulta.model';
import { Page, PageQuery } from '../models/page.model';
import { PagedCollection } from '../core/paged-collection';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly API = 'http://localhost:8080';
  private readonly http = inject(HttpClient);

  readonly lista = new PagedCollection<Consulta>((query) => this.getPage(query));

  private allCache$?: Observable<Consulta[]>;

  private getPage(query: PageQuery): Observable<Page<Consulta>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http.get<Page<Consulta>>(`${this.API}/consultas`, { params });
  }

  getAll(): Observable<Consulta[]> {
    return (this.allCache$ ??= this.getPage({ page: 0, size: 1000 }).pipe(
      map((p) => p.content),
      shareReplay({ bufferSize: 1, refCount: false }),
    ));
  }

  invalidateAll(): void {
    this.allCache$ = undefined;
  }

  create(body: Partial<Consulta>): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API}/consultas`, body);
  }

  cancelar(id: number, motivo: string): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API}/consultas/${id}/cancelar`, { motivo });
  }

  finalizar(id: number): Observable<Consulta> {
    return this.http.post<Consulta>(`${this.API}/consultas/${id}/finalizar`, {});
  }
}
