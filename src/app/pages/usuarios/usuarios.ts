import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';
import { Usuario, PerfilUsuario } from '../../models/usuario.model';
import { PAGE_SIZE_OPTIONS } from '../../models/page.model';

interface UsuarioForm {
  nome: string;
  email: string;
  cpf: string;
  perfil: PerfilUsuario;
  senha: string;
}

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent {
  private usuarioService = inject(UsuarioService);

  readonly lista = this.usuarioService.lista;
  readonly tamanhos = PAGE_SIZE_OPTIONS;
  readonly perfis: PerfilUsuario[] = ['ADMIN', 'DENTISTA', 'PACIENTE'];

  busca = signal('');
  toggling = signal<ReadonlySet<number>>(new Set());

  showModal = signal(false);
  editando = signal<Usuario | null>(null);
  erro = signal('');
  salvando = signal(false);
  form: UsuarioForm = this.formVazio();

  readonly usuariosFiltrados = computed(() => {
    const termo = this.busca().toLowerCase();
    const itens = this.lista.items();
    if (!termo) return itens;
    return itens.filter(
      (u) =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        u.cpf.includes(termo),
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

  abrirModalEditar(u: Usuario): void {
    this.editando.set(u);
    this.form = { nome: u.nome, email: u.email, cpf: u.cpf, perfil: u.perfil, senha: '' };
    this.erro.set('');
    this.showModal.set(true);
  }

  fecharModal(): void {
    this.showModal.set(false);
    this.editando.set(null);
  }

  salvar(): void {
    if (!this.form.nome || !this.form.email || !this.form.cpf || !this.form.perfil) {
      this.erro.set('Nome, e-mail, CPF e perfil são obrigatórios.');
      return;
    }
    if (!this.editando() && !this.form.senha) {
      this.erro.set('A senha é obrigatória para novos usuários.');
      return;
    }
    this.salvando.set(true);

    const editando = this.editando();
    const requisicao = editando
      ? this.usuarioService.update(editando.id, this.form)
      : this.usuarioService.create(this.form);

    requisicao.subscribe({
      next: () => {
        this.lista.reload();
        this.fecharModal();
        this.salvando.set(false);
      },
      error: () => {
        this.erro.set('Erro ao salvar usuário.');
        this.salvando.set(false);
      },
    });
  }

  toggleAtivo(u: Usuario): void {
    if (this.toggling().has(u.id)) return;
    this.toggling.update((s) => new Set(s).add(u.id));

    this.usuarioService.setAtivo(u.id, !u.ativo).subscribe({
      next: () => {
        this.lista.reload();
        this.removerToggling(u.id);
      },
      error: () => this.removerToggling(u.id),
    });
  }

  private removerToggling(id: number): void {
    this.toggling.update((s) => {
      const proximo = new Set(s);
      proximo.delete(id);
      return proximo;
    });
  }

  private formVazio(): UsuarioForm {
    return { nome: '', email: '', cpf: '', perfil: 'PACIENTE', senha: '' };
  }
}
