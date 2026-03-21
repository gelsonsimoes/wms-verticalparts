import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useOutbound(warehouseId) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch das Notas (Via View de Monitoramento) ──────────────────
    const fetchOrders = useCallback(async () => {
        if (!warehouseId) return;
        setLoading(true);
        try {
            const { data, error: err } = await supabase
                .from('v_monitoramento_expedicao')
                .select('*')
                .eq('warehouse_id', warehouseId)
                .order('last_update', { ascending: false });

            if (err) throw err;
            setOrders(data || []);
        } catch (e) {
            console.error('useOutbound fetch:', e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [warehouseId]);

    // ── Fetch Detalhado de Itens de uma NF ──────────────────────────
    const fetchOrderItems = useCallback(async (notaId) => {
        try {
            const { data, error: err } = await supabase
                .from('itens_nota_saida')
                .select('*, produtos(sku, descricao)')
                .eq('nota_id', notaId);

            if (err) throw err;
            return data.map(i => ({
                id: i.id,
                sku: i.produtos?.sku || 'S/SKU',
                desc: i.produtos?.descricao || 'Produto não identificado',
                separado: i.quantidade_separada || 0,
                conferido: i.quantidade_conferida || 0,
                total: i.quantidade_planejada,
                unidade: i.unidade
            }));
        } catch (e) {
            console.error('fetchOrderItems:', e);
            return [];
        }
    }, []);

    // ── Realtime Sync ───────────────────────────────────────────────
    useEffect(() => {
        if (!warehouseId) return;
        fetchOrders();

        const channel = supabase
            .channel('outbound_changes')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'notas_saida',
                filter: `warehouse_id=eq.${warehouseId}`
            }, () => fetchOrders())
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'itens_nota_saida'
            }, () => fetchOrders())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [warehouseId, fetchOrders]);

    return { orders, loading, error, refetch: fetchOrders, fetchOrderItems };
}
