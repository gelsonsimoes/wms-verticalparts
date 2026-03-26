/**
 * financeiroService — Acesso centralizado ao Supabase para tabelas financeiras
 * (notas_fiscais, contas_pagar, contas_receber)
 */
import { supabase } from './supabaseClient';

export const financeiroService = {
  getNotasFiscais: () =>
    supabase.from('notas_fiscais').select('tipo, valor_total, data_emissao'),

  getContasPagar: () =>
    supabase.from('contas_pagar').select('valor, vencimento, status'),

  getContasReceber: () =>
    supabase.from('contas_receber').select('valor, vencimento, status'),
};
