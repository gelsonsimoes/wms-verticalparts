/**
 * convitesService — Acesso centralizado ao Supabase para a tabela `convites_pendentes`
 */
import { supabase } from './supabaseClient';

export const convitesService = {
  /** Registrar um novo convite pendente */
  insert: (payload) =>
    supabase.from('convites_pendentes').insert([payload]),
};
