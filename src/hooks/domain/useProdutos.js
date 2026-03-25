/**
 * useProdutos — Domain hook para o catálogo de produtos (tabela `produtos`)
 *
 * Centraliza todo acesso ao Supabase para a entidade Produto via produtosService.
 * Ideal para componentes de leitura/escrita simples (lista + form separado).
 *
 * Para páginas com buffer de edição em tempo real e updates otimistas
 * (como ProductCatalog), use produtosService diretamente.
 *
 * @example
 * const { produtos, loading, upsertProduto, deleteProduto } = useProdutos();
 */
import { useState, useEffect, useCallback } from 'react';
import { produtosService } from '../../services/produtosService';

export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // ── Buscar todos os produtos ───────────────────────────────────────────
  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await produtosService.selectAll();
      if (err) throw err;
      setProdutos(data ?? []);
    } catch (err) {
      console.error('[useProdutos] fetchProdutos:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  // ── Criar ou atualizar produto (upsert por SKU) ───────────────────────
  const upsertProduto = useCallback(async (payload) => {
    try {
      const { data, error: err } = await produtosService.upsertOne(payload);
      if (err) throw err;
      await fetchProdutos();
      return { data, error: null };
    } catch (err) {
      console.error('[useProdutos] upsertProduto:', err.message);
      return { data: null, error: err.message };
    }
  }, [fetchProdutos]);

  // ── Excluir produto por ID ────────────────────────────────────────────
  const deleteProduto = useCallback(async (id) => {
    try {
      const { error: err } = await produtosService.deleteOne(id);
      if (err) throw err;
      await fetchProdutos();
      return { error: null };
    } catch (err) {
      console.error('[useProdutos] deleteProduto:', err.message);
      return { error: err.message };
    }
  }, [fetchProdutos]);

  // ── Excluir múltiplos produtos por IDs ────────────────────────────────
  const bulkDeleteProdutos = useCallback(async (ids) => {
    if (!ids?.length) return { error: null };
    try {
      const { error: err } = await produtosService.deleteMany(ids);
      if (err) throw err;
      await fetchProdutos();
      return { error: null };
    } catch (err) {
      console.error('[useProdutos] bulkDeleteProdutos:', err.message);
      return { error: err.message };
    }
  }, [fetchProdutos]);

  // ── Importar múltiplos produtos (upsert em lote por SKU) ──────────────
  const bulkUpsertProdutos = useCallback(async (payloads) => {
    if (!payloads?.length) return { error: null };
    try {
      const { error: err } = await produtosService.upsertMany(payloads);
      if (err) throw err;
      await fetchProdutos();
      return { error: null };
    } catch (err) {
      console.error('[useProdutos] bulkUpsertProdutos:', err.message);
      return { error: err.message };
    }
  }, [fetchProdutos]);

  return {
    produtos,
    loading,
    error,
    fetchProdutos,
    upsertProduto,
    deleteProduto,
    bulkDeleteProdutos,
    bulkUpsertProdutos,
  };
}
