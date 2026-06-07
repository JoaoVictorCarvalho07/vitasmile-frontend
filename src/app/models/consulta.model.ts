export type StatusConsulta = 'AGENDADA' | 'CANCELADA' | 'FINALIZADA';

export interface Consulta {
  id: number;
  descricao: string;
  motivoCancelamento?: string;
  dataInicio: string;
  dataFim: string;
  dataRegistro?: string;
  status: StatusConsulta;
  nomePaciente?: string;
  nomeDentista?: string;
  paciente?: { id: number; nome: string };
  dentista?: { id: number; nome: string };
}
