-- ============================================================
-- Migration: cross_docking + cross_docking_itens
-- Página 2.1 — Cruzar Docas (Cross-Docking Monitoring)
-- ============================================================

-- Tabela principal de NFs em cross-docking
CREATE TABLE IF NOT EXISTS cross_docking (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id           UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  numero_nf              TEXT NOT NULL,
  ordem_referencia       TEXT,
  status                 TEXT NOT NULL DEFAULT 'Pendente'
                           CHECK (status IN ('Pendente','Processada','Cancelada')),
  conferido              BOOLEAN NOT NULL DEFAULT false,
  perc_alocada           NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (perc_alocada BETWEEN 0 AND 100),
  perc_expedida          NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (perc_expedida BETWEEN 0 AND 100),
  numero_coleta          TEXT,
  doca                   TEXT,
  rota_expressa          BOOLEAN,
  rota_expressa_definida BOOLEAN NOT NULL DEFAULT false,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Itens de cada NF
CREATE TABLE IF NOT EXISTS cross_docking_itens (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cross_docking_id      UUID NOT NULL REFERENCES cross_docking(id) ON DELETE CASCADE,
  sku                   TEXT NOT NULL,
  descricao             TEXT,
  ean                   TEXT,
  quantidade_solicitada INTEGER NOT NULL DEFAULT 0,
  quantidade_atendida   INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cross_docking_warehouse  ON cross_docking(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_cross_docking_status     ON cross_docking(status);
CREATE INDEX IF NOT EXISTS idx_cross_docking_itens_cd   ON cross_docking_itens(cross_docking_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION update_cross_docking_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_cross_docking_updated_at ON cross_docking;
CREATE TRIGGER trg_cross_docking_updated_at
  BEFORE UPDATE ON cross_docking
  FOR EACH ROW EXECUTE FUNCTION update_cross_docking_updated_at();

-- RLS
ALTER TABLE cross_docking       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_docking_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cross_docking_select" ON cross_docking
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_insert" ON cross_docking
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_update" ON cross_docking
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_delete" ON cross_docking
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_itens_select" ON cross_docking_itens
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_itens_insert" ON cross_docking_itens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_itens_update" ON cross_docking_itens
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "cross_docking_itens_delete" ON cross_docking_itens
  FOR DELETE USING (auth.role() = 'authenticated');
