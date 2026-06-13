import { api } from './api';

export interface FornecedorData {
    id?: string;
    razao_social: string;
    nome_fantasia?: string | null;
    nuit: string;
    tipo_pessoa?: string;
    email_principal: string;
    email_secundario?: string | null;
    telefone_principal: string;
    telefone_secundario?: string | null;
    website?: string | null;
    cobrança_rua: string;
    cobrança_numero?: string | null;
    cobrança_complemento?: string | null;
    cobrança_bairro: string;
    cobrança_cidade: string;
    cobrança_provincia: string;
    cobrança_cep?: string | null;
    cobrança_pais?: string;
    mesmo_endereco?: boolean;
    entrega_rua?: string | null;
    entrega_numero?: string | null;
    entrega_complemento?: string | null;
    entrega_bairro?: string | null;
    entrega_cidade?: string | null;
    entrega_provincia?: string | null;
    entrega_cep?: string | null;
    entrega_pais?: string | null;
    status_ativo?: boolean;
    situacao?: string;

    // Certificações
    cert_iso9001?: boolean;
    cert_iso22000?: boolean;
    cert_haccp?: boolean;
    cert_organico?: boolean;
    cert_kosher?: boolean;
    cert_halal?: boolean;
    cert_outras?: boolean;

    // Condições comerciais
    incoterm?: string;
    prazo_pagamento_dias?: number;
    moeda?: string;
    desconto_porcentagem?: number;
    prazo_entrega_dias?: number;
    formas_pagamento?: any;
    valor_minimo_pedido?: number;
    valor_maximo_credito?: number;
    sla_resposta_cotacao_h?: number;
    sla_validade_lote_h?: number;
    sla_lead_time_dias?: number;
    categorias_fornecidas?: any;
    obs_categorias?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export const fornecedorService = {
    // GET /fornecedores (Listar todos)
    listarTodos: async (): Promise<FornecedorData[]> => {
        const response = await api.get('/fornecedores');
        return response.data;
    },

    // GET /fornecedores/:id (Buscar por ID)
    buscarPorId: async (id: string): Promise<FornecedorData> => {
        const response = await api.get(`/fornecedores/${id}`);
        return response.data;
    },

    // POST /fornecedores (Criar novo fornecedor)
    criar: async (dados: FornecedorData): Promise<FornecedorData> => {
        const response = await api.post('/fornecedores', dados);
        return response.data;
    },

    // PUT /fornecedores/:id (Atualizar dados)
    atualizar: async (id: string, dados: Partial<FornecedorData>): Promise<FornecedorData> => {
        const response = await api.put(`/fornecedores/${id}`, dados);
        return response.data;
    },

    // DELETE /fornecedores/:id (Eliminar fornecedor)
    eliminar: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/fornecedores/${id}`);
        return response.data;
    }
};
