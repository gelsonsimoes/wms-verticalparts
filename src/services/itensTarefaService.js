/**
 * itensTarefaService — Acesso centralizado ao Supabase para a tabela `itens_tarefa`
 * (itens individuais de tarefas de picking, conferência, etc.)
 */
import { supabase } from './supabaseClient';

export const itensTarefaService = {
  /** Atualizar campos arbitrários de um item de tarefa */
  update: (id, payload) =>
    supabase.from('itens_tarefa').update(payload).eq('id', id),
};
