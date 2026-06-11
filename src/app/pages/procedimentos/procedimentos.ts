import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ProcedimentoService } from '../../services/procedimento.service';
import { EspecialidadeService } from '../../services/especialidade.service';
import { Procedimento } from '../../models/procedimento.model';
import { Especialidade } from '../../models/especialidade.model';

interface ProcedimentoForm {
  nome: string;
  descricao: string;
  valorBase: number | null;
  idEspecialidade: number | null;
}

@Component({
  selector: 'app-procedimentos',
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './procedimentos.html',
  styleUrl: './procedimentos.scss',
})
export class ProcedimentosComponent {
  private procedimentoService = inject(ProcedimentoService);
  private especialidadeService = inject(EspecialidadeService);

  private readonly reload = signal(0);
  readonly procedimentos = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.procedimentoService.getAll())),
    { initialValue: [] as Procedimento[] },
  );
  readonly especialidades = toSignal(this.especialidadeService.getAll(), {
    initialValue: [] as Especialidade[],
  });

  showModal = signal(false);
  erro = signal('');
  salvando = signal(false);
  form: ProcedimentoForm = this.formVazio();

  recarregar(): void {
    this.procedimentoService.invalidateAll();
    this.reload.update((t) => t + 1);
  }

  abrirModal(): void {
    this.form = this.formVazio();
    this.erro.set('');
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.showModal.set(false);
  }

  salvar(): void {
    if (!this.form.nome.trim()) {
      this.erro.set('O nome é obrigatório.');
      return;
    }
    this.salvando.set(true);
    this.procedimentoService.create(this.form).subscribe({
      next: () => {
        this.procedimentoService.invalidateAll();
        this.reload.update((t) => t + 1);
        this.fecharModal();
        this.salvando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao cadastrar procedimento.');
        this.salvando.set(false);
      },
    });
  }

  private formVazio(): ProcedimentoForm {
    return { nome: '', descricao: '', valorBase: null, idEspecialidade: null };
  }
}
