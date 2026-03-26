/**
 * alocacaoService — Acesso centralizado ao Supabase para as tabelas `alocacoes` e `ordens_recebimento`
 * usadas pela página StockAllocation
 */
import { supabase } from './supabaseClient';

export const alocacaoService = {
  /** Buscar alocações pendentes ou posicionadas de um warehouse */
  getPendentes: (warehouseId) =>
    supabase
      .from('alocacoes')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .in('status', ['Pendente', 'Posicionado'])
      .order('created_at', { ascending: false }),

  /** Buscar ordens de recebimento (com itens) para seed de alocações */
  getReceivingForSeed: (warehouseId) =>
    supabase
      .from('ordens_recebimento')
      .select('codigo, depositante, nf, ordens_recebimento_itens(*)')
      .eq('warehouse_id', warehouseId)
      .in('status', ['Pendente', 'Aguardando Alocação']),

  /** Inserir múltiplas alocações em lote */
  insertMany: (payloads) =>
    supabase.from('alocacoes').insert(payloads),

  /** Atualizar uma alocação pelo id */
  update: (id, payload) =>
    supabase.from('alocacoes').update(payload).eq('id', id),
};
