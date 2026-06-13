import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RelatorioService } from '../../services/relatorio.service';
import { PacienteService } from '../../services/paciente.service';
import { DentistaService } from '../../services/dentista.service';
import { EspecialidadeService } from '../../services/especialidade.service';
import { UsuarioService } from '../../services/usuario.service';
import { ProcedimentoService } from '../../services/procedimento.service';
import { Paciente } from '../../models/paciente.model';
import { Dentista } from '../../models/dentista.model';
import { Especialidade } from '../../models/especialidade.model';
import { Usuario } from '../../models/usuario.model';
import { Procedimento } from '../../models/procedimento.model';
import { Consulta } from '../../models/consulta.model';
import { Page, PAGE_SIZE_OPTIONS } from '../../models/page.model';
import {
  DentistaDoProcedimento,
  FaturamentoDentista,
  ProcedimentoDoDentista,
  RelatorioFiltro,
  RelatorioResumo,
  filtroVazio,
} from '../../models/relatorio.model';

@Component({
  selector: 'app-relatorios',
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosComponent {
  private relatorioService = inject(RelatorioService);
  private pacienteService = inject(PacienteService);
  private dentistaService = inject(DentistaService);
  private especialidadeService = inject(EspecialidadeService);
  private usuarioService = inject(UsuarioService);
  private procedimentoService = inject(ProcedimentoService);

  readonly tamanhos = PAGE_SIZE_OPTIONS;

  protected pacientes: Paciente[] = [];
  protected dentistas: Dentista[] = [];
  protected especialidades: Especialidade[] = [];
  protected usuarios: Usuario[] = [];
  protected procedimentos: Procedimento[] = [];

  filtro: RelatorioFiltro = filtroVazio();

  carregando = signal(false);
  erro = signal('');
  buscou = signal(false);

  resumo = signal<RelatorioResumo | null>(null);
  consultas = signal<Page<Consulta> | null>(null);
  dentistasDoProcedimento = signal<DentistaDoProcedimento[]>([]);

  pageIndex = signal(0);
  pageSize = signal(10);

  showModal = signal(false);
  dentistaModal = signal<FaturamentoDentista | null>(null);
  procedimentosModal = signal<ProcedimentoDoDentista[]>([]);
  carregandoModal = signal(false);

  constructor() {
    this.pacienteService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.pacientes = d));
    this.dentistaService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.dentistas = d));
    this.especialidadeService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.especialidades = d));
    this.usuarioService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.usuarios = d));
    this.procedimentoService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.procedimentos = d));
  }

  buscar(): void {
    this.pageIndex.set(0);
    this.buscou.set(true);
    this.carregarResumo();
    this.carregarConsultas();
    this.carregarDentistasDoProcedimento();
  }

  limpar(): void {
    this.filtro = filtroVazio();
    this.resumo.set(null);
    this.consultas.set(null);
    this.dentistasDoProcedimento.set([]);
    this.buscou.set(false);
    this.erro.set('');
  }

  private carregarResumo(): void {
    this.relatorioService.resumo(this.filtro).subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.erro.set('Erro ao carregar o resumo.'),
    });
  }

  private carregarConsultas(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.relatorioService.buscarConsultas(this.filtro, this.pageIndex(), this.pageSize()).subscribe({
      next: (p) => {
        this.consultas.set(p);
        this.carregando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao carregar as consultas.');
        this.carregando.set(false);
      },
    });
  }

  private carregarDentistasDoProcedimento(): void {
    if (this.filtro.idProcedimento == null) {
      this.dentistasDoProcedimento.set([]);
      return;
    }
    this.relatorioService
      .dentistasDoProcedimento(this.filtro.idProcedimento, this.filtro.inicio, this.filtro.fim)
      .subscribe({ next: (d) => this.dentistasDoProcedimento.set(d) });
  }

  mudarTamanho(valor: string): void {
    this.pageSize.set(Number(valor));
    this.pageIndex.set(0);
    this.carregarConsultas();
  }

  proxima(): void {
    const p = this.consultas();
    if (p && !p.last) {
      this.pageIndex.update((i) => i + 1);
      this.carregarConsultas();
    }
  }

  anterior(): void {
    const p = this.consultas();
    if (p && !p.first) {
      this.pageIndex.update((i) => i - 1);
      this.carregarConsultas();
    }
  }

  abrirModalDentista(d: FaturamentoDentista): void {
    this.dentistaModal.set(d);
    this.procedimentosModal.set([]);
    this.carregandoModal.set(true);
    this.showModal.set(true);
    this.relatorioService
      .procedimentosDoDentista(d.idDentista, this.filtro.inicio, this.filtro.fim)
      .subscribe({
        next: (p) => {
          this.procedimentosModal.set(p);
          this.carregandoModal.set(false);
        },
        error: () => this.carregandoModal.set(false),
      });
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.dentistaModal.set(null);
  }

  ticket(total: number, qtd: number): number {
    return qtd > 0 ? total / qtd : 0;
  }

  procedimentoSelecionadoNome(): string {
    const p = this.procedimentos.find((x) => x.id === this.filtro.idProcedimento);
    return p ? p.nome : '';
  }
}
