/**
 * pesagensService — Acesso centralizado ao Supabase para a tabela `pesagens`
 */
import { supabase } from './supabaseClient';

export const pesagensService = {
  /** Registrar uma pesagem */
  insert: (payload) => supabase.from('pesagens').insert([payload]),
};
