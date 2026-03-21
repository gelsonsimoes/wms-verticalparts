-- ============================================================
-- Migration: itens_tarefa + cor_colmeia em tarefas
-- Precedente: tarefas (initial_schema)
-- Dependente: HoneycombCheck (2.15), WavePickingWizard (3.1),
--             WaveSLADashboard (3.2), ActivityManager (3.4)
-- ============================================================

-- Adiciona cor_colmeia e numero_onda em tarefas (se não existirem)
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS cor_colmeia TEXT,
  ADD COLUMN IF NOT EXISTS numero_onda TEXT,
  ADD COLUMN IF NOT EXISTS descricao   TEXT;

-- ============================================================
-- Tabela: itens_tarefa
-- Cada item que compõe uma tarefa de separação (honeycomb/picking)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.itens_tarefa (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id           UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  produto_id          UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  sku                 TEXT NOT NULL,
  descricao           TEXT,
  ean                 TEXT,
  sequencia           INTEGER DEFAULT 0,
  quantidade_esperada INTEGER NOT NULL DEFAULT 1,
  quantidade_bipada   INTEGER DEFAULT 0,
  escaninho_numero    INTEGER,              -- slot 1-25 da colmeia
  status              TEXT DEFAULT 'pendente'
    CHECK (status IN ('pendente','colocando','com_produto','finalizado','aguardando')),
  bipado_por          TEXT,                 -- operador que bipou
  bipado_em           TIMESTAMPTZ,
  finalizado_em       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_tarefa  ON public.itens_tarefa(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_sku     ON public.itens_tarefa(sku);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_status  ON public.itens_tarefa(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_cor_colmeia  ON public.tarefas(cor_colmeia);

-- RLS
ALTER TABLE public.itens_tarefa ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "it_all" ON public.itens_tarefa;
CREATE POLICY "it_all" ON public.itens_tarefa FOR ALL USING (true);

-- Permissão de escrita em tarefas (era só leitura)
DROP POLICY IF EXISTS "tarefas_all" ON public.tarefas;
CREATE POLICY "tarefas_all" ON public.tarefas FOR ALL USING (true);
