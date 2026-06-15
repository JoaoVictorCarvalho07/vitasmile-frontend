import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class LandingComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly whatsappNumero = '5511999999999';
  readonly whatsappLabel = '(11) 99999-9999';
  readonly email = 'contato@vitasmile.com';
  readonly endereco = 'Av. Paulista, 1000 - São Paulo, SP';
  readonly horario = 'Seg a Sex, 8h às 18h';

  readonly diferenciais = [
    { titulo: 'Profissionais especializados', descricao: 'Equipe qualificada nas principais áreas da odontologia.' },
    { titulo: 'Atendimento humanizado', descricao: 'Cuidado próximo e atenção em cada etapa do tratamento.' },
    { titulo: 'Estrutura moderna', descricao: 'Tecnologia e conforto do diagnóstico ao acompanhamento.' },
  ];

  readonly especialidades = [
    'Ortodontia', 'Clínico Geral', 'Periodontia',
    'Endodontia', 'Implantodontia', 'Odontopediatria',
  ];

  entrar(): void {
    this.router.navigate([this.auth.isLoggedIn() ? '/dashboard' : '/login']);
  }

  abrirWhatsapp(): void {
    const texto = encodeURIComponent('Olá! Gostaria de agendar uma consulta na VitaSmile.');
    window.open(`https://wa.me/${this.whatsappNumero}?text=${texto}`, '_blank');
  }
}
