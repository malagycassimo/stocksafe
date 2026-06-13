import { useState } from 'react';
import { usuarioService, CadastroUsuarioData } from '@/app/services/usuarioService';

export function useUsuarios() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executarListagem = async () => {
        try {
            setLoading(true);
            setError(null);
            return await usuarioService.listarTodos();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao listar utilizadores.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const executarCriacao = async (dados: CadastroUsuarioData) => {
        try {
            setLoading(true);
            setError(null);
            return await usuarioService.criar(dados);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao cadastrar utilizador.');
            throw err
        } finally {
            setLoading(false);
        }
    };

    const executarAtualizacao = async (id: string, dados: Partial<CadastroUsuarioData>) => {
        try {
            setLoading(true);
            setError(null);
            return await usuarioService.atualizar(id, dados);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao atualizar utilizador.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const executarEliminacao = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            return await usuarioService.eliminar(id);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao remover utilizador.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        executarListagem,
        executarCriacao,
        executarAtualizacao,
        executarEliminacao
    };
}