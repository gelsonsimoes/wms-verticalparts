/**
 * gruposAcessoService — Acesso centralizado ao Supabase para a tabela `grupos_acesso`
 */
import { supabase } from './supabaseClient';

export const gruposAcessoService = {
  /** Buscar grupos de acesso (lightweight — id, nome, descricao, paginas) ordenados por nome */
  getAll: () =>
    supabase
      .from('grupos_acesso')
      .select('id, nome, descricao, paginas')
      .order('nome'),

  /** Buscar todos os campos de grupos de acesso ordenados por data de criação (usado em UserGroups) */
  getFullList: () =>
    supabase.from('grupos_acesso').select('*').order('created_at'),

  /** Criar novo grupo de acesso */
  insert: (payload) =>
    supabase.from('grupos_acesso').insert(payload),

  /** Atualizar grupo de acesso pelo id */
  update: (id, payload) =>
    supabase.from('grupos_acesso').update(payload).eq('id', id),

  /** Excluir grupo de acesso pelo id */
  delete: (id) =>
    supabase.from('grupos_acesso').delete().eq('id', id),
};
