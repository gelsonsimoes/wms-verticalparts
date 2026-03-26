/**
 * produtosService — Acesso centralizado ao Supabase para a tabela `produtos`
 *
 * Funções puras (não-hook) para uso em páginas que gerenciam estado local
 * mutável com updates otimistas (ex: ProductCatalog com buffer de edição).
 *
 * O hook useProdutos (src/hooks/domain/useProdutos.js) usa este service
 * internamente, garantindo consistência em toda a codebase.
 *
 * @example
 * import { produtosService } from '../services/produtosService';
 * const { data, error } = await produtosService.selectAll();
 */
import { supabase } from './supabaseClient';

export const produtosService = {
  /** Buscar todos os produtos ordenados por SKU */
  selectAll: () =>
    supabase.from('produtos').select('*').order('sku'),

  /** Criar ou atualizar um produto (upsert por SKU) — retorna o registro salvo */
  upsertOne: (payload) =>
    supabase.from('produtos').upsert(payload, { onConflict: 'sku' }).select().single(),

  /** Excluir um produto pelo ID */
  deleteOne: (id) =>
    supabase.from('produtos').delete().eq('id', id),

  /** Excluir múltiplos produtos por array de IDs */
  deleteMany: (ids) =>
    supabase.from('produtos').delete().in('id', ids),

  /** Importar/atualizar múltiplos produtos em lote (upsert por SKU) */
  upsertMany: (payloads) =>
    supabase.from('produtos').upsert(payloads, { onConflict: 'sku' }),

  /** Buscar produtos por SKU (pesquisa parcial, limite 5) — usado em WeighingStation e outros */
  searchBySku: (term) =>
    supabase
      .from('produtos')
      .select('id, sku, descricao, unidade, peso_bruto')
      .ilike('sku', `%${term}%`)
      .limit(5),
};
