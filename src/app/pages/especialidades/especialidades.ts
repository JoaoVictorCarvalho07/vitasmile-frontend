import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
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
export class EspecialidadesComponent {
  private especialidadeService = inject(EspecialidadeService);

  private readonly reload = signal(0);
  readonly especialidades = toSignal(
    toObservable(this.reload).pipe(switchMap(() => this.especialidadeService.getAll())),
    { initialValue: [] as Especialidade[] },
  );

  showModal = signal(false);
  erro = signal('');
  salvando = signal(false);
  form: EspecialidadeForm = this.formVazio();

  recarregar(): void {
    this.especialidadeService.invalidateAll();
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
    this.especialidadeService.create(this.form).subscribe({
      next: () => {
        this.especialidadeService.invalidateAll();
        this.reload.update((t) => t + 1);
        this.fecharModal();
        this.salvando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao cadastrar especialidade.');
        this.salvando.set(false);
      },
    });
  }

  private formVazio(): EspecialidadeForm {
    return { nome: '', descricao: '' };
  }
}
