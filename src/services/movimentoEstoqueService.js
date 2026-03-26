/**
 * movimentoEstoqueService — Acesso centralizado ao Supabase para a tabela `movimento_estoque`
 */
import { supabase } from './supabaseClient';

export const movimentoEstoqueService = {
  /** Registrar um único movimento de estoque */
  insert: (payload) => supabase.from('movimento_estoque').insert([payload]),

  /** Inserir múltiplos movimentos em lote (seed ou importação) */
  insertMany: (payloads) => supabase.from('movimento_estoque').insert(payloads),

  /** Buscar todos os movimentos de estoque de um warehouse, do mais recente ao mais antigo */
  getByWarehouse: (warehouseId) =>
    supabase
      .from('movimento_estoque')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),
};
