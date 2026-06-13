import { api } from './api';

// Interface para a tabela de lotes
export interface ItemEstoqueData {
    id: string;
    produto: {
        sku: string;
        descricao: string;
        unidade_medida: string;
    };
    lote: string;
    validade: string;
    dias_restantes: number;
    vencido: boolean;
    percentagem_vida_util: number;
    quantidade: number;
    local_id: string;
    local_codigo: string;
    valor_unitario: number;
    valor_total: number;
    status: 'DISPONIVEL' | 'BLOQUEADO' | 'QUARENTENA';
}

// Interface para os Cards de KPI
export interface MetricasEstoqueData {
    valor_total_estoque: number;
    total_itens: number;
    alertas_criticos: {
        vencidos: number;
        menos_7_dias: number;
    };
    ocupacao_percentagem: number;
}

// Filtros aceites pela API
export interface FiltrosEstoque {
    status?: string;
    search?: string;
    faixa_validade?: string;
}

export const estoqueService = {
    // GET /estoque
    listar: async (filtros: FiltrosEstoque): Promise<ItemEstoqueData[]> => {
        const response = await api.get('/estoque/consultar', { params: filtros });
        return response.data;
    },

    // GET /estoque/dashboard
    obterMetricas: async (): Promise<MetricasEstoqueData> => {
        const response = await api.get('/estoque/painel-kpi');
        return response.data;
    },

    // POST /estoque/entrada
    registarEntrada: async (dados: {
        produto_id: string;
        codigo_lote: string;
        data_fabricacao?: string;
        data_validade: string;
        local_id: string;
        quantidade: number;
        valor_unitario: number;
        usuario_id: string;
    }) => {
        const response = await api.post('/estoque/entrada', dados);
        return response.data;
    },

    // POST /estoque/saida
    registarSaidaFEFO: async (dados: {
        produto_id: string;
        quantidade_solicitada: number;
        justificativa: string;
        usuario_id: string;
    }) => {
        const response = await api.post('/estoque/saida', dados);
        return response.data;
    }
};