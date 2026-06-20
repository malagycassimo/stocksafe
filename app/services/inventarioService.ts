import { api } from './api';

export interface InventarioInput {
  dateAgenda: string;
  responsavel: string;
}

export interface InventarioResponse {
  id: string;
  codigo: string;
  status: string;
  dateAgenda: string;
  createdAt: string;
}

export interface ContagemItemInput {
  produtoId: string;
  quantidadeContada: number;
}

export interface ContagemResponse {
  id: string;
  status: string;
  divergenciasEncontradas: number;
}

export interface AjusteInput {
  itensAprovados: string[];
  itensRejeitados: string[];
  justificativaAjuste: string;
}

export interface AjusteResponse {
  status: string;
  mensagem: string;
}

export const inventarioService = {
  listar: async (): Promise<InventarioResponse[]> => {
    const response = await api.get('/inventarios');
    return response.data;
  },

  obterPorId: async (id: string): Promise<any> => {
    const response = await api.get(`/inventarios/${id}`);
    return response.data;
  },

  createInventario: async (dados: InventarioInput): Promise<InventarioResponse> => {
    const response = await api.post('/inventarios', dados);
    return response.data;
  },

  submeterContagem: async (id: string, itens: ContagemItemInput[]): Promise<ContagemResponse> => {
    const response = await api.post(`/inventarios/${id}/contar`, { itens });
    return response.data;
  },

  ajustarInventario: async (id: string, dados: AjusteInput): Promise<AjusteResponse> => {
    const response = await api.post(`/inventarios/${id}/ajustar`, dados);
    return response.data;
  }
};
