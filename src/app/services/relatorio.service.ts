import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page } from '../models/page.model';
import { Consulta } from '../models/consulta.model';
import {
  DentistaDoProcedimento,
  ProcedimentoDoDentista,
  RelatorioFiltro,
  RelatorioResumo,
} from '../models/relatorio.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RelatorioService {
  private readonly API = environment.apiUrl;
  private readonly http = inject(HttpClient);

  buscarConsultas(filtro: RelatorioFiltro, page: number, size: number): Observable<Page<Consulta>> {
    let params = this.filtroParams(filtro, true).set('page', page).set('size', size);
    return this.http.get<Page<Consulta>>(`${this.API}/relatorios/consultas`, { params });
  }

  resumo(filtro: RelatorioFiltro): Observable<RelatorioResumo> {
    return this.http.get<RelatorioResumo>(`${this.API}/relatorios/resumo`, {
      params: this.filtroParams(filtro, false),
    });
  }

  procedimentosDoDentista(idDentista: number, inicio: string, fim: string): Observable<ProcedimentoDoDentista[]> {
    return this.http.get<ProcedimentoDoDentista[]>(
      `${this.API}/relatorios/dentista/${idDentista}/procedimentos`,
      { params: this.periodoParams(inicio, fim) },
    );
  }

  dentistasDoProcedimento(idProcedimento: number, inicio: string, fim: string): Observable<DentistaDoProcedimento[]> {
    return this.http.get<DentistaDoProcedimento[]>(
      `${this.API}/relatorios/procedimento/${idProcedimento}/dentistas`,
      { params: this.periodoParams(inicio, fim) },
    );
  }

  private filtroParams(filtro: RelatorioFiltro, comStatus: boolean): HttpParams {
    let params = new HttpParams();
    if (filtro.idPaciente != null) params = params.set('idPaciente', filtro.idPaciente);
    if (filtro.idDentista != null) params = params.set('idDentista', filtro.idDentista);
    if (filtro.idEspecialidade != null) params = params.set('idEspecialidade', filtro.idEspecialidade);
    if (filtro.idUsuario != null) params = params.set('idUsuario', filtro.idUsuario);
    if (comStatus && filtro.status) params = params.set('status', filtro.status);
    if (filtro.inicio) params = params.set('inicio', filtro.inicio);
    if (filtro.fim) params = params.set('fim', filtro.fim);
    return params;
  }

  private periodoParams(inicio: string, fim: string): HttpParams {
    let params = new HttpParams();
    if (inicio) params = params.set('inicio', inicio);
    if (fim) params = params.set('fim', fim);
    return params;
  }
}
