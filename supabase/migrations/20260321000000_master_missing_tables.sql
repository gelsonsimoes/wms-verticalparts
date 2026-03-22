-- ============================================================
-- MIGRATION MASTER: Todas as tabelas ausentes do WMS
-- Gerado em 2026-03-21 — aplicar manualmente via MCP
-- ============================================================

-- ── 1. COMPANIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.companies (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  cnpj         TEXT UNIQUE,
  razao_social TEXT,
  fantasia     TEXT,
  ie           TEXT,
  telefone     TEXT,
  email        TEXT,
  endereco     TEXT,
  cidade       TEXT,
  uf           TEXT,
  cep          TEXT,
  tipo         TEXT DEFAULT 'cliente' CHECK (tipo IN ('cliente','fornecedor','transportadora','proprio')),
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_all" ON public.companies FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON public.companies(cnpj);

-- ── 2. CLIENTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clientes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social TEXT NOT NULL,
  fantasia     TEXT,
  cnpj         TEXT,
  cpf          TEXT,
  ie           TEXT,
  tipo         TEXT DEFAULT 'PJ' CHECK (tipo IN ('PJ','PF')),
  telefone     TEXT,
  email        TEXT,
  endereco     TEXT,
  cidade       TEXT,
  uf           TEXT,
  cep          TEXT,
  ativo        BOOLEAN DEFAULT true,
  codigo_omie  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clientes_all" ON public.clientes FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON public.clientes(cnpj);

-- ── 3. VEICULOS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.veiculos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  placa           TEXT NOT NULL UNIQUE,
  modelo          TEXT,
  marca           TEXT,
  ano             INTEGER,
  tipo            TEXT DEFAULT 'caminhao' CHECK (tipo IN ('caminhao','van','moto','carro','outro')),
  capacidade_kg   NUMERIC(10,2),
  capacidade_m3   NUMERIC(10,2),
  motorista       TEXT,
  status          TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel','em_rota','manutencao','inativo')),
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "veiculos_all" ON public.veiculos FOR ALL USING (true);

-- ── 4. ROTAS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rotas (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo       TEXT NOT NULL UNIQUE,
  nome         TEXT NOT NULL,
  descricao    TEXT,
  regioes      TEXT[],
  dias_semana  INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rotas_all" ON public.rotas FOR ALL USING (true);

-- ── 5. SETORES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.setores (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  setor        TEXT NOT NULL,
  descricao    TEXT,
  responsavel  TEXT,
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.setores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "setores_all" ON public.setores FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_setores_warehouse ON public.setores(warehouse_id);

-- ── 6. AREAS_ARMAZEM ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.areas_armazem (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  nome         TEXT NOT NULL,
  codigo       TEXT,
  tipo         TEXT DEFAULT 'armazenagem' CHECK (tipo IN ('armazenagem','picking','expedicao','recebimento','quarentena','devolucao','outros')),
  capacidade   INTEGER,
  descricao    TEXT,
  ativo        BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.areas_armazem ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_armazem_all" ON public.areas_armazem FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_areas_armazem_warehouse ON public.areas_armazem(warehouse_id);

-- ── 7. LOTES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lotes (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id    TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  produto_id      UUID REFERENCES public.produtos(id) ON DELETE CASCADE,
  sku             TEXT,
  numero_lote     TEXT NOT NULL,
  data_fabricacao DATE,
  data_validade   DATE,
  quantidade      NUMERIC(12,3) DEFAULT 0,
  status          TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','bloqueado','vencido','consumido')),
  fornecedor      TEXT,
  nota_entrada    TEXT,
  observacao      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.lotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lotes_all" ON public.lotes FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_lotes_warehouse ON public.lotes(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_lotes_produto ON public.lotes(produto_id);
CREATE INDEX IF NOT EXISTS idx_lotes_validade ON public.lotes(data_validade);

-- ── 8. ITENS_TAREFA ──────────────────────────────────────────
-- Dependente: tarefas (picking, conferência, alocação)
-- Alimenta: HoneycombCheck, BlindCheck, WaveSLADashboard
CREATE TABLE IF NOT EXISTS public.itens_tarefa (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id            UUID NOT NULL REFERENCES public.tarefas(id) ON DELETE CASCADE,
  produto_id           UUID REFERENCES public.produtos(id),
  sku                  TEXT NOT NULL,
  descricao            TEXT,
  sequencia            INTEGER DEFAULT 0,
  quantidade_esperada  NUMERIC(12,3) NOT NULL DEFAULT 1,
  quantidade_conferida NUMERIC(12,3) DEFAULT 0,
  endereco_id          UUID REFERENCES public.enderecos(id),
  escaninho_numero     INTEGER,
  status               TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','colocando','com_produto','finalizado','divergencia')),
  bipado_em            TIMESTAMPTZ,
  finalizado_em        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.itens_tarefa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itens_tarefa_all" ON public.itens_tarefa FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_tarefa ON public.itens_tarefa(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_itens_tarefa_sku ON public.itens_tarefa(sku);

-- Adiciona cor_colmeia + warehouse_id (TEXT) em tarefas
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS cor_colmeia TEXT;
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS warehouse_id_txt TEXT;

-- ── 9. MOVIMENTO_ESTOQUE ──────────────────────────────────────
-- Registra todas as entradas/saídas — base do Kardex
CREATE TABLE IF NOT EXISTS public.movimento_estoque (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id     TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  produto_id       UUID REFERENCES public.produtos(id),
  sku              TEXT,
  descricao        TEXT,
  tipo_movimento   TEXT NOT NULL CHECK (tipo_movimento IN (
    'entrada','saida','transferencia','ajuste','entrada_ajuste','saida_ajuste',
    'entrada_recebimento','saida_expedicao','inventario'
  )),
  quantidade       NUMERIC(12,3) NOT NULL DEFAULT 0,
  quantidade_antes NUMERIC(12,3) DEFAULT 0,
  quantidade_apos  NUMERIC(12,3) DEFAULT 0,
  endereco_id      UUID REFERENCES public.enderecos(id),
  referencia_tipo  TEXT,
  referencia_id    TEXT,
  operador_id      UUID REFERENCES public.operadores(id),
  observacao       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.movimento_estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movimento_estoque_all" ON public.movimento_estoque FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_mov_estoque_warehouse ON public.movimento_estoque(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_mov_estoque_produto ON public.movimento_estoque(produto_id);
CREATE INDEX IF NOT EXISTS idx_mov_estoque_created ON public.movimento_estoque(created_at DESC);

-- ── 10. ITENS_NOTA_SAIDA ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.itens_nota_saida (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nota_id      UUID REFERENCES public.notas_saida(id) ON DELETE CASCADE,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  produto_id   UUID REFERENCES public.produtos(id),
  sku          TEXT,
  descricao    TEXT,
  quantidade   NUMERIC(12,3) DEFAULT 0,
  valor_unit   NUMERIC(15,4) DEFAULT 0,
  valor_total  NUMERIC(15,4) DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.itens_nota_saida ENABLE ROW LEVEL SECURITY;
CREATE POLICY "itens_nota_saida_all" ON public.itens_nota_saida FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_itens_nota_saida_nota ON public.itens_nota_saida(nota_id);

-- ── 11. CONFERENCIA_CEGA ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conferencia_cega (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  nota_id      UUID REFERENCES public.notas_saida(id),
  nf           TEXT,
  operador_id  UUID REFERENCES public.operadores(id),
  status       TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento','aprovada','divergente','cancelada')),
  observacao   TEXT,
  iniciado_em  TIMESTAMPTZ DEFAULT NOW(),
  finalizado_em TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.conferencia_cega ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conferencia_cega_all" ON public.conferencia_cega FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_conf_cega_warehouse ON public.conferencia_cega(warehouse_id);

CREATE TABLE IF NOT EXISTS public.conferencia_cega_itens (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conferencia_id UUID NOT NULL REFERENCES public.conferencia_cega(id) ON DELETE CASCADE,
  sku            TEXT NOT NULL,
  descricao      TEXT,
  qtd_esperada   NUMERIC(12,3) DEFAULT 0,
  qtd_bipada     NUMERIC(12,3) DEFAULT 0,
  status         TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','ok','divergente')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.conferencia_cega_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conf_cega_itens_all" ON public.conferencia_cega_itens FOR ALL USING (true);

-- ── 12. CROSS_DOCKING ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cross_docking (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  pedido_ref   TEXT,
  cliente      TEXT,
  transportadora TEXT,
  status       TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando','recebido','conferido','expedido','cancelado')),
  doca_entrada INTEGER,
  doca_saida   INTEGER,
  prazo_expedicao TIMESTAMPTZ,
  observacao   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cross_docking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cross_docking_all" ON public.cross_docking FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_cross_docking_warehouse ON public.cross_docking(warehouse_id);

CREATE TABLE IF NOT EXISTS public.cross_docking_itens (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cross_docking_id UUID NOT NULL REFERENCES public.cross_docking(id) ON DELETE CASCADE,
  sku             TEXT NOT NULL,
  descricao       TEXT,
  quantidade      NUMERIC(12,3) DEFAULT 0,
  bipado          BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cross_docking_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cross_docking_itens_all" ON public.cross_docking_itens FOR ALL USING (true);

-- ── 13. DEVOLUCOES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.devolucoes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  nf_origem    TEXT,
  cliente      TEXT,
  motivo       TEXT,
  status       TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','em_analise','aprovada','reprovada','reintegrada')),
  valor_total  NUMERIC(15,4) DEFAULT 0,
  operador_id  UUID REFERENCES public.operadores(id),
  observacao   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.devolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devolucoes_all" ON public.devolucoes FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_devolucoes_warehouse ON public.devolucoes(warehouse_id);

CREATE TABLE IF NOT EXISTS public.devolucao_itens (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  devolucao_id UUID NOT NULL REFERENCES public.devolucoes(id) ON DELETE CASCADE,
  produto_id   UUID REFERENCES public.produtos(id),
  sku          TEXT NOT NULL,
  descricao    TEXT,
  quantidade   NUMERIC(12,3) DEFAULT 0,
  valor_unit   NUMERIC(15,4) DEFAULT 0,
  status_item  TEXT DEFAULT 'ok' CHECK (status_item IN ('ok','danificado','avariado')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.devolucao_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "devolucao_itens_all" ON public.devolucao_itens FOR ALL USING (true);

-- ── 14. DOCAS_ATIVIDADES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.docas_atividades (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  doca_numero  INTEGER NOT NULL,
  tipo         TEXT DEFAULT 'recebimento' CHECK (tipo IN ('recebimento','expedicao','transferencia')),
  status       TEXT DEFAULT 'disponivel' CHECK (status IN ('disponivel','ocupada','bloqueada')),
  veiculo_id   UUID REFERENCES public.veiculos(id),
  placa        TEXT,
  transportadora TEXT,
  operador_id  UUID REFERENCES public.operadores(id),
  inicio_em    TIMESTAMPTZ,
  fim_em       TIMESTAMPTZ,
  observacao   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.docas_atividades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "docas_atividades_all" ON public.docas_atividades FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_docas_atividades_warehouse ON public.docas_atividades(warehouse_id);

-- ── 15. PORTARIA ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portaria (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id  TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  tipo          TEXT DEFAULT 'entrada' CHECK (tipo IN ('entrada','saida')),
  tipo_veiculo  TEXT DEFAULT 'caminhao' CHECK (tipo_veiculo IN ('caminhao','van','moto','carro','pedestre','outro')),
  placa         TEXT,
  motorista     TEXT,
  cpf_motorista TEXT,
  empresa       TEXT,
  motivo        TEXT,
  doca_numero   INTEGER,
  status        TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando','autorizado','em_patio','liberado','negado')),
  entrada_em    TIMESTAMPTZ DEFAULT NOW(),
  saida_em      TIMESTAMPTZ,
  operador_id   UUID REFERENCES public.operadores(id),
  observacao    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.portaria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "portaria_all" ON public.portaria FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_portaria_warehouse ON public.portaria(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_portaria_entrada ON public.portaria(entrada_em DESC);

-- ── 16. CARGAS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cargas (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id    TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  codigo          TEXT,
  tipo            TEXT DEFAULT 'expedicao' CHECK (tipo IN ('expedicao','recebimento','transferencia')),
  status          TEXT DEFAULT 'planejado' CHECK (status IN ('planejado','em_carregamento','carregado','em_transito','entregue','cancelado')),
  veiculo_id      UUID REFERENCES public.veiculos(id),
  rota_id         UUID REFERENCES public.rotas(id),
  motorista       TEXT,
  peso_kg         NUMERIC(12,3),
  volume_m3       NUMERIC(12,3),
  previsao_saida  TIMESTAMPTZ,
  saida_em        TIMESTAMPTZ,
  previsao_entrega TIMESTAMPTZ,
  entrega_em      TIMESTAMPTZ,
  observacao      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.cargas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cargas_all" ON public.cargas FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_cargas_warehouse ON public.cargas(warehouse_id);

-- ── 17. ORDENS_SERVICO ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ordens_servico (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  numero       TEXT,
  tipo         TEXT DEFAULT 'manutencao' CHECK (tipo IN ('manutencao','limpeza','instalacao','inspecao','outro')),
  status       TEXT DEFAULT 'aberta' CHECK (status IN ('aberta','em_execucao','pausada','concluida','cancelada')),
  descricao    TEXT,
  responsavel  TEXT,
  solicitante  TEXT,
  prioridade   TEXT DEFAULT 'Normal' CHECK (prioridade IN ('Baixa','Normal','Alta','Urgente')),
  data_abertura TIMESTAMPTZ DEFAULT NOW(),
  data_prazo   TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  observacao   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ordens_servico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ordens_servico_all" ON public.ordens_servico FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_warehouse ON public.ordens_servico(warehouse_id);

-- ── 18. PESAGENS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pesagens (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  tipo         TEXT DEFAULT 'entrada' CHECK (tipo IN ('entrada','saida','tara')),
  placa        TEXT,
  motorista    TEXT,
  transportadora TEXT,
  peso_bruto   NUMERIC(12,3),
  peso_tara    NUMERIC(12,3),
  peso_liquido NUMERIC(12,3) GENERATED ALWAYS AS (COALESCE(peso_bruto,0) - COALESCE(peso_tara,0)) STORED,
  nf           TEXT,
  nota_id      UUID REFERENCES public.notas_saida(id),
  operador_id  UUID REFERENCES public.operadores(id),
  status       TEXT DEFAULT 'registrado' CHECK (status IN ('registrado','liberado','retido')),
  observacao   TEXT,
  pesado_em    TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.pesagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pesagens_all" ON public.pesagens FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_pesagens_warehouse ON public.pesagens(warehouse_id);

-- ── 19. SYNC_LOGS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id),
  fonte        TEXT NOT NULL,
  operacao     TEXT NOT NULL,
  status       TEXT DEFAULT 'sucesso' CHECK (status IN ('sucesso','erro','parcial')),
  registros    INTEGER DEFAULT 0,
  detalhes     JSONB DEFAULT '{}',
  erro_msg     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_logs_all" ON public.sync_logs FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON public.sync_logs(created_at DESC);

-- ── 20. WMS_SETTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wms_settings (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
  chave        TEXT NOT NULL,
  valor        TEXT,
  tipo         TEXT DEFAULT 'texto' CHECK (tipo IN ('texto','numero','booleano','json')),
  descricao    TEXT,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(warehouse_id, chave)
);
ALTER TABLE public.wms_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wms_settings_all" ON public.wms_settings FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_wms_settings_warehouse ON public.wms_settings(warehouse_id);

-- ── 21. GRUPOS_ACESSO (alias de user_groups) ─────────────────
-- Páginas referenciam 'grupos_acesso' mas a tabela é 'user_groups'
-- Criamos a VIEW para compatibilidade
CREATE OR REPLACE VIEW public.grupos_acesso AS
  SELECT * FROM public.user_groups;

-- ── 22. ALOCACOES (alias de alocacao_estoque) ─────────────────
CREATE OR REPLACE VIEW public.alocacoes AS
  SELECT * FROM public.alocacao_estoque;

-- ── 23. VIEW: DASHBOARD_KPIS ─────────────────────────────────
-- Agrega métricas por warehouse para o Dashboard
CREATE OR REPLACE VIEW public.dashboard_kpis AS
SELECT
  w.id                                                         AS warehouse_id,
  w.nome                                                       AS warehouse_nome,
  COUNT(e.id)                                                  AS total_enderecos,
  COUNT(ae.id)                                                 AS enderecos_ocupados,
  CASE WHEN COUNT(e.id) > 0
    THEN ROUND(COUNT(ae.id)::numeric / COUNT(e.id) * 100, 1)
    ELSE 0 END                                                 AS pct_ocupacao,
  COUNT(e.id) - COUNT(ae.id)                                   AS modulos_vazios,
  (SELECT COUNT(*) FROM public.notas_saida ns
   WHERE ns.warehouse_id = w.id
     AND ns.situacao IN ('pendente','separando'))               AS pedidos_pendentes,
  (SELECT COUNT(*) FROM public.notas_saida ns2
   WHERE ns2.warehouse_id = w.id
     AND DATE(ns2.data_referencia) = CURRENT_DATE)             AS expedicoes_hoje,
  (SELECT COUNT(*) FROM public.tarefas t
   WHERE t.warehouse_id::text = w.id
     AND t.status IN ('pendente','em_execucao'))               AS ondas_ativas,
  (SELECT COUNT(*) FROM public.produtos p2 WHERE p2.ativo IS DISTINCT FROM false) AS total_skus_ativos,
  (SELECT COUNT(*) FROM public.movimento_estoque me
   WHERE me.warehouse_id = w.id
     AND DATE(me.created_at) = CURRENT_DATE)                   AS movimentos_hoje,
  NOW()                                                        AS calculado_em
FROM public.warehouses w
LEFT JOIN public.enderecos e  ON e.warehouse_id = w.id::text
LEFT JOIN public.alocacao_estoque ae ON ae.endereco_id = e.id AND ae.warehouse_id = w.id::text
GROUP BY w.id, w.nome;

-- ── 24. VIEW: MAPA_ARMAZEM ────────────────────────────────────
-- Mapa visual do estoque com posição + produto + quantidade
CREATE OR REPLACE VIEW public.mapa_armazem AS
SELECT
  e.id                 AS endereco_id,
  e.warehouse_id,
  e.codigo             AS endereco,
  e.rua,
  e.coluna,
  e.nivel,
  e.capacidade,
  e.status             AS status_endereco,
  ae.produto_id,
  ae.quantidade,
  p.sku,
  p.descricao          AS produto_descricao,
  p.unidade,
  ae.updated_at        AS ultima_movimentacao
FROM public.enderecos e
LEFT JOIN public.alocacao_estoque ae ON ae.endereco_id = e.id
LEFT JOIN public.produtos p ON p.id = ae.produto_id;

-- ── 25. VIEW: V_MONITORAMENTO_EXPEDICAO ───────────────────────
-- Visão consolidada para o OutboundMonitoring
CREATE OR REPLACE VIEW public.v_monitoramento_expedicao AS
SELECT
  ns.id,
  ns.warehouse_id,
  ns.nf,
  ns.serie,
  ns.cliente,
  ns.situacao,
  ns.valor,
  ns.total_itens,
  ns.sep_ini,
  ns.sep_fim,
  ns.conf_ini,
  ns.conf_fim,
  ns.data_referencia,
  ns.last_update,
  ns.created_at,
  CASE
    WHEN ns.situacao = 'finalizada'  THEN 'Finalizada'
    WHEN ns.situacao = 'conferindo'  THEN 'Em Conferência'
    WHEN ns.situacao = 'separando'   THEN 'Em Separação'
    WHEN ns.situacao = 'cancelada'   THEN 'Cancelada'
    ELSE 'Pendente'
  END AS situacao_label,
  -- Tempo em separação (minutos)
  CASE WHEN ns.sep_ini IS NOT NULL AND ns.sep_fim IS NULL
    THEN EXTRACT(EPOCH FROM (NOW() - ns.sep_ini))/60
    WHEN ns.sep_ini IS NOT NULL AND ns.sep_fim IS NOT NULL
    THEN EXTRACT(EPOCH FROM (ns.sep_fim - ns.sep_ini))/60
    ELSE NULL
  END AS minutos_separacao
FROM public.notas_saida ns;

-- ── Triggers auto updated_at para novas tabelas ───────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_companies_updated_at')
    THEN CREATE TRIGGER trg_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clientes_updated_at')
    THEN CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_veiculos_updated_at')
    THEN CREATE TRIGGER trg_veiculos_updated_at BEFORE UPDATE ON public.veiculos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_rotas_updated_at')
    THEN CREATE TRIGGER trg_rotas_updated_at BEFORE UPDATE ON public.rotas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_setores_updated_at')
    THEN CREATE TRIGGER trg_setores_updated_at BEFORE UPDATE ON public.setores FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_areas_armazem_updated_at')
    THEN CREATE TRIGGER trg_areas_armazem_updated_at BEFORE UPDATE ON public.areas_armazem FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_lotes_updated_at')
    THEN CREATE TRIGGER trg_lotes_updated_at BEFORE UPDATE ON public.lotes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_docas_updated_at')
    THEN CREATE TRIGGER trg_docas_updated_at BEFORE UPDATE ON public.docas_atividades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_portaria_updated_at') THEN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cargas_updated_at')
    THEN CREATE TRIGGER trg_cargas_updated_at BEFORE UPDATE ON public.cargas FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_ordens_servico_updated_at')
    THEN CREATE TRIGGER trg_ordens_servico_updated_at BEFORE UPDATE ON public.ordens_servico FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cross_docking_updated_at')
    THEN CREATE TRIGGER trg_cross_docking_updated_at BEFORE UPDATE ON public.cross_docking FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_devolucoes_updated_at')
    THEN CREATE TRIGGER trg_devolucoes_updated_at BEFORE UPDATE ON public.devolucoes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); END IF;
END $$;
