/**
 * crossDockingService — Acesso centralizado ao Supabase para as tabelas
 * `cross_docking` e `cross_docking_itens`
 */
import { supabase } from './supabaseClient';

export const crossDockingService = {
  /** Buscar todas as NFs de cross-docking de um warehouse (com itens) */
  getWithItemsByWarehouse: (warehouseId) =>
    supabase
      .from('cross_docking')
      .select('*, cross_docking_itens(*)')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),

  /** Criar uma nova NF de cross-docking (retorna o registro criado) */
  insert: (payload) =>
    supabase.from('cross_docking').insert(payload).select().single(),

  /** Inserir itens de carga para uma NF de cross-docking */
  insertItems: (items) =>
    supabase.from('cross_docking_itens').insert(items),

  /** Atualizar campos de uma NF de cross-docking */
  update: (id, payload) =>
    supabase.from('cross_docking').update(payload).eq('id', id),
};
