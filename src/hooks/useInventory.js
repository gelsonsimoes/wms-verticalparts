import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

// ─── useInventory ─────────────────────────────────────────────────────────────
// Busca o mapa de estoque via VIEW mapa_armazem com:
// - Filtros por SKU, produto, rua, nível de estoque
// - Realtime em alocacao_estoque, enderecos, produtos
// - Função de ajuste: registra em movimento_estoque e atualiza via Trigger SQL
// Sugestão: Gemini — Implementação: Antigravity 2026-03-21
// ─────────────────────────────────────────────────────────────────────────────
export function useInventory(warehouseId) {
    const [rows, setRows]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);
    const [adjusting, setAdjusting] = useState(false);

    // ── Fetch principal ────────────────────────────────────────────────────────
    const fetch = useCallback(async () => {
        if (!warehouseId) return;
        setLoading(true);
        setError(null);

        const { data, error: err } = await supabase
            .from('mapa_armazem')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .order('rua')
            .order('endereco');

        if (err) {
            console.error('[useInventory]', err.message);
            setError(err.message);
        } else {
            // Normaliza quantidade para número
            setRows((data ?? []).map(r => ({
                ...r,
                quantidade: r.quantidade != null ? Number(r.quantidade) : null,
            })));
        }
        setLoading(false);
    }, [warehouseId]);

    useEffect(() => { fetch(); }, [fetch]);

    // ── Realtime ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!warehouseId) return;
        const ch = supabase
            .channel(`inventario-rt-${warehouseId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'alocacao_estoque', filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'enderecos',        filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'movimento_estoque',filter: `warehouse_id=eq.${warehouseId}` }, fetch)
            .subscribe();
        return () => supabase.removeChannel(ch);
    }, [warehouseId, fetch]);

    // ── Ajuste Manual de Estoque ───────────────────────────────────────────────
    // Registra em movimento_estoque → trigger SQL atualiza produtos.estoque_wms
    const ajustarEstoque = useCallback(async ({
        produtoId, enderecoId, sku, descricao,
        novaQuantidade, quantidadeAtual, operadorId, motivo,
    }) => {
        if (!warehouseId || !produtoId) return { error: 'Dados insuficientes.' };

        const diff = novaQuantidade - (quantidadeAtual ?? 0);
        if (diff === 0) return { error: 'A quantidade não foi alterada.' };

        const tipo_movimento = diff > 0 ? 'entrada_ajuste' : 'saida_ajuste';
        const quantidade     = Math.abs(diff);

        setAdjusting(true);

        // 1. Registra movimento (dispara trigger automático nos produtos)
        const { error: movErr } = await supabase.from('movimento_estoque').insert([{
            warehouse_id:    warehouseId,
            produto_id:      produtoId,
            sku,
            descricao,
            tipo_movimento,
            quantidade,
            quantidade_antes: quantidadeAtual ?? 0,
            quantidade_apos:  novaQuantidade,
            endereco_id:     enderecoId ?? null,
            referencia_tipo:  'ajuste_manual',
            operador_id:      operadorId ?? null,
            observacao:       motivo ?? 'Ajuste manual via WMS',
        }]);

        if (movErr) { setAdjusting(false); return { error: movErr.message }; }

        // 2. Atualiza alocacao_estoque (posição física)
        if (enderecoId) {
            if (novaQuantidade === 0) {
                await supabase.from('alocacao_estoque')
                    .delete()
                    .eq('endereco_id', enderecoId)
                    .eq('warehouse_id', warehouseId);
                await supabase.from('enderecos')
                    .update({ status: 'Disponível' })
                    .eq('id', enderecoId);
            } else {
                await supabase.from('alocacao_estoque')
                    .update({ quantidade: novaQuantidade, updated_at: new Date().toISOString() })
                    .eq('endereco_id', enderecoId)
                    .eq('warehouse_id', warehouseId);
            }
        }

        await fetch();
        setAdjusting(false);
        return { success: true };
    }, [warehouseId, fetch]);

    // ── Estatísticas totais ────────────────────────────────────────────────────
    const stats = useMemo(() => {
        const comProduto = rows.filter(r => r.sku != null);
        const criticos   = rows.filter(r => r.nivel_estoque === 'Crítico');
        return {
            totalEnderecos: rows.length,
            ocupados:       comProduto.length,
            vazios:         rows.length - comProduto.length,
            criticos:       criticos.length,
            totalSkus:      new Set(comProduto.map(r => r.sku)).size,
        };
    }, [rows]);

    return { rows, loading, error, stats, adjusting, refetch: fetch, ajustarEstoque };
}
