-- =====================================================================
-- Migration: itens_tarefa + extensões de tarefas para ondas e colmeia
-- Projeto: WMS VerticalParts
-- Data: 2026-03-21
-- =====================================================================

-- 1. EXTENSÃO DA TABELA TAREFAS (campos de onda e colmeia)
ALTER TABLE public.tarefas
  ADD COLUMN IF NOT EXISTS titulo_onda    TEXT,
  ADD COLUMN IF NOT EXISTS doca           TEXT,
  ADD COLUMN IF NOT EXISTS config         TEXT DEFAULT 'Padrão',
  ADD COLUMN IF NOT EXISTS cor_colmeia    TEXT,
  ADD COLUMN IF NOT EXISTS colmeias_selecionadas TEXT[],
  ADD COLUMN IF NOT EXISTS total_itens    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_pedidos  INTEGER DEFAULT 0;

-- 2. TABELA: itens_tarefa (itens de picking de uma onda/tarefa)
CREATE TABLE IF NOT EXISTS public.itens_tarefa (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id            UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  produto_id           UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  sku                  TEXT NOT NULL,
  descricao            TEXT,
  sequencia            INTEGER DEFAULT 0,
  quantidade_esperada  INTEGER NOT NULL DEFAULT 1,
  quantidade_conferida INTEGER DEFAULT 0,
  endereco_id          TEXT,
  escaninho_numero     INTEGER,                -- posição física na colmeia (1-25)
  status               TEXT NOT NULL DEFAULT 'pendente'
                         CHECK (status IN ('pendente','coletando','com_produto','finalizado','divergencia')),
  bipado_em            TIMESTAMPTZ,
  finalizado_em        TIMESTAMPTZ,
  operador_id          UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_tarefa_id  ON public.itens_tarefa (tarefa_id);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_sku        ON public.itens_tarefa (sku);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_status     ON public.itens_tarefa (status);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_escaninho  ON public.itens_tarefa (tarefa_id, escaninho_numero);

-- 3. TABELA: ordens_saida_itens (itens das ordens de saída — dependente de notas_saida)
-- Necessário para PackingStation e BlindCheck (pré-verifica itens separados)
CREATE TABLE IF NOT EXISTS public.ordens_saida_itens (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nota_saida_id     UUID NOT NULL REFERENCES public.notas_saida(id) ON DELETE CASCADE,
  tarefa_id         UUID REFERENCES public.tarefas(id) ON DELETE SET NULL,
  item_tarefa_id    UUID REFERENCES public.itens_tarefa(id) ON DELETE SET NULL,
  sku               TEXT NOT NULL,
  descricao         TEXT,
  quantidade        INTEGER NOT NULL DEFAULT 1,
  quantidade_conf   INTEGER DEFAULT 0,
  status            TEXT DEFAULT 'pendente'
                      CHECK (status IN ('pendente','conferido','divergencia','excesso')),
  conferido_em      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ordens_saida_itens_nota  ON public.ordens_saida_itens (nota_saida_id);
CREATE INDEX IF NOT EXISTS idx_ordens_saida_itens_sku   ON public.ordens_saida_itens (sku);

-- 4. TABELA: movimento_estoque (kardex — log de todas as movimentações de estoque)
CREATE TABLE IF NOT EXISTS public.movimento_estoque (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  produto_id       UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  sku              TEXT NOT NULL,
  descricao        TEXT,
  tipo_movimento   TEXT NOT NULL
                     CHECK (tipo_movimento IN (
                       'entrada_recebimento','entrada_devolucao','entrada_ajuste',
                       'saida_picking','saida_expedicao','saida_ajuste',
                       'transferencia_entrada','transferencia_saida','inventario'
                     )),
  quantidade       INTEGER NOT NULL,
  quantidade_antes INTEGER,
  quantidade_apos  INTEGER,
  endereco_id      TEXT,
  lote             TEXT,
  referencia_id    TEXT,               -- ID da nota, tarefa, etc.
  referencia_tipo  TEXT,               -- 'nota_saida', 'ordem_recebimento', 'tarefa', etc.
  operador_id      UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimento_estoque_wh      ON public.movimento_estoque (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_movimento_estoque_sku     ON public.movimento_estoque (sku);
CREATE INDEX IF NOT EXISTS idx_movimento_estoque_tipo    ON public.movimento_estoque (tipo_movimento);
CREATE INDEX IF NOT EXISTS idx_movimento_estoque_data    ON public.movimento_estoque (created_at);
CREATE INDEX IF NOT EXISTS idx_movimento_estoque_ref     ON public.movimento_estoque (referencia_id);

-- 5. TABELA: lotes (controle de lotes por produto/endereço)
CREATE TABLE IF NOT EXISTS public.lotes (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  produto_id       UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  sku              TEXT NOT NULL,
  lote             TEXT NOT NULL,
  serie            TEXT,
  fabricante       TEXT,
  data_fabricacao  DATE,
  data_validade    DATE,
  quantidade       INTEGER DEFAULT 0,
  endereco_id      TEXT,
  status           TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','bloqueado','expirado','consumido')),
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lotes_wh       ON public.lotes (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_lotes_sku      ON public.lotes (sku);
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON public.lotes (data_validade);

-- 6. TABELA: avarias (registro de danos / DamageControl)
CREATE TABLE IF NOT EXISTS public.avarias (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  sku              TEXT NOT NULL,
  descricao        TEXT,
  tipo_avaria      TEXT NOT NULL
                     CHECK (tipo_avaria IN ('fisica','embalagem','validade','extravio','outro')),
  quantidade       INTEGER NOT NULL DEFAULT 1,
  endereco_id      TEXT,
  lote             TEXT,
  origem           TEXT CHECK (origem IN ('recebimento','armazenagem','picking','expedicao','devolucao')),
  status           TEXT DEFAULT 'aberta' CHECK (status IN ('aberta','em_analise','descartado','retornado_fornecedor','reaproveitado')),
  fotos            TEXT[],
  observacao       TEXT,
  operador_id      UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avarias_wh     ON public.avarias (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_avarias_status ON public.avarias (status);
CREATE INDEX IF NOT EXISTS idx_avarias_sku    ON public.avarias (sku);

-- 7. TABELA: ordens_servico (ServiceOrder 2.19)
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  numero           TEXT NOT NULL,
  tipo             TEXT DEFAULT 'manutencao' CHECK (tipo IN ('manutencao','instalacao','inspecao','calibracao','outro')),
  status           TEXT DEFAULT 'aberta' CHECK (status IN ('aberta','em_execucao','aguardando_peca','concluida','cancelada')),
  cliente          TEXT,
  equipamento      TEXT,
  descricao        TEXT,
  tecnico_id       UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  prioridade       TEXT DEFAULT 'Normal' CHECK (prioridade IN ('Baixa','Normal','Alta','Urgente')),
  data_abertura    DATE DEFAULT CURRENT_DATE,
  data_previsao    DATE,
  data_conclusao   DATE,
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_os_warehouse ON public.ordens_servico (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_os_status    ON public.ordens_servico (status);
CREATE INDEX IF NOT EXISTS idx_os_numero    ON public.ordens_servico (numero);

-- 8. TABELA: portaria (GateManager 3.7)
CREATE TABLE IF NOT EXISTS public.portaria (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  tipo             TEXT NOT NULL CHECK (tipo IN ('entrada_veiculo','saida_veiculo','entrada_pessoa','saida_pessoa')),
  placa            TEXT,
  motorista        TEXT,
  transportadora   TEXT,
  documento        TEXT,          -- NF ou CT-e associada
  doca_destino     TEXT,
  status           TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando','em_atendimento','liberado','recusado')),
  operador_id      UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  observacao       TEXT,
  entrada_em       TIMESTAMPTZ DEFAULT NOW(),
  saida_em         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portaria_wh     ON public.portaria (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_portaria_status ON public.portaria (status);
CREATE INDEX IF NOT EXISTS idx_portaria_placa  ON public.portaria (placa);

-- 9. TABELA: docas_atividades (DockActivities 3.8)
CREATE TABLE IF NOT EXISTS public.docas_atividades (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  doca             TEXT NOT NULL,
  tipo             TEXT NOT NULL CHECK (tipo IN ('recebimento','expedicao','cross_docking','manutencao')),
  status           TEXT DEFAULT 'livre' CHECK (status IN ('livre','ocupada','manutencao','reservada')),
  veiculo_placa    TEXT,
  motorista        TEXT,
  transportadora   TEXT,
  nota_id          UUID REFERENCES public.notas_saida(id) ON DELETE SET NULL,
  operador_id      UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
  inicio_em        TIMESTAMPTZ,
  fim_previsto     TIMESTAMPTZ,
  fim_real         TIMESTAMPTZ,
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docas_at_wh    ON public.docas_atividades (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_docas_at_doca  ON public.docas_atividades (doca);
CREATE INDEX IF NOT EXISTS idx_docas_at_status ON public.docas_atividades (status);

-- 10. TABELA: cargas (LoadDetails 3.6)
CREATE TABLE IF NOT EXISTS public.cargas (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  numero_carga     TEXT NOT NULL,
  status           TEXT DEFAULT 'planejada'
                     CHECK (status IN ('planejada','em_carregamento','carregada','expedida','entregue','cancelada')),
  transportadora   TEXT,
  placa            TEXT,
  motorista        TEXT,
  doca             TEXT,
  peso_total_kg    NUMERIC(10,3) DEFAULT 0,
  volume_m3        NUMERIC(10,3) DEFAULT 0,
  total_notas      INTEGER DEFAULT 0,
  roteiro          TEXT,
  observacao       TEXT,
  inicio_carga_em  TIMESTAMPTZ,
  fim_carga_em     TIMESTAMPTZ,
  saida_em         TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cargas_wh     ON public.cargas (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_cargas_status ON public.cargas (status);
CREATE INDEX IF NOT EXISTS idx_cargas_numero ON public.cargas (numero_carga);

-- 11. TABELA: manifestos (ManifestManager 3.5)
CREATE TABLE IF NOT EXISTS public.manifestos (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  numero_mdfe      TEXT,
  chave_mdfe       TEXT UNIQUE,
  status           TEXT DEFAULT 'pendente'
                     CHECK (status IN ('pendente','autorizado','encerrado','cancelado','rejeitado')),
  carga_id         UUID REFERENCES public.cargas(id) ON DELETE SET NULL,
  uf_inicio        TEXT,
  uf_fim           TEXT,
  transportadora   TEXT,
  placa            TEXT,
  motorista        TEXT,
  total_ctes       INTEGER DEFAULT 0,
  total_nfes       INTEGER DEFAULT 0,
  valor_total      NUMERIC(15,2) DEFAULT 0,
  emitido_em       TIMESTAMPTZ,
  encerrado_em     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manifestos_wh     ON public.manifestos (warehouse_id);
CREATE INDEX IF NOT EXISTS idx_manifestos_status ON public.manifestos (status);

-- ===== RLS =====
ALTER TABLE public.itens_tarefa        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_saida_itens  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimento_estoque   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avarias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portaria            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.docas_atividades    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestos          ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (ajustar para produção conforme grupos)
DO $$
DECLARE
  tbls TEXT[] := ARRAY[
    'itens_tarefa','ordens_saida_itens','movimento_estoque','lotes',
    'avarias','ordens_servico','portaria','docas_atividades','cargas','manifestos'
  ];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('CREATE POLICY "all_access_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
