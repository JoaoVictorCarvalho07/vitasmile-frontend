import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { ConsultaService } from '../../services/consulta.service';
import { PacienteService } from '../../services/paciente.service';
import { DentistaService } from '../../services/dentista.service';
import { Consulta, StatusConsulta } from '../../models/consulta.model';
import { Paciente } from '../../models/paciente.model';
import { Dentista } from '../../models/dentista.model';
import { PAGE_SIZE_OPTIONS } from '../../models/page.model';

interface NovaConsultaForm {
  idPaciente: number | null;
  idDentista: number | null;
  descricao: string;
  dataInicio: string;
  dataFim: string;
}

@Component({
  selector: 'app-consultas',
  imports: [FormsModule, DatePipe, LowerCasePipe],
  templateUrl: './consultas.html',
  styleUrl: './consultas.scss',
})
export class ConsultasComponent {
  protected readonly consultaService = inject(ConsultaService);
  private readonly pacienteService = inject(PacienteService);
  private readonly dentistaService = inject(DentistaService);

  protected readonly lista = this.consultaService.lista;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected pacientes: Paciente[] = [];
  protected dentistas: Dentista[] = [];

  filtroStatus: StatusConsulta | '' = '';
  filtroNomePaciente = '';
  filtroNomeDentista = '';
  filtroData = '';

  showModalNova = false;
  novaConsulta: NovaConsultaForm = this.formVazio();
  erroNova = '';
  salvando = false;

  showModalCancelar = false;
  consultaParaCancelar: Consulta | null = null;
  motivoCancelamento = '';
  erroCancelar = '';
  cancelando = false;

  constructor() {
    this.pacienteService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.pacientes = d));
    this.dentistaService.getAll().pipe(takeUntilDestroyed()).subscribe((d) => (this.dentistas = d));
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
    this.novaConsulta = this.formVazio();
    this.erroNova = '';
    this.showModalNova = true;
  }

  fecharModalNova(): void {
    this.showModalNova = false;
  }

  salvarConsulta(): void {
    const { idPaciente, idDentista, descricao, dataInicio, dataFim } = this.novaConsulta;
    if (!idPaciente || !idDentista || !descricao || !dataInicio || !dataFim) {
      this.erroNova = 'Preencha todos os campos.';
      return;
    }
    this.salvando = true;
    this.consultaService.create(this.novaConsulta as Partial<Consulta>).subscribe({
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
    this.consultaService.cancelar(this.consultaParaCancelar!.id, this.motivoCancelamento).subscribe({
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
    return { idPaciente: null, idDentista: null, descricao: '', dataInicio: '', dataFim: '' };
  }
}
