import { api } from './api';

// Interfaces de entrada
interface RegisterData {
    name: string;
    email: string;
    password?: string; // Opcional se usares password ou se for via convite
    role: 'ADMIN' | 'COMPRAS' | 'ARMAZEM' | 'QUALIDADE' | 'REQUISITANTE';
}

interface LoginData {
    email: string;
    password?: string;
}

// Interface de resposta do backend
interface AuthResponse {
    token: string;
    user: {
        id: string;
        nome: string;
        email: string;
        role: 'ADMIN' | 'COMPRAS' | 'ARMAZEM' | 'QUALIDADE' | 'REQUISITANTE';
    };
}

export const authService = {
    // ➕ Registar Novo Utilizador (Usado pela tela de Usuários do Admin)
    async cadastrar(dados: RegisterData) {
        const response = await api.post('/usuarios', dados);
        return response.data;
    },

    // 🔑 Fazer Login
    async login(dados: LoginData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/login', dados);
        return response.data;
    }
};