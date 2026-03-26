/**
 * pesagensRodoviariasService — Acesso centralizado ao Supabase para a tabela `pesagens_rodoviarias`
 */
import { supabase } from './supabaseClient';

export const pesagensRodoviariasService = {
  /** Buscar histórico de pesagens rodoviárias, do mais recente ao mais antigo */
  getHistory: (limit = 30) =>
    supabase
      .from('pesagens_rodoviarias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),

  /** Registrar uma nova pesagem rodoviária */
  insert: (payload) =>
    supabase.from('pesagens_rodoviarias').insert([payload]),
};
