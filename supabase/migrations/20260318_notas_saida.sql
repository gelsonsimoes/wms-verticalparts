-- ============================================================
-- Migration: notas_saida
-- Página 2.12 — Monitorar Saída (OutboundMonitoring)
-- ============================================================

CREATE TABLE IF NOT EXISTS notas_saida (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id        TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  nf                  TEXT NOT NULL,
  serie               TEXT NOT NULL DEFAULT '1',
  cliente             TEXT,
  situacao            TEXT NOT NULL DEFAULT 'Pendentes'
                        CHECK (situacao IN ('Pendentes','Processadas','Canceladas','Aguardando Formação Onda')),
  mov_estoque         BOOLEAN NOT NULL DEFAULT true,
  solicit_cancelamento BOOLEAN NOT NULL DEFAULT false,
  sep_ini             BOOLEAN NOT NULL DEFAULT false,
  sep_fim             BOOLEAN NOT NULL DEFAULT false,
  conf_ini            BOOLEAN NOT NULL DEFAULT false,
  conf_fim            BOOLEAN NOT NULL DEFAULT false,
  total_itens         INTEGER NOT NULL DEFAULT 0,
  valor               TEXT,
  data_referencia     DATE NOT NULL DEFAULT CURRENT_DATE,
  last_update         TIMESTAMPTZ DEFAULT NOW(),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ns_warehouse ON notas_saida(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_ns_situacao  ON notas_saida(situacao);
CREATE INDEX IF NOT EXISTS idx_ns_data      ON notas_saida(data_referencia);

CREATE OR REPLACE FUNCTION update_notas_saida_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_ns_updated_at ON notas_saida;
CREATE TRIGGER trg_ns_updated_at
  BEFORE UPDATE ON notas_saida
  FOR EACH ROW EXECUTE FUNCTION update_notas_saida_updated_at();

-- RLS
ALTER TABLE notas_saida ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ns_select" ON notas_saida FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ns_insert" ON notas_saida FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "ns_update" ON notas_saida FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "ns_delete" ON notas_saida FOR DELETE USING (auth.role() = 'authenticated');
