import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';

interface PacienteForm {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
}

@Component({
  selector: 'app-pacientes',
  imports: [FormsModule, DatePipe],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class PacientesComponent implements OnInit {
  private pacienteService = inject(PacienteService);

  pacientes: Paciente[] = [];
  busca = '';

  showModal = false;
  editando: Paciente | null = null;
  form: PacienteForm = this.formVazio();
  erro = '';
  salvando = false;

  ngOnInit(): void {
    this.pacienteService.getAll().subscribe({ next: (d) => (this.pacientes = d) });
  }

  get pacientesFiltrados(): Paciente[] {
    const termo = this.busca.toLowerCase();
    if (!termo) return this.pacientes;
    return this.pacientes.filter(
      (p) => p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo),
    );
  }

  abrirModalCriar(): void {
    this.editando = null;
    this.form = this.formVazio();
    this.erro = '';
    this.showModal = true;
  }

  abrirModalEditar(p: Paciente): void {
    this.editando = p;
    this.form = { nome: p.nome, email: p.email, cpf: p.cpf, telefone: p.telefone ?? '' };
    this.erro = '';
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
    this.editando = null;
  }

  salvar(): void {
    if (!this.form.nome || !this.form.email || !this.form.cpf) {
      this.erro = 'Nome, e-mail e CPF são obrigatórios.';
      return;
    }
    this.salvando = true;

    if (this.editando) {
      this.pacienteService.update(this.editando.id, this.form).subscribe({
        next: (atualizado) => {
          this.pacientes = this.pacientes.map((p) =>
            p.id === atualizado.id ? atualizado : p,
          );
          this.fecharModal();
          this.salvando = false;
        },
        error: () => {
          this.erro = 'Erro ao atualizar paciente.';
          this.salvando = false;
        },
      });
    } else {
      this.pacienteService.create(this.form).subscribe({
        next: (novo) => {
          this.pacientes = [novo, ...this.pacientes];
          this.fecharModal();
          this.salvando = false;
        },
        error: () => {
          this.erro = 'Erro ao cadastrar paciente.';
          this.salvando = false;
        },
      });
    }
  }

  private formVazio(): PacienteForm {
    return { nome: '', email: '', cpf: '', telefone: '' };
  }
}
