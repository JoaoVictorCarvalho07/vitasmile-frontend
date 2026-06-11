import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ConsultaService } from '../../services/consulta.service';
import { PacienteService } from '../../services/paciente.service';
import { Consulta } from '../../models/consulta.model';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private consultaService = inject(ConsultaService);
  private pacienteService = inject(PacienteService);

  nome = this.auth.getNome() ?? '';
  perfil = this.auth.getPerfil() ?? '';

  private reload = signal(0);
  private todasConsultas = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.consultaService.getAll())),
    { initialValue: [] as Consulta[] },
  );

  recarregar(): void {
    this.consultaService.invalidateAll();
    this.pacienteService.lista.reload();
    this.reload.update((t) => t + 1);
  }

  protected consultasHoje = computed(() => {
    const hoje = new Date().toDateString();
    return this.todasConsultas().filter(
      (c) => new Date(c.dataInicio).toDateString() === hoje,
    );
  });

  protected totalHoje = computed(() => this.consultasHoje().length);
  protected totalPendentes = computed(() =>
    this.todasConsultas().filter((c) => c.status === 'AGENDADA').length,
  );
  protected totalPacientes = computed(() => this.pacienteService.lista.totalElements());

  get dataHoje(): string {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  getNomePaciente(c: Consulta): string {
    return c.nomePaciente ?? c.paciente?.nome ?? '—';
  }

  getNomeDentista(c: Consulta): string {
    return c.nomeDentista ?? c.dentista?.nome ?? '—';
  }
}
