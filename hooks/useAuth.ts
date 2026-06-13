import { useEffect, useState } from 'react';
import { authService } from '../app/services/auth';
import { api } from '../app/services/api';
import { useRouter } from 'next/navigation';


export interface User {
    id: string;
    nome: string;
    email: string;
    perfil: 'ADMIN' | 'COMPRAS_PROCUREMENT' | 'RECEBIMENTO_ARMAZEM' | 'QUALIDADE_QA' | 'REQUISITANTE';
    departamento?: string | null;
}


export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            const parsed = JSON.parse(storedUser);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            api.defaults.headers.common['x-user-id'] = parsed.id;
            setUser(parsed);
        }
    }, []);

    // Função disparada no submit do formulário de Login
    async function executarLogin(email: string, password?: string) {
        try {
            setIsLoading(true);
            setError(null);

            // 🟢 1. Faz a chamada direta à nossa nova rota de login
            const response = await api.post('/login', { email, password });
            const { token, user: dadosUsuario } = response.data;

            // 🟢 2. Guarda os dados de sessão de forma simples
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(dadosUsuario));

            // 🟢 3. Injeta o Token JWT para as próximas requisições à API
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.defaults.headers.common['x-user-id'] = dadosUsuario.id;

            // 🟢 4. Atualiza o estado interno (isso destrava a Sidebar dinamicamente)
            setUser(dadosUsuario);

            // 🟢 5. ATIVADO: Redireciona o utilizador direto para dentro do sistema
            router.push('/dashboard');

        } catch (err: any) {
            setError(err.response?.data?.error || 'Falha na autenticação. Verifica os teus dados.');
        } finally {
            setIsLoading(false);
        }
    }

    function executarLogout() {
        // 🟢 1. Limpa o armazenamento e os headers da API
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        delete api.defaults.headers.common['x-user-id'];

        // 🟢 2. ADICIONADO: Zera o estado do utilizador para fechar a Sidebar
        setUser(null);

        // 🟢 3. Manda de volta para a tela de login
        router.push('/login');
    }

    return {
        user,
        executarLogin,
        executarLogout,
        isLoading,
        error,
        setError
    };
}