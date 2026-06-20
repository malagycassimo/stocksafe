import { api } from './api';
import { FornecedorData } from './fornecedorService';

export interface CheckInInput {
  placaVeiculo: string;
  motoristaNome: string;
  transportador: string;
  poCodigo: string;
}

export interface CheckInResponse {
  id: string;
  codigoCheckIn: string;
  status: string;
  createdAt: string;
}

export interface ConferenciaItemInput {
  produtoId: string;
  quantidadePedido: number;
  quantidadeNota: number;
  quantidadeFisica: number;
  divergente: boolean;
}

export interface ConferenciaInput {
  poId: string;
  numeroNotaFiscal: string;
  valorTotalNf: number;
  itens: ConferenciaItemInput[];
}

export interface ConferenciaResponse {
  id: string;
  poId: string;
  divergenciaTotal: number;
  status: string;
}

export interface PurchaseOrderInput {
  codigo: string;
  fornecedorId: string;
  propostaId?: string;
  totalValue: number;
  expectedDelivery: string;
}

export interface PurchaseOrderData {
  id: string;
  codigo: string;
  fornecedorId: string;
  fornecedor: FornecedorData;
  propostaId?: string | null;
  totalValue: number;
  status: 'EMITIDO' | 'CONFIRMADO' | 'FATURADO' | 'ATRASADO';
  expectedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export const recebimentoService = {
  createCheckIn: async (dados: CheckInInput): Promise<CheckInResponse> => {
    const response = await api.post('/recebimento/checkin', dados);
    return response.data;
  },

  submitConferencia: async (dados: ConferenciaInput): Promise<ConferenciaResponse> => {
    const response = await api.post('/recebimento/conferencia', dados);
    return response.data;
  },

  createPurchaseOrder: async (dados: PurchaseOrderInput): Promise<PurchaseOrderData> => {
    const response = await api.post('/purchase-orders', dados);
    return response.data;
  },

  listPurchaseOrders: async (): Promise<PurchaseOrderData[]> => {
    const response = await api.get('/purchase-orders');
    return response.data;
  },

  getPurchaseOrder: async (id: string): Promise<PurchaseOrderData & { checkIn?: CheckInResponse | null; itens: any[] }> => {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data;
  }
};
