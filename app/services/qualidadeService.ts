import { api } from './api';

export interface InspecaoInput {
  loteEstoqueId: string;
  statusAprovado: boolean;
  parecerTecnico: string;
  temperatura?: number;
  lacreIntegro?: boolean;
  embalagemIntegra?: boolean;
  usuarioId: string;
}

export interface InspecaoResponse {
  id: string;
  loteEstoqueId: string;
  statusAprovado: boolean;
  statusLoteEstoque: 'DISPONIVEL' | 'BLOQUEADO';
  createdAt: string;
}

export interface QuarantineItem {
  id: string;
  produto_id: string;
  produto: {
    id: string;
    sku: string;
    descricao: string;
    categoria: string;
    unidade_medida: string;
    preco_custo: number;
  };
  codigo_lote: string;
  data_fabricacao?: string;
  data_validade: string;
  local_id: string;
  local: {
    id: string;
    codigo: string;
    nome: string;
  };
  quantidade: number;
  valor_unitario: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionHistoryItem {
  id: string;
  loteEstoqueId: string;
  statusAprovado: boolean;
  parecerTecnico: string;
  temperatura?: number;
  lacreIntegro: boolean;
  embalagemIntegra: boolean;
  usuarioId: string;
  createdAt: string;
  lote?: {
    codigo_lote: string;
    quantidade: number;
    produto?: {
      sku: string;
      descricao: string;
      categoria: string;
    };
  };
}

export const qualidadeService = {
  createInspecao: async (dados: InspecaoInput): Promise<InspecaoResponse> => {
    const response = await api.post('/qualidade/inspecao', dados);
    return response.data;
  },

  listQuarentena: async (): Promise<QuarantineItem[]> => {
    const response = await api.get('/qualidade/quarentena');
    return response.data;
  },

  getQuarantineItem: async (id: string): Promise<QuarantineItem> => {
    const response = await api.get(`/qualidade/quarentena/${id}`);
    return response.data;
  },

  listInspecoes: async (): Promise<InspectionHistoryItem[]> => {
    const response = await api.get('/qualidade/inspecao');
    return response.data;
  }
};
