import { api } from './api';

// Interface idêntica à estrutura real da tua base de dados
export interface ProdutoData {
    id?: string;
    sku: string;
    codigo_barras_interno: string | null;
    descricao: string;
    categoria: string;
    unidade_medida: string;
    tamanho_embalagem: string | null;
    marca: string | null;
    observacoes: string | null;
    status_ativo: boolean;
    vida_util_dias: number;
    politica_expedicao: 'FEFO' | 'FIFO' | 'LIFO' | string;
    tipo_controle_validade: 'PORCENTAGEM' | 'DIAS' | string;
    validade_min_recebimento: number;
    validade_min_cliente_dias: number;
    alertas_habilitados: boolean;
    alertas_dias_config: any | null;
    alerta_personalizado_dias: number;
    controle_lote: boolean;
    controle_numero_serie: boolean;
    ficha_tecnica_obrigatoria: boolean;
    certificacoes_obrigatorias: boolean;
    dias_quarentena: number;
    condicao_temperatura: string;
    condicao_umidade: string;
    restricoes_armazenagem: string | null;
    peso_unidade: number;
    unidade_peso: string;
    comprimento_cm: number;
    largura_cm: number;
    altura_cm: number;
    empilhamento_maximo: number;
    tipo_palete: string;
    instrucoes_especiais: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export const produtoService = {
    // GET /produtos (Listar todos)
    listarTodos: async (): Promise<ProdutoData[]> => {
        const response = await api.get('/produtos');
        return response.data;
    },

    // GET /produtos/:id (Buscar por ID)
    buscarPorId: async (id: string): Promise<ProdutoData> => {
        const response = await api.get(`/produtos/${id}`);
        return response.data;
    },

    // POST /produtos (Criar novo produto)
    criar: async (dados: ProdutoData): Promise<ProdutoData> => {
        const response = await api.post('/produtos', dados);
        return response.data;
    },

    // PUT /produtos/:id (Atualizar dados)
    atualizar: async (id: string, dados: Partial<ProdutoData>): Promise<ProdutoData> => {
        const response = await api.put(`/produtos/${id}`, dados);
        return response.data;
    },

    // DELETE /produtos/:id (Eliminar produto)
    eliminar: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/produtos/${id}`);
        return response.data;
    }
};