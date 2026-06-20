import { api } from './api';

export interface PickingItemInput {
  produtoId: string;
  quantidade: number;
}

export interface PickingOrderInput {
  solicitante: string;
  itens: PickingItemInput[];
}

export interface PickingOrderResponse {
  id: string;
  codigo: string;
  status: string;
}

export interface ItemSeparadoInput {
  produtoId: string;
  loteSeparado: string;
  quantidadeSeparada: number;
}

export interface ConcluirPickingInput {
  pickingId: string;
  itensSeparados: ItemSeparadoInput[];
}

export interface ConcluirPickingResponse {
  pickingId: string;
  status: string;
  fefoViolado: boolean;
  mensagem: string;
}

export const expedicaoService = {
  listPickingOrders: async (): Promise<any[]> => {
    const response = await api.get('/expedicao/ordens');
    return response.data;
  },

  obterPickingOrder: async (id: string): Promise<any> => {
    const response = await api.get(`/expedicao/ordens/${id}`);
    return response.data;
  },

  createPickingOrder: async (dados: PickingOrderInput): Promise<PickingOrderResponse> => {
    const response = await api.post('/expedicao/ordens', dados);
    return response.data;
  },

  concluirPicking: async (dados: ConcluirPickingInput): Promise<ConcluirPickingResponse> => {
    const response = await api.post('/expedicao/picking/concluir', dados);
    return response.data;
  }
};
