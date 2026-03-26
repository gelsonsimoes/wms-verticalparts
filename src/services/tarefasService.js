/**
 * tarefasService — Acesso centralizado ao Supabase para a tabela `tarefas`
 * (ondas de separação, picking, conferência, etc.)
 */
import { supabase } from './supabaseClient';

export const tarefasService = {
  /** Buscar ondas de separação de um warehouse */
  selectSeparacaoByWarehouse: (warehouseId) =>
    supabase
      .from('tarefas')
      .select('id, tipo, titulo_onda, status, doca, config, cor_colmeia, total_itens, total_pedidos, created_at, detalhes')
      .eq('tipo', 'separacao')
      .eq('detalhes->>warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),

  /** Buscar tarefas de picking de um warehouse (listagem leve) */
  selectPickingByWarehouse: (warehouseId) =>
    supabase
      .from('tarefas')
      .select('id, tipo, titulo_onda, status, doca, config, total_itens, created_at, detalhes, atribuido_a')
      .eq('tipo', 'picking')
      .eq('detalhes->>warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),

  /** Buscar tarefas de picking com seus itens (para execução da separação) */
  selectPickingWithItemsByWarehouse: (warehouseId) =>
    supabase
      .from('tarefas')
      .select('*, itens_tarefa(*)')
      .eq('tipo', 'picking')
      .neq('status', 'cancelado')
      .filter('detalhes->>warehouse_id', 'eq', warehouseId)
      .order('created_at', { ascending: false }),

  /** Inserir múltiplas tarefas (seed ou criação em lote) */
  insertMany: (payloads) => supabase.from('tarefas').insert(payloads),

  /** Atualizar o status de uma tarefa */
  updateStatus: (id, status) =>
    supabase.from('tarefas').update({ status }).eq('id', id),

  /** Atualizar campos arbitrários de uma tarefa */
  update: (id, payload) =>
    supabase.from('tarefas').update(payload).eq('id', id),
};
