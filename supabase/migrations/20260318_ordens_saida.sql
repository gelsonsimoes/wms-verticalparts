-- ============================================================
-- Migration: ordens_saida + ordens_saida_itens
-- Página 2.10 — Separar Pedidos (PickingManagement)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ordens_saida (
  id              UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id    TEXT    NOT NULL,
  numero          TEXT    NOT NULL,
  cliente         TEXT    NOT NULL DEFAULT '',
  status          TEXT    NOT NULL DEFAULT 'Pendente'
                    CHECK (status IN ('Pendente', 'Em Separação', 'Concluído')),
  valor           TEXT    NOT NULL DEFAULT '',
  data_referencia DATE    NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ordens_saida_itens (
  id                   UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_id             UUID    NOT NULL REFERENCES public.ordens_saida(id) ON DELETE CASCADE,
  sku                  TEXT    NOT NULL DEFAULT '',
  descricao            TEXT    NOT NULL DEFAULT '',
  ean                  TEXT    NOT NULL DEFAULT '',
  endereco             TEXT    NOT NULL DEFAULT '',
  quantidade_esperada  INTEGER NOT NULL DEFAULT 1,
  quantidade_coletada  INTEGER NOT NULL DEFAULT 0,
  pulado               BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_ordens_saida_warehouse ON public.ordens_saida(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_ordens_saida_itens_ordem ON public.ordens_saida_itens(ordem_id);

-- RLS
ALTER TABLE public.ordens_saida       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_saida_itens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ordens_saida' AND policyname = 'allow_all_ordens_saida') THEN
    CREATE POLICY allow_all_ordens_saida ON public.ordens_saida FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ordens_saida_itens' AND policyname = 'allow_all_ordens_saida_itens') THEN
    CREATE POLICY allow_all_ordens_saida_itens ON public.ordens_saida_itens FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
