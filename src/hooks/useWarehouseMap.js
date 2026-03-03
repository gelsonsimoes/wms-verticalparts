import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export function useWarehouseMap() {
  const [slots, setSlots]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const carregarEnderecos = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('enderecos')
        .select(`id, porta_palete, nivel, coluna, rua, paridade, status, tipo,
          estoques ( quantidade, lote, validade, produtos ( sku, descricao ) )`)
        .order('id');
      if (err) throw err;
      const mapa = {};
      for (const end of data) {
        const est = end.estoques?.[0];
        mapa[end.id] = {
          id: end.id, portaPalete: end.porta_palete, nivel: end.nivel,
          coluna: end.coluna, rua: end.rua, paridade: end.paridade,
          status: end.status, tipo: end.tipo,
          sku: est?.produtos?.sku ?? null, produto: est?.produtos?.descricao ?? null,
          lote: est?.lote ?? null, quantidade: est?.quantidade ?? 0,
        };
      }
      setSlots(mapa); setLastSync(new Date()); setError(null);
    } catch (err) {
      console.error('[WarehouseMap]', err); setError(err.message);
    } finally { setLoading(false); }
  }, []);

  const atualizarSlot = useCallback((id, dados) =>
    setSlots(prev => ({ ...prev, [id]: { ...prev[id], ...dados } })), []);

  const alocarProduto = useCallback(async ({ enderecoId, produtoId, quantidade, lote, validade, tarefaId }) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error: err } = await supabase.rpc('alocar_produto', {
      p_endereco_id: enderecoId, p_produto_id: produtoId,
      p_lote: lote ?? '', p_validade: validade ?? null,
      p_quantidade: quantidade, p_operador_id: user?.id, p_tarefa_id: tarefaId ?? null,
    });
    if (err) return { ok: false, erro: err.message };
    return data;
  }, []);

  const liberarSlot = useCallback(async (enderecoId) => {
    const { error: err } = await supabase.from('enderecos')
      .update({ status: 'vazio', updated_at: new Date().toISOString() }).eq('id', enderecoId);
    if (err) return { ok: false, erro: err.message };
    await supabase.from('estoques').delete().eq('endereco_id', enderecoId);
    atualizarSlot(enderecoId, { status: 'vazio', sku: null, produto: null, quantidade: 0 });
    return { ok: true };
  }, [atualizarSlot]);

  useEffect(() => { carregarEnderecos(); }, [carregarEnderecos]);

  useEffect(() => {
    const channel = supabase.channel('wms_enderecos_live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'enderecos' },
        () => { carregarEnderecos(); setLastSync(new Date()); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'estoques' },
        () => carregarEnderecos())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [carregarEnderecos]);

  return { slots, loading, error, lastSync, atualizarSlot, alocarProduto, liberarSlot, recarregar: carregarEnderecos };
}
