import { useState } from 'react';
import { produtoService, ProdutoData } from '../app/services/produtoService';

export function useProdutos() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const executarListagem = async () => {
        try {
            setLoading(true);
            setError(null);
            return await produtoService.listarTodos();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao listar os produtos do stock.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const executarCriacao = async (dados: ProdutoData) => {
        try {
            setLoading(true);
            setError(null);
            return await produtoService.criar(dados);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao salvar o novo produto.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const executarAtualizacao = async (id: string, dados: Partial<ProdutoData>) => {
        try {
            setLoading(true);
            setError(null);
            return await produtoService.atualizar(id, dados);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao atualizar o cadastro do produto.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const executarEliminacao = async (id: string) => {
        try {
            setLoading(true);
            setError(null);
            return await produtoService.eliminar(id);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao remover o produto.');
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