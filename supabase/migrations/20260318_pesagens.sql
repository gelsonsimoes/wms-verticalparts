-- ============================================================
-- Migration: pesagens
-- Página 2.3 — Pesar Cargas (WeighingStation)
-- ============================================================

CREATE TABLE IF NOT EXISTS pesagens (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  sku              TEXT NOT NULL,
  descricao        TEXT,
  peso_capturado   NUMERIC(10,3) NOT NULL,
  peso_master      NUMERIC(10,3),
  variacao         NUMERIC(10,3),
  modo             TEXT CHECK (modo IN ('INBOUND','OUTBOUND')) DEFAULT 'OUTBOUND',
  balanca          TEXT,
  operador         TEXT,
  validado         BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pesagens_warehouse ON pesagens(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_pesagens_sku       ON pesagens(sku);

-- RLS
ALTER TABLE pesagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pesagens_select" ON pesagens
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "pesagens_insert" ON pesagens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
