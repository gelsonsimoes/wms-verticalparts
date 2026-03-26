/**
 * profilesService — Acesso centralizado ao Supabase para a tabela `profiles`
 */
import { supabase } from './supabaseClient';

export const profilesService = {
  /** Buscar todos os perfis de usuários */
  getAll: () =>
    supabase.from('profiles').select('*'),
};
