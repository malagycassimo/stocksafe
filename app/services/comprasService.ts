import { api } from './api';

export interface RFQItemInput {
  produtoId: string;
  quantidade: number;
}

export interface RFQInput {
  dataLimite: string;
  items: RFQItemInput[];
}

export interface RFQResponse {
  id: string;
  codigo: string;
  status: string;
  dataLimite: string;
  createdAt: string;
}

export interface PropostaItemInput {
  produtoId: string;
  precoUnitario: number;
  quantidade: number;
}

export interface PropostaInput {
  rfqId: string;
  fornecedorId: string;
  prazoEntrega: number;
  itens: PropostaItemInput[];
}

export interface PropostaResponse {
  id: string;
  rfqId: string;
  fornecedorId: string;
  status: string;
  prazoEntrega: number;
}

export interface ComparativoPropostasResponse {
  rfqId: string;
  codigo: string;
  propostas: {
    propostaId: string;
    fornecedorNome: string;
    prazoEntrega: number;
    valorTotal: number;
    itens: {
      produtoSku: string;
      produtoDescricao: string;
      precoUnitario: number;
      quantidade: number;
    }[];
  }[];
}

export const comprasService = {
  listarRFQs: async (): Promise<any[]> => {
    const response = await api.get('/rfqs');
    return response.data;
  },

  obterRFQ: async (id: string): Promise<any> => {
    const response = await api.get(`/rfqs/${id}`);
    return response.data;
  },

  createRFQ: async (dados: RFQInput): Promise<RFQResponse> => {
    const response = await api.post('/rfqs', dados);
    return response.data;
  },

  submitProposta: async (dados: PropostaInput): Promise<PropostaResponse> => {
    const response = await api.post('/propostas', dados);
    return response.data;
  },

  getComparativoPropostas: async (rfqId: string): Promise<ComparativoPropostasResponse> => {
    const response = await api.get(`/rfqs/${rfqId}/propostas`);
    return response.data;
  },

  listarPOs: async (): Promise<any[]> => {
    const response = await api.get('/purchase-orders');
    return response.data;
  },

  createPO: async (dados: {
    codigo: string;
    fornecedorId: string;
    propostaId?: string;
    totalValue: number;
    expectedDelivery: string;
  }): Promise<any> => {
    const response = await api.post('/purchase-orders', dados);
    return response.data;
  },

  obterPO: async (id: string): Promise<any> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  },

  cancelarRFQ: async (id: string): Promise<any> => {
    const response = await api.delete(`/rfqs/${id}`);
    return response.data;
  },

  cancelarPO: async (id: string): Promise<any> => {
    const response = await api.delete(`/purchase-orders/${id}`);
    return response.data;
  }
};
