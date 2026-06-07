import { Component, OnInit, inject } from '@angular/core';
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
export class DashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private consultaService = inject(ConsultaService);
  private pacienteService = inject(PacienteService);

  nome = this.auth.getNome() ?? '';
  perfil = this.auth.getPerfil() ?? '';

  consultasHoje: Consulta[] = [];
  totalHoje = 0;
  totalPendentes = 0;
  totalPacientes = 0;

  ngOnInit(): void {
    this.consultaService.getAll().subscribe({
      next: (consultas) => {
        const hoje = new Date().toDateString();
        this.consultasHoje = consultas.filter(
          (c) => new Date(c.dataInicio).toDateString() === hoje,
        );
        this.totalHoje = this.consultasHoje.length;
        this.totalPendentes = consultas.filter((c) => c.status === 'AGENDADA').length;
      },
    });

    this.pacienteService.getAll().subscribe({
      next: (pacientes) => (this.totalPacientes = pacientes.length),
    });
  }

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
