export interface FaturamentoDentista {
  idDentista: number;
  nomeDentista: string;
  quantidade: number;
  faturado: number;
}

export interface RelatorioResumo {
  faturado: number;
  qtdFinalizadas: number;
  ticketMedio: number;
  porDentista: FaturamentoDentista[];
}

export interface ProcedimentoDoDentista {
  procedimento: string;
  quantidade: number;
  total: number;
}

export interface DentistaDoProcedimento {
  dentista: string;
  quantidade: number;
  total: number;
}

export interface RelatorioFiltro {
  idPaciente: number | null;
  idDentista: number | null;
  idEspecialidade: number | null;
  idUsuario: number | null;
  idProcedimento: number | null;
  status: string;
  inicio: string;
  fim: string;
}

export function filtroVazio(): RelatorioFiltro {
  return {
    idPaciente: null,
    idDentista: null,
    idEspecialidade: null,
    idUsuario: null,
    idProcedimento: null,
    status: '',
    inicio: '',
    fim: '',
  };
}
