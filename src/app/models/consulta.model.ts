export type StatusConsulta = 'AGENDADA' | 'CANCELADA' | 'FINALIZADA';

export interface ItemConsulta {
  idProcedimento?: number;
  nome: string;
  valor: number;
}

export interface Consulta {
  id: number;
  descricao: string;
  motivoCancelamento?: string;
  dataInicio: string;
  dataFim: string;
  dataRegistro?: string;
  status: StatusConsulta;
  valor?: number;
  procedimentos?: ItemConsulta[];
  idPaciente?: number;
  nomePaciente?: string;
  idDentista?: number;
  nomeDentista?: string;
  paciente?: { id: number; nome: string };
  dentista?: { id: number; nome: string };
}

export interface CriarConsultaItem {
  idProcedimento: number;
  valor: number;
}

export interface CriarConsultaBody {
  idPaciente: number;
  idDentista: number | null;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  procedimentos: CriarConsultaItem[];
}
