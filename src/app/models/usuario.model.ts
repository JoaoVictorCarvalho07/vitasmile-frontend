export type PerfilUsuario = 'ADMIN' | 'DENTISTA' | 'PACIENTE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  perfil: PerfilUsuario;
  ativo: boolean;
}
