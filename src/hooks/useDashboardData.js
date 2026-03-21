import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── useDashboardData ────────────────────────────────────────────────────────
// Busca os KPIs do Dashboard usando a VIEW dashboard_kpis (1 query só),
// com atualização em tempo real via Supabase Realtime.
// Sugestão de arquitetura: Gemini — Implementação: Antigravity 2026-03-21
// ─────────────────────────────────────────────────────────────────────────────
export function useDashboardData(warehouseId) {
    const [data, setData]         = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetch = useCallback(async () => {
        if (!warehouseId) return;

        setLoading(true);
        setError(null);

        const { data: rows, error: err } = await supabase
            .from('dashboard_kpis')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .maybeSingle();

        if (err) {
            console.error('[useDashboardData]', err.message);
            setError(err.message);
        } else {
            setData(rows);
            setLastUpdated(new Date());
        }

        setLoading(false);
    }, [warehouseId]);

    // Busca inicial
    useEffect(() => { fetch(); }, [fetch]);

    // Realtime: recalcula quando endereços, alocações, notas ou tarefas mudam
    useEffect(() => {
        if (!warehouseId) return;

        const channel = supabase
            .channel(`dashboard-rt-${warehouseId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'enderecos',        filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alocacao_estoque', filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notas_saida',      filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas',          filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'movimento_estoque',filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [warehouseId, fetch]);

    // ── Valores derivados (com fallbacks seguros) ──────────────────────────────
    const kpis = {
        // ocupação
        totalEnderecos:    data?.total_enderecos    ?? 0,
        enderecosOcupados: data?.enderecos_ocupados ?? 0,
        pctOcupacao:       data?.pct_ocupacao       ?? 0,
        modulosVazios:     data?.modulos_vazios     ?? 0,
        // pedidos
        pedidosPendentes:  data?.pedidos_pendentes  ?? 0,
        expedicoesHoje:    data?.expedicoes_hoje    ?? 0,
        // ondas
        ondasAtivas:       data?.ondas_ativas       ?? 0,
        // produtos
        totalSkusAtivos:   data?.total_skus_ativos  ?? 0,
        // movimentos
        movimentosHoje:    data?.movimentos_hoje    ?? 0,
        // meta
        calculadoEm:       data?.calculado_em       ?? null,
    };

    return { kpis, loading, error, refetch: fetch, lastUpdated };
}
