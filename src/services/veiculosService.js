/**
 * veiculosService — Acesso centralizado ao Supabase para a tabela `veiculos`
 */
import { supabase } from './supabaseClient';

export const veiculosService = {
  /** Buscar veículos ativos (disponivel ou em_rota) ordenados por placa */
  getActive: () =>
    supabase
      .from('veiculos')
      .select('id, placa, modelo, tipo, transportadora, tara, lotacao, status')
      .in('status', ['disponivel', 'em_rota'])
      .order('placa'),
};
