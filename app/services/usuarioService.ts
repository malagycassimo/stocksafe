import { api } from './api';

export interface CadastroUsuarioData {
    nome_completo: string;
    email: string;
    senha?: string;
    telefone?: string;
    departamento?: string;
    cargo?: string;
    perfil: 'ADMIN' | 'COMPRAS_PROCUREMENT' | 'RECEBIMENTO_ARMAZEM' | 'QUALIDADE_QA' | 'REQUISITANTE';
    status_ativo?: boolean;
    notificacao_email?: boolean;
    permissoes?: any;
}

export const usuarioService = {
    // GET /usuarios (Listar todos)
    listarTodos: async () => {
        const response = await api.get('/usuarios');
        return response.data;
    },

    // GET /usuarios/:id (Buscar por ID)
    buscarPorId: async (id: string) => {
        const response = await api.get(`/usuarios/${id}`);
        return response.data;
    },

    // POST /usuarios (Criar novo)
    criar: async (dados: CadastroUsuarioData) => {
        const response = await api.post('/usuarios', dados);
        return response.data;
    },

    // PUT /usuarios/:id (Atualizar)
    atualizar: async (id: string, dados: Partial<CadastroUsuarioData>) => {
        const response = await api.put(`/usuarios/${id}`, dados);
        return response.data;
    },

    // DELETE /usuarios/:id (Eliminar)
    eliminar: async (id: string) => {
        const response = await api.delete(`/usuarios/${id}`);
        return response.data;
    }
};