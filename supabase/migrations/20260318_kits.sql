-- ============================================================
-- Migration: kits
-- Página 2.14 — Estação de Kits (KitStation)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.kits_receitas (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  kit_sku      TEXT NOT NULL,
  descricao    TEXT NOT NULL,
  valor_kit    NUMERIC(12,2) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.kits_receitas_itens (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  receita_id UUID NOT NULL REFERENCES public.kits_receitas(id) ON DELETE CASCADE,
  sku        TEXT NOT NULL,
  descricao  TEXT NOT NULL,
  qtd_exigida INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.ordens_kit (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL CHECK (tipo IN ('Montagem', 'Desmontagem')),
  codigo_servico   TEXT,
  kit_sku          TEXT NOT NULL,
  kit_desc         TEXT,
  qtd_kits         INTEGER NOT NULL DEFAULT 1,
  valor_kit        NUMERIC(12,2) DEFAULT 0,
  status           TEXT DEFAULT 'Concluído',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ordens_kit_componentes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ordem_id    UUID NOT NULL REFERENCES public.ordens_kit(id) ON DELETE CASCADE,
  sku         TEXT NOT NULL,
  descricao   TEXT,
  qtd_exigida INTEGER DEFAULT 0,
  qtd_inserida INTEGER DEFAULT 0
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_kits_receitas_wh  ON public.kits_receitas(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_kits_itens_rec    ON public.kits_receitas_itens(receita_id);
CREATE INDEX IF NOT EXISTS idx_ordens_kit_wh     ON public.ordens_kit(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_ordens_kit_comp   ON public.ordens_kit_componentes(ordem_id);

-- RLS
ALTER TABLE public.kits_receitas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kits_receitas_itens    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_kit             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_kit_componentes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kr_all"  ON public.kits_receitas;
DROP POLICY IF EXISTS "kri_all" ON public.kits_receitas_itens;
DROP POLICY IF EXISTS "ok_all"  ON public.ordens_kit;
DROP POLICY IF EXISTS "okc_all" ON public.ordens_kit_componentes;

CREATE POLICY "kr_all"  ON public.kits_receitas          FOR ALL USING (true);
CREATE POLICY "kri_all" ON public.kits_receitas_itens    FOR ALL USING (true);
CREATE POLICY "ok_all"  ON public.ordens_kit             FOR ALL USING (true);
CREATE POLICY "okc_all" ON public.ordens_kit_componentes FOR ALL USING (true);
