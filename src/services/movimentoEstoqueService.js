/**
 * movimentoEstoqueService — Acesso centralizado ao Supabase para a tabela `movimento_estoque`
 */
import { supabase } from './supabaseClient';

export const movimentoEstoqueService = {
  /** Registrar um movimento de estoque no kardex */
  insert: (payload) => supabase.from('movimento_estoque').insert([payload]),
};
