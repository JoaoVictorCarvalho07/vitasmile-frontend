import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Dentista } from '../models/dentista.model';
import { Page, PageQuery } from '../models/page.model';
import { PagedCollection } from '../core/paged-collection';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DentistaService {
  private readonly API = environment.apiUrl;
  private readonly http = inject(HttpClient);

  readonly lista = new PagedCollection<Dentista>((query) => this.getPage(query));

  private allCache$?: Observable<Dentista[]>;

  private getPage(query: PageQuery): Observable<Page<Dentista>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http.get<Page<Dentista>>(`${this.API}/dentista/all`, { params });
  }

  getAll(): Observable<Dentista[]> {
    return (this.allCache$ ??= this.getPage({ page: 0, size: 1000 }).pipe(
      map((p) => p.content ?? []),
      shareReplay({ bufferSize: 1, refCount: false }),
    ));
  }

  setAtivo(id: number, ativo: boolean): Observable<Dentista> {
    const params = new HttpParams().set('ativo', ativo);
    return this.http.put<Dentista>(`${this.API}/dentista/${id}/ativo`, null, { params });
  }
}
