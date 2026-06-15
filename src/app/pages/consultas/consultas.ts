import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ConsultaService } from '../../services/consulta.service';
import { PacienteService } from '../../services/paciente.service';
import { DentistaService } from '../../services/dentista.service';
import { ProcedimentoService } from '../../services/procedimento.service';
import { AuthService } from '../../services/auth.service';
import { Consulta, CriarConsultaBody, StatusConsulta } from '../../models/consulta.model';
import { Paciente } from '../../models/paciente.model';
import { Dentista } from '../../models/dentista.model';
import { Procedimento } from '../../models/procedimento.model';
import { PAGE_SIZE_OPTIONS } from '../../models/page.model';

interface ItemForm {
  idProcedimento: number;
  nome: string;
  valor: number;
}

interface NovaConsultaForm {
  idPaciente: number | null;
  idDentista: number | null;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  itens: ItemForm[];
}

@Component({
  selector: 'app-consultas',
  imports: [FormsModule, DatePipe, LowerCasePipe, CurrencyPipe],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class ConsultasComponent {
  protected readonly consultaService = inject(ConsultaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly dentistaService = inject(DentistaService);
  private readonly procedimentoService = inject(ProcedimentoService);
  private readonly auth = inject(AuthService);

  protected readonly lista = this.consultaService.lista;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly isPaciente = this.auth.isPaciente();
  protected readonly isDentista = this.auth.isDentista();
  protected readonly isAdmin = this.auth.isAdmin();

  protected pacientes: Paciente[] = [];
  protected dentistas: Dentista[] = [];
  protected procedimentos: Procedimento[] = [];
  protected procedimentoSelecionadoId: number | null = null;

  filtroStatus: StatusConsulta | '' = '';
  filtroNomePaciente = '';
  filtroNomeDentista = '';
  filtroData = '';

  showModalNova = false;
  consultaEditandoId: number | null = null;
  novaConsulta: NovaConsultaForm = this.formVazio();
  erroNova = '';
  salvando = false;

  showModalCancelar = false;
  consultaParaCancelar: Consulta | null = null;
  motivoCancelamento = '';
  erroCancelar = '';
  cancelando = false;

  constructor() {
    this.pacienteService
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((d) => (this.pacientes = d));
    this.dentistaService
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((d) => (this.dentistas = d));
    this.procedimentoService
      .getAll()
      .pipe(takeUntilDestroyed())
      .subscribe((d) => (this.procedimentos = d));
    console.log(this.pacientes);
    console.log(this.dentistas);
  }

  get consultasFiltradas(): Consulta[] {
    return this.lista.items().filter((c) => {
      const nomePac = (c.nomePaciente ?? c.paciente?.nome ?? '').toLowerCase();
      const nomeDen = (c.nomeDentista ?? c.dentista?.nome ?? '').toLowerCase();
      const data = c.dataInicio?.substring(0, 10) ?? '';
      if (this.filtroStatus && c.status !== this.filtroStatus) return false;
      if (this.filtroNomePaciente && !nomePac.includes(this.filtroNomePaciente.toLowerCase()))
        return false;
      if (this.filtroNomeDentista && !nomeDen.includes(this.filtroNomeDentista.toLowerCase()))
        return false;
      if (this.filtroData && data !== this.filtroData) return false;
      return true;
    });
  }

  limparFiltros(): void {
    this.filtroStatus = '';
    this.filtroNomePaciente = '';
    this.filtroNomeDentista = '';
    this.filtroData = '';
  }

  abrirModalNova(): void {
    this.consultaEditandoId = null;
    this.novaConsulta = this.formVazio();
    this.procedimentoSelecionadoId = null;
    this.erroNova = '';
    this.showModalNova = true;
  }

  abrirModalEditar(c: Consulta): void {
    this.consultaEditandoId = c.id;
    this.novaConsulta = {
      idPaciente: c.idPaciente ?? null,
      idDentista: c.idDentista ?? null,
      descricao: c.descricao,
      data: c.dataInicio?.substring(0, 10) ?? '',
      horaInicio: c.dataInicio?.substring(11, 16) ?? '',
      horaFim: c.dataFim?.substring(11, 16) ?? '',
      itens: (c.procedimentos ?? []).map((p) => ({
        idProcedimento: p.idProcedimento ?? 0,
        nome: p.nome,
        valor: p.valor,
      })),
    };
    this.procedimentoSelecionadoId = null;
    this.erroNova = '';
    this.showModalNova = true;
  }

  fecharModalNova(): void {
    this.showModalNova = false;
  }

  adicionarItem(): void {
    const proc = this.procedimentos.find((p) => p.id === this.procedimentoSelecionadoId);
    if (!proc) return;
    if (this.novaConsulta.itens.some((i) => i.idProcedimento === proc.id)) return;
    this.novaConsulta.itens.push({
      idProcedimento: proc.id,
      nome: proc.nome,
      valor: proc.valorBase ?? 0,
    });
    this.procedimentoSelecionadoId = null;
  }

  removerItem(index: number): void {
    this.novaConsulta.itens.splice(index, 1);
  }

  get totalConsulta(): number {
    return this.novaConsulta.itens.reduce((soma, i) => soma + (Number(i.valor) || 0), 0);
  }

  salvarConsulta(): void {
    const { idPaciente, idDentista, descricao, data, horaInicio, horaFim } = this.novaConsulta;
    if (!idPaciente || (!this.isDentista && !idDentista) || !descricao || !data || !horaInicio || !horaFim) {
      this.erroNova = 'Preencha todos os campos.';
      return;
    }
    const body: CriarConsultaBody = {
      idPaciente,
      idDentista,
      descricao,
      dataInicio: `${data}T${horaInicio}`,
      dataFim: `${data}T${horaFim}`,
      procedimentos: this.novaConsulta.itens.map((i) => ({
        idProcedimento: i.idProcedimento,
        valor: Number(i.valor) || 0,
      })),
    };
    this.salvando = true;
    const requisicao = this.consultaEditandoId
      ? this.consultaService.editar(this.consultaEditandoId, body)
      : this.consultaService.create(body);
    requisicao.subscribe({
      next: () => {
        this.consultaService.invalidateAll();
        this.lista.reload();
        this.fecharModalNova();
        this.salvando = false;
      },
      error: () => {
        this.erroNova = 'Erro ao salvar consulta. Verifique os dados.';
        this.salvando = false;
      },
    });
  }

  abrirModalCancelar(c: Consulta): void {
    this.consultaParaCancelar = c;
    this.motivoCancelamento = '';
    this.erroCancelar = '';
    this.showModalCancelar = true;
  }

  fecharModalCancelar(): void {
    this.showModalCancelar = false;
    this.consultaParaCancelar = null;
  }

  confirmarCancelamento(): void {
    if (!this.motivoCancelamento.trim()) {
      this.erroCancelar = 'O motivo é obrigatório.';
      return;
    }
    this.cancelando = true;
    this.consultaService
      .cancelar(this.consultaParaCancelar!.id, this.motivoCancelamento)
      .subscribe({
        next: () => {
          this.consultaService.invalidateAll();
          this.lista.reload();
          this.fecharModalCancelar();
          this.cancelando = false;
        },
        error: () => {
          this.erroCancelar = 'Erro ao cancelar consulta.';
          this.cancelando = false;
        },
      });
  }

  finalizar(c: Consulta): void {
    this.consultaService.finalizar(c.id).subscribe({
      next: () => {
        this.consultaService.invalidateAll();
        this.lista.reload();
      },
    });
  }

  getNomePaciente(c: Consulta): string {
    return c.nomePaciente ?? c.paciente?.nome ?? '—';
  }

  getNomeDentista(c: Consulta): string {
    return c.nomeDentista ?? c.dentista?.nome ?? '—';
  }

  private formVazio(): NovaConsultaForm {
    return {
      idPaciente: null,
      idDentista: null,
      descricao: '',
      data: '',
      horaInicio: '',
      horaFim: '',
      itens: [],
    };
  }
}
