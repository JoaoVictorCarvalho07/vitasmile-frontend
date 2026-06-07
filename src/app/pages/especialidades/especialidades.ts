import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EspecialidadeService } from '../../services/especialidade.service';
import { Especialidade } from '../../models/especialidade.model';

interface EspecialidadeForm {
  nome: string;
  descricao: string;
}

@Component({
  selector: 'app-especialidades',
  imports: [FormsModule],
  templateUrl: './especialidades.html',
  styleUrl: './especialidades.scss',
})
export class EspecialidadesComponent implements OnInit {
  private especialidadeService = inject(EspecialidadeService);

  especialidades: Especialidade[] = [];
  showModal = false;
  form: EspecialidadeForm = this.formVazio();
  erro = '';
  salvando = false;

  ngOnInit(): void {
    this.especialidadeService.getAll().subscribe({ next: (d) => (this.especialidades = d) });
  }

  abrirModal(): void {
    this.form = this.formVazio();
    this.erro = '';
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  salvar(): void {
    if (!this.form.nome.trim()) {
      this.erro = 'O nome é obrigatório.';
      return;
    }
    this.salvando = true;
    this.especialidadeService.create(this.form).subscribe({
      next: (nova) => {
        this.especialidades = [...this.especialidades, nova];
        this.fecharModal();
        this.salvando = false;
      },
      error: () => {
        this.erro = 'Erro ao cadastrar especialidade.';
        this.salvando = false;
      },
    });
  }

  private formVazio(): EspecialidadeForm {
    return { nome: '', descricao: '' };
  }
}
