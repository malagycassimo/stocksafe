import { api } from './api';

export interface LocalData {
    id?: string;
    codigo: string;
    nome: string;
    tipo: 'ARMAZEM' | 'ZONA' | 'CORREDOR' | 'PRATELEIRA' | 'POSICAO';
    temperatura_controlada?: boolean;
    humidade_controlada?: boolean;
    protegido_luz?: boolean;
    area_segregada?: boolean;
    quarentena?: boolean;
    bloqueado?: boolean;
    capacidade_maxima?: number;
    capacidade_atual?: number;
    local_pai_id?: string | null;
    sublocais?: LocalData[];
    createdAt?: string;
    updatedAt?: string;
}

export const localService = {
    // GET /locais (Listar todas as localizações registadas)
    listarTodos: async (): Promise<LocalData[]> => {
        const response = await api.get('/locais');
        return response.data;
    },

    // GET /locais/:id (Obter dados de uma localização específica)
    buscarPorId: async (id: string): Promise<LocalData> => {
        const response = await api.get(`/locais/${id}`);
        return response.data;
    },

    // POST /locais (Registar uma nova localização/área de armazenamento)
    criar: async (dados: LocalData): Promise<LocalData> => {
        const response = await api.post('/locais', dados);
        return response.data;
    },

    // PUT /locais/:id (Atualizar as informações de uma localização)
    atualizar: async (id: string, dados: Partial<LocalData>): Promise<LocalData> => {
        const response = await api.put(`/locais/${id}`, dados);
        return response.data;
    },

    // DELETE /locais/:id (Remover uma localização)
    eliminar: async (id: string): Promise<{ message: string }> => {
        const response = await api.delete(`/locais/${id}`);
        return response.data;
    }
};
