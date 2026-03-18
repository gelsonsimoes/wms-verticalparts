-- ============================================================
-- Migration: conferencia_cega
-- Página 2.7 — Realizar Conferência Cega (BlindCheck)
-- ============================================================

CREATE TABLE IF NOT EXISTS conferencia_cega (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id   TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  ordem_id       TEXT NOT NULL,
  nf             TEXT,
  depositante    TEXT,
  status         TEXT NOT NULL DEFAULT 'Pendente'
                   CHECK (status IN ('Pendente','Em Conferência','Divergente','Finalizado')),
  tentativas     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conferencia_cega_itens (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conferencia_id   UUID NOT NULL REFERENCES conferencia_cega(id) ON DELETE CASCADE,
  barcode          TEXT NOT NULL,
  descricao        TEXT,
  qt_esperada      INTEGER NOT NULL DEFAULT 0,
  qt_contada       INTEGER NOT NULL DEFAULT 0,
  lote             TEXT,
  validade         TEXT,
  peso             TEXT,
  cor              TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cc_warehouse  ON conferencia_cega(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_cc_status     ON conferencia_cega(status);
CREATE INDEX IF NOT EXISTS idx_cci_cc        ON conferencia_cega_itens(conferencia_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION update_conferencia_cega_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_cc_updated_at ON conferencia_cega;
CREATE TRIGGER trg_cc_updated_at
  BEFORE UPDATE ON conferencia_cega
  FOR EACH ROW EXECUTE FUNCTION update_conferencia_cega_updated_at();

-- RLS
ALTER TABLE conferencia_cega       ENABLE ROW LEVEL SECURITY;
ALTER TABLE conferencia_cega_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cc_select" ON conferencia_cega FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cc_insert" ON conferencia_cega FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "cc_update" ON conferencia_cega FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "cc_delete" ON conferencia_cega FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "cci_select" ON conferencia_cega_itens FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "cci_insert" ON conferencia_cega_itens FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "cci_update" ON conferencia_cega_itens FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "cci_delete" ON conferencia_cega_itens FOR DELETE USING (auth.role() = 'authenticated');
