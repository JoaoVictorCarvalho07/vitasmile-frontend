import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PacienteService } from '../../services/paciente.service';
import { Paciente } from '../../models/paciente.model';
import { PAGE_SIZE_OPTIONS } from '../../models/page.model';

interface PacienteForm {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
}

@Component({
  selector: 'app-pacientes',
  imports: [FormsModule, DatePipe],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.scss',
})
export class PacientesComponent {
  private pacienteService = inject(PacienteService);

  readonly lista = this.pacienteService.lista;
  readonly tamanhos = PAGE_SIZE_OPTIONS;

  busca = signal('');
  showModal = signal(false);
  editando = signal<Paciente | null>(null);
  erro = signal('');
  salvando = signal(false);
  form: PacienteForm = this.formVazio();

  readonly pacientesFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
    const itens = this.lista.items();
    if (!termo) return itens;
    return itens.filter(
      (p) => p.nome.toLowerCase().includes(termo) || p.cpf.includes(termo),
    );
  });

  mudarTamanho(valor: string): void {
    this.lista.setSize(Number(valor));
  }

  abrirModalCriar(): void {
    this.editando.set(null);
    this.form = this.formVazio();
    this.erro.set('');
    this.showModal.set(true);
  }

  abrirModalEditar(p: Paciente): void {
    this.editando.set(p);
    this.form = { nome: p.nome, email: p.email, cpf: p.cpf, telefone: p.telefone ?? '', senha: '' };
    this.erro.set('');
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.editando.set(null);
  }

  salvar(): void {
    if (!this.form.nome || !this.form.email || !this.form.cpf) {
      this.erro.set('Nome, e-mail e CPF são obrigatórios.');
      return;
    }
    if (!this.editando() && !this.form.senha) {
      this.erro.set('A senha é obrigatória para novos pacientes.');
      return;
    }
    this.salvando.set(true);

    const editando = this.editando();
    if (editando) {
      this.pacienteService.update(editando.id, this.form).subscribe({
        next: () => {
          this.lista.reload();
          this.fecharModal();
          this.salvando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao atualizar paciente.');
          this.salvando.set(false);
        },
      });
    } else {
      this.pacienteService.create(this.form).subscribe({
        next: () => {
          this.lista.reload();
          this.fecharModal();
          this.salvando.set(false);
        },
        error: () => {
          this.erro.set('Erro ao cadastrar paciente.');
          this.salvando.set(false);
        },
      });
    }
  }

  private formVazio(): PacienteForm {
    return { nome: '', email: '', cpf: '', telefone: '', senha: '' };
  }
}
