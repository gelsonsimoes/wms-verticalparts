/**
 * recebimentoService — Acesso centralizado ao Supabase para a tabela `ordens_recebimento`
 */
import { supabase } from './supabaseClient';

export const recebimentoService = {
  /** Buscar todas as ordens de recebimento de um warehouse */
  getByWarehouse: (warehouseId) =>
    supabase
      .from('ordens_recebimento')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),

  /** Atualizar campos de uma ordem de recebimento */
  update: (id, payload) =>
    supabase.from('ordens_recebimento').update(payload).eq('id', id),

  /** Criar nova ordem de recebimento (retorna o registro criado) */
  insert: (payload) =>
    supabase
      .from('ordens_recebimento')
      .insert([payload])
      .select()
      .single(),
};
