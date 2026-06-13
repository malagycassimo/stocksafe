import { api } from './api';
import { ProdutoData } from './produtoService';

export interface RequisicaoItemData {
    id?: string;
    produto_id: string;
    produto?: ProdutoData;
    quantidade: number;
    validade_min_proposta?: number;
    validade_min_tipo?: 'PERCENTAGEM' | 'DIAS';
    observacoes?: string;
}

export interface RequisicaoData {
    id?: string;
    codigo?: string;
    usuario_id?: string;
    solicitante_nome: string;
    departamento: string;
    centro_custo: string;
    date_criacao?: string;
    date_necessaria?: string;
    prioridade: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
    justificativa?: string;
    status?: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FULFILLED';
    justificativa_negacao?: string | null;
    itens: RequisicaoItemData[];
    createdAt?: string;
    updatedAt?: string;
}

export const requisicaoService = {
    // GET /requisicoes (Listar todas as requisições efetuadas)
    listarTodas: async (): Promise<RequisicaoData[]> => {
        const response = await api.get('/requisicoes');
        return response.data;
    },

    // GET /requisicoes/:id (Obter detalhes de uma requisição específica)
    buscarPorId: async (id: string): Promise<RequisicaoData> => {
        const response = await api.get(`/requisicoes/${id}`);
        return response.data;
    },

    // POST /requisicoes (Criar/registar uma nova requisição de material)
    criar: async (dados: RequisicaoData): Promise<RequisicaoData> => {
        const response = await api.post('/requisicoes', dados);
        return response.data;
    },

    // PATCH /requisicoes/:id/avaliar (Avaliar: aprovar ou rejeitar uma requisição pendente)
    avaliar: async (
        id: string,
        dados: { status: 'APPROVED' | 'REJECTED'; justificativa_negacao?: string }
    ): Promise<RequisicaoData> => {
        const response = await api.patch(`/requisicoes/${id}/avaliar`, dados);
        return response.data;
    }
};
