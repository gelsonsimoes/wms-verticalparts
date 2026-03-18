-- ============================================================
-- Migration: devolucoes + devolucao_itens
-- Página 2.2 — Processar Devoluções (ReturnDelivery)
-- ============================================================

CREATE TABLE IF NOT EXISTS devolucoes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id      TEXT REFERENCES warehouses(id) ON DELETE CASCADE,
  id_insucesso      TEXT NOT NULL,
  data_solicitacao  DATE NOT NULL DEFAULT CURRENT_DATE,
  ordem_cliente     TEXT,
  nf_original       TEXT,
  tipo_devolucao    TEXT NOT NULL DEFAULT 'Insucesso de Entrega',
  depositante       TEXT,
  responsavel       TEXT,
  status            TEXT NOT NULL DEFAULT 'Pendente'
                      CHECK (status IN ('Pendente','Executando','Cancelada','Finalizada')),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devolucao_itens (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  devolucao_id    UUID NOT NULL REFERENCES devolucoes(id) ON DELETE CASCADE,
  codigo_prod     TEXT NOT NULL,
  descricao       TEXT,
  qt_devolvida    INTEGER NOT NULL DEFAULT 1,
  estado_peca     TEXT NOT NULL DEFAULT 'Bom'
                    CHECK (estado_peca IN ('Bom','Avariado','Desmembrado/Truncado')),
  setor_destino   TEXT NOT NULL DEFAULT 'TRIAGEM-A'
                    CHECK (setor_destino IN ('TRIAGEM-A','TRIAGEM-B','AVARIAS','DESMEM','QUARENTENA','GARANTIA')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_devolucoes_warehouse ON devolucoes(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_devolucoes_status    ON devolucoes(status);
CREATE INDEX IF NOT EXISTS idx_devolucao_itens_dev  ON devolucao_itens(devolucao_id);

-- updated_at automático
CREATE OR REPLACE FUNCTION update_devolucoes_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_devolucoes_updated_at ON devolucoes;
CREATE TRIGGER trg_devolucoes_updated_at
  BEFORE UPDATE ON devolucoes
  FOR EACH ROW EXECUTE FUNCTION update_devolucoes_updated_at();

-- RLS
ALTER TABLE devolucoes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE devolucao_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "devolucoes_select" ON devolucoes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "devolucoes_insert" ON devolucoes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "devolucoes_update" ON devolucoes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "devolucoes_delete" ON devolucoes
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "devolucao_itens_select" ON devolucao_itens
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "devolucao_itens_insert" ON devolucao_itens
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "devolucao_itens_update" ON devolucao_itens
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "devolucao_itens_delete" ON devolucao_itens
  FOR DELETE USING (auth.role() = 'authenticated');
