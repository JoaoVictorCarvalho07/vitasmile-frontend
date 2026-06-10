import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/usuario.model';
import { Page, PageQuery } from '../models/page.model';
import { PagedCollection } from '../core/paged-collection';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly API = 'http://localhost:8080';
  private readonly http = inject(HttpClient);

  readonly lista = new PagedCollection<Usuario>((query) => this.getPage(query));

  private getPage(query: PageQuery): Observable<Page<Usuario>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.sort) {
      params = params.set('sort', query.sort);
    }
    return this.http.get<Page<Usuario>>(`${this.API}/usuarios`, { params });
  }

  create(usuario: Partial<Usuario> & { senha?: string }): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API}/usuarios`, usuario);
  }

  update(id: number, usuario: Partial<Usuario> & { senha?: string }): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API}/usuarios/${id}`, usuario);
  }

  setAtivo(id: number, ativo: boolean): Observable<Usuario> {
    const params = new HttpParams().set('ativo', ativo);
    return this.http.put<Usuario>(`${this.API}/usuarios/${id}/ativo`, null, { params });
  }
}
