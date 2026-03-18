-- ============================================================
-- Migration: ordens_recebimento + ordens_recebimento_itens
-- Página 2.4 — Gerenciar Recebimento (ReceivingManager)
-- ============================================================

CREATE TABLE IF NOT EXISTS ordens_recebimento (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id   TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  codigo         TEXT NOT NULL,
  depositante    TEXT,
  tipo           TEXT NOT NULL DEFAULT 'Compra Nacional'
                   CHECK (tipo IN ('Compra Nacional','Devolução Cliente','Importação Direta','Transferência')),
  status         TEXT NOT NULL DEFAULT 'Pendente'
                   CHECK (status IN ('Pendente','Aguardando Alocação','Finalizada')),
  data_entrada   DATE NOT NULL DEFAULT CURRENT_DATE,
  total_itens    INTEGER NOT NULL DEFAULT 0,
  conferidos     INTEGER NOT NULL DEFAULT 0,
  nf             TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ordens_recebimento_itens (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_id          UUID NOT NULL REFERENCES ordens_recebimento(id) ON DELETE CASCADE,
  sku               TEXT NOT NULL,
  descricao         TEXT,
  lote              TEXT,
  quantidade        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_or_warehouse ON ordens_recebimento(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_or_status    ON ordens_recebimento(status);
CREATE INDEX IF NOT EXISTS idx_or_itens_or  ON ordens_recebimento_itens(ordem_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION update_ordens_recebimento_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_or_updated_at ON ordens_recebimento;
CREATE TRIGGER trg_or_updated_at
  BEFORE UPDATE ON ordens_recebimento
  FOR EACH ROW EXECUTE FUNCTION update_ordens_recebimento_updated_at();

-- RLS
ALTER TABLE ordens_recebimento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_recebimento_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "or_select" ON ordens_recebimento
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "or_insert" ON ordens_recebimento
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "or_update" ON ordens_recebimento
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "or_delete" ON ordens_recebimento
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "or_itens_select" ON ordens_recebimento_itens
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "or_itens_insert" ON ordens_recebimento_itens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "or_itens_update" ON ordens_recebimento_itens
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "or_itens_delete" ON ordens_recebimento
  FOR DELETE USING (auth.role() = 'authenticated');
