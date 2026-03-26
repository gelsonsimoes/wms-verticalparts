/**
 * segurosService — Acesso centralizado ao Supabase para a tabela `seguros`
 */
import { supabase } from './supabaseClient';

export const segurosService = {
  /** Buscar todas as apólices ordenadas por início de vigência */
  getAll: () =>
    supabase
      .from('seguros')
      .select('*')
      .order('inicio_vigencia', { ascending: false }),

  /** Inserir múltiplas apólices (seed ou importação) — retorna registros criados */
  insertMany: (payloads) =>
    supabase.from('seguros').insert(payloads).select(),
};
