/**
 * enderecosService — Acesso centralizado ao Supabase para a tabela `enderecos`
 */
import { supabase } from './supabaseClient';

export const enderecosService = {
  /** Marcar endereço como Ocupado pelo código e warehouse_id */
  setOcupado: (codigo, warehouseId) =>
    supabase
      .from('enderecos')
      .update({ status: 'Ocupado' })
      .eq('codigo', codigo)
      .eq('warehouse_id', warehouseId),
};
