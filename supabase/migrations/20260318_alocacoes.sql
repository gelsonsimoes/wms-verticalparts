-- ============================================================
-- Migration: alocacoes
-- Página 2.6 — Gerar Mapa de Alocação (AllocationMap)
-- ============================================================

CREATE TABLE IF NOT EXISTS alocacoes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id      TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  ordem_id          TEXT NOT NULL,             -- código da OR (ex.: OR-55920)
  depositante       TEXT,
  tipo_recebimento  TEXT,
  produto           TEXT,
  lote              TEXT,
  endereco_sugerido TEXT,
  tipo_local        TEXT CHECK (tipo_local IN ('Pulmão','Picking')),
  status            TEXT NOT NULL DEFAULT 'Pendente'
                      CHECK (status IN ('Pendente','Posicionado','Finalizado','Cancelado')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alocacoes_warehouse ON alocacoes(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_alocacoes_status    ON alocacoes(status);
CREATE INDEX IF NOT EXISTS idx_alocacoes_ordem     ON alocacoes(ordem_id);

CREATE OR REPLACE FUNCTION update_alocacoes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_alocacoes_updated_at ON alocacoes;
CREATE TRIGGER trg_alocacoes_updated_at
  BEFORE UPDATE ON alocacoes
  FOR EACH ROW EXECUTE FUNCTION update_alocacoes_updated_at();

-- RLS
ALTER TABLE alocacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "alocacoes_select" ON alocacoes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "alocacoes_insert" ON alocacoes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "alocacoes_update" ON alocacoes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "alocacoes_delete" ON alocacoes FOR DELETE USING (auth.role() = 'authenticated');
