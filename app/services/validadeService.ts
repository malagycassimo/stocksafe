import { api } from './api';

export interface ValidadeMetricas {
  alertaBanner: {
    vencidos24h: {
      quantidade: number;
      valor: number;
    };
    vencendoHoje: number;
  };
  cards: {
    vencidos: { lotes: number; valor: number };
    menos7dias: { lotes: number; valor: number; percentagemEstoque: number };
    menos15dias: { lotes: number; valor: number; percentagemEstoque: number };
    menos30dias: { lotes: number; valor: number };
    de31a60dias: { lotes: number; valor: number };
    de61a90dias: { lotes: number; valor: number };
  };
  kpis: {
    valorTotalEmRisco: number;
    percentagemEmRisco: number;
    taxaPerda: number;
    diasMediosVencimento: number;
    produtosCampanha: number;
  };
  totalEstoqueValor: number;
  totalQuantidadeAtiva: number;
}

export interface ProdutoCritico {
  id: string;
  criticidade: 'MUITO_CRITICA' | 'CRITICA' | 'ATENCAO' | 'BAIXA';
  criticidadeSemaforo: string;
  produto: {
    sku: string;
    descricao: string;
    categoria: string;
  };
  lote: string;
  validade: string;
  validadeTexto: string;
  diasRestantes: number;
  percentagemVidaUtil: number;
  quantidade: number;
  unidadeMedida: string;
  valorUnitario: number;
  valorTotal: number;
  local: string;
  status: string;
}

export interface ProdutosCriticosResponse {
  items: ProdutoCritico[];
  resumo: {
    totalLinhas: number;
    totalQuantidade: number;
    valorTotalRisco: number;
  };
}

export const validadeService = {
  obterMetricas: async (): Promise<ValidadeMetricas> => {
    const response = await api.get('/validade/metricas');
    return response.data;
  },

  listarProdutosCriticos: async (filtros?: {
    search?: string;
    categoria?: string;
    status?: string;
  }): Promise<ProdutosCriticosResponse> => {
    const response = await api.get('/validade/produtos-criticos', { params: filtros });
    return response.data;
  },

  descartar: async (loteId: string, usuarioId?: string) => {
    const response = await api.post('/validade/descartar', { loteId, usuarioId });
    return response.data;
  },

  descartarEmMassa: async (usuarioId?: string) => {
    const response = await api.post('/validade/descartar-em-massa', { usuarioId });
    return response.data;
  },

  colocarEmCampanha: async (loteId: string) => {
    const response = await api.post('/validade/campanha', { loteId });
    return response.data;
  },

  criarCampanhaValidade: async (dados: { descontoPct: number; loteIds: string[] }) => {
    const response = await api.post('/validade/campanhas', dados);
    return response.data;
  }
};
