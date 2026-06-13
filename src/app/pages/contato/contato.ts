import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface ContatoForm {
  nome: string;
  assunto: string;
  mensagem: string;
}

@Component({
  selector: 'app-contato',
  imports: [FormsModule],
  templateUrl: './contato.html',
  styleUrl: './contato.scss',
})
export class ContatoComponent {
  private auth = inject(AuthService);

  readonly whatsappNumero = '5511999999999';
  readonly whatsappLabel = '(11) 99999-9999';
  readonly email = 'contato@vitasmile.com';
  readonly endereco = 'Av. Paulista, 1000 - São Paulo, SP';
  readonly horario = 'Seg a Sex, 8h às 18h';

  form: ContatoForm = {
    nome: this.auth.getNome() ?? '',
    assunto: '',
    mensagem: '',
  };
  erro = '';

  enviar(): void {
    if (!this.form.mensagem.trim()) {
      this.erro = 'Escreva uma mensagem antes de enviar.';
      return;
    }
    this.erro = '';

    const nome = this.form.nome.trim() || 'não informado';
    const cabecalho = `Olá! Meu nome é ${nome}.`;
    const assunto = this.form.assunto.trim() ? `\nAssunto: ${this.form.assunto.trim()}` : '';
    const texto = `${cabecalho}${assunto}\n\n${this.form.mensagem.trim()}`;

    const url = `https://wa.me/${this.whatsappNumero}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  }
}
