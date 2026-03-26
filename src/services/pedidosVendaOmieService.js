/**
 * pedidosVendaOmieService — Acesso centralizado ao Supabase para a tabela `pedidos_venda_omie`
 */
import { supabase } from './supabaseClient';

export const pedidosVendaOmieService = {
  /** Buscar peso declarado pelo mobile para um veículo (último pedido separado/conferido) */
  getPesoDeclarado: (placa) =>
    supabase
      .from('pedidos_venda_omie')
      .select('numero_pedido, peso_total_separado')
      .eq('veiculo_placa', placa)
      .in('status', ['separado', 'conferido'])
      .order('atualizado_em', { ascending: false })
      .limit(1)
      .maybeSingle(),
};
