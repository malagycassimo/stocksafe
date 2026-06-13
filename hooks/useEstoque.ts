import { useState, useCallback } from 'react';
import { estoqueService, ItemEstoqueData, MetricasEstoqueData, FiltrosEstoque } from '@/app/services/estoqueService';

export function useEstoque() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lotes, setLotes] = useState<ItemEstoqueData[]>([]);
    const [metricas, setMetricas] = useState<MetricasEstoqueData | null>(null);

    // Carregar dados da tabela com filtros
    const carregarEstoque = useCallback(async (filtros: FiltrosEstoque = {}) => {
        try {
            setLoading(true);
            setError(null);
            const dados = await estoqueService.listar(filtros);
            setLotes(dados);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Erro ao carregar dados do stock.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Carregar KPIs do topo
    const carregarMetricas = useCallback(async () => {
        try {
            const dados = await estoqueService.obterMetricas();
            setMetricas(dados);
        } catch (err: any) {
            console.error('Erro ao carregar métricas do painel:', err);
        }
    }, []);

    // Disparar Entrada
    const executarEntrada = async (dados: any) => {
        try {
            setLoading(true);
            setError(null);
            const res = await estoqueService.registarEntrada(dados);
            await carregarEstoque(); // Atualiza a tabela imediatamente
            await carregarMetricas(); // Atualiza os cards
            return res;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Falha ao registar entrada de mercadoria.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Disparar Saída FEFO
    const executarSaida = async (dados: any) => {
        try {
            setLoading(true);
            setError(null);
            const res = await estoqueService.registarSaidaFEFO(dados);
            await carregarEstoque();
            await carregarMetricas();
            return res;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Falha ao processar saída FEFO.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        lotes,
        metricas,
        loading,
        error,
        carregarEstoque,
        carregarMetricas,
        executarEntrada,
        executarSaida
    };
}