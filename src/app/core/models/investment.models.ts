export interface Product {
  id: number;
  nome: string;
  tipo: string;
  taxaAnual: number;
  risco: string;
  aplicacaoMinima: number;
  liquidez: string;
  riskProfileId: number;
}

export interface Investment {
  id: number;
  userId: number;
  productId: number;
  valor: number;
  dataInicio: string;
  prazoMeses: number;
  valorAtual: number;
  produto?: Product;
}

export interface SimulationRequest {
  valorInicial: number;
  prazoMeses: number;
  produtoId: number;
}

export interface SimulationResponse {
  valorInicial: number;
  valorFinal: number;
  rendimentoTotal: number;
  prazoMeses: number;
  produto: Product;
  detalheMensal: {
    mes: number;
    saldo: number;
    rendimento: number;
  }[];
}

export interface PontuacaoHistoryEntry {
  id: number;
  clienteId: number;
  pontuacao: number;
  riskProfileId: number;
  riskProfileName: string;
  timestamp: string;
}

export interface PontuacaoHistoryResponse {
  clienteId: number;
  totalEntries: number;
  history: PontuacaoHistoryEntry[];
}
