/**
 * ordensServicoService — Acesso centralizado ao Supabase para a tabela `ordens_servico`
 */
import { supabase } from './supabaseClient';

export const ordensServicoService = {
  /** Buscar todas as ordens de serviço de um warehouse, do mais recente ao mais antigo */
  getByWarehouse: (warehouseId) =>
    supabase
      .from('ordens_servico')
      .select('*')
      .eq('warehouse_id', warehouseId)
      .order('created_at', { ascending: false }),

  /** Inserir múltiplas OS em lote (seed de demonstração) e retornar registros inseridos */
  insertMany: (payloads) =>
    supabase.from('ordens_servico').insert(payloads).select(),

  /** Criar uma nova OS e retornar o registro criado */
  insert: (payload) =>
    supabase.from('ordens_servico').insert([payload]).select().single(),

  /** Atualizar status de uma OS pelo id */
  updateStatus: (id, status) =>
    supabase.from('ordens_servico').update({ status }).eq('id', id),
};
