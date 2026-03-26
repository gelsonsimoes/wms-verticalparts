/**
 * gruposAcessoService — Acesso centralizado ao Supabase para a tabela `grupos_acesso`
 */
import { supabase } from './supabaseClient';

export const gruposAcessoService = {
  /** Buscar todos os grupos de acesso ordenados por nome */
  getAll: () =>
    supabase
      .from('grupos_acesso')
      .select('id, nome, descricao, paginas')
      .order('nome'),
};
