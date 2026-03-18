-- ============================================================
-- Migration: alocacoes — adicionar campos de quantidade
-- Página 2.8 — Alocar Estoque (StockAllocation)
-- ============================================================

ALTER TABLE alocacoes ADD COLUMN IF NOT EXISTS quantidade          INTEGER NOT NULL DEFAULT 1;
ALTER TABLE alocacoes ADD COLUMN IF NOT EXISTS quantidade_alocada  INTEGER NOT NULL DEFAULT 0;
