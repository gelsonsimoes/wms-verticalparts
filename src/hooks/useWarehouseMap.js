import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useWarehouseMap() {
  const [slots, setSlots]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const carregarEnderecos = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('mapa_armazem')
        .select('*')
        .order('endereco');
      if (err) throw err;
      const mapa = {};
      for (const row of data) {
        mapa[row.endereco_id] = {
          id: row.endereco_id, 
          portaPalete: row.porta_palete, 
          nivel: row.nivel,
          coluna: row.posicao, 
          rua: row.rua, 
          status: row.status_endereco === 'Ocupado' ? 'ocupado' : 'vazio', 
          tipo: row.tipo_endereco,
          sku: row.sku ?? null, 
          produto: row.produto ?? null,
          quantidade: row.quantidade ?? 0,
          endereco: row.endereco
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
    await supabase.from('alocacao_estoque').delete().eq('endereco_id', enderecoId);
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
