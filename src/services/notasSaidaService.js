/**
 * notasSaidaService — Acesso centralizado ao Supabase para a tabela `notas_saida`
 */
import { supabase } from './supabaseClient';

export const notasSaidaService = {
  /** Buscar valores das notas de saída ativas de um warehouse (para cálculo de estoque segurado) */
  getValoresByWarehouse: (warehouseId) =>
    supabase
      .from('notas_saida')
      .select('valor')
      .eq('warehouse_id', warehouseId)
      .neq('situacao', 'Canceladas'),
};
