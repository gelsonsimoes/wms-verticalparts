-- ============================================================================
-- SCRIPT "LIMPA E CRIA" - VERSION 4.3.23 (FIX UUID TO TEXT)
-- OBJETIVO: Permitir importação de IDs customizados (ex: wh..., ug..., ee...)
-- INSTRUÇÕES: Cole este código no SQL Editor do Supabase e clique em RUN.
-- ============================================================================

-- 0. Limpeza total
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.alocacao_estoque CASCADE;
DROP TABLE IF EXISTS public.tarefas CASCADE;
DROP TABLE IF EXISTS public.terefas CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.itens_tarefa CASCADE;
DROP TABLE IF EXISTS public.produtos CASCADE;
DROP TABLE IF EXISTS public.enderecos CASCADE;
DROP TABLE IF EXISTS public.warehouses CASCADE;
DROP TABLE IF EXISTS public.operadores CASCADE;
DROP TABLE IF EXISTS public.recebimentos CASCADE;
DROP TABLE IF EXISTS public.coletas CASCADE;
DROP TABLE IF EXISTS public.coleta CASCADE;
DROP TABLE IF EXISTS public.estoques CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.user_groups CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.sync_logs CASCADE;

-- 1. Tabela: operadores
CREATE TABLE public.operadores (
    id            TEXT PRIMARY KEY, -- Alterado para TEXT para aceitar IDs do CSV
    usuario       TEXT NOT NULL UNIQUE,
    nome          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    cargo         TEXT,
    nivel         TEXT NOT NULL DEFAULT 'Operador',
    departamento  TEXT,
    status        TEXT NOT NULL DEFAULT 'Ativo',
    entidade      TEXT DEFAULT 'VerticalParts Matriz',
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela: warehouses
CREATE TABLE public.warehouses (
    id              TEXT PRIMARY KEY, -- Alterado para TEXT (ex: wh0001...)
    codigo_interno  TEXT NOT NULL UNIQUE,
    nome            TEXT NOT NULL,
    entidade        TEXT,
    tipo            TEXT DEFAULT 'Distribuição',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: enderecos
CREATE TABLE public.enderecos (
    id              TEXT PRIMARY KEY, -- Alterado para TEXT (ex: ee0001...)
    codigo          TEXT NOT NULL UNIQUE,
    rua             TEXT NOT NULL,
    porta_palete    TEXT NOT NULL,
    nivel           TEXT NOT NULL,
    posicao         INTEGER,
    tipo            TEXT DEFAULT 'Intermediário',
    status          TEXT DEFAULT 'Disponível',
    capacidade      INTEGER DEFAULT 1,
    warehouse_id    TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
    ativo           BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: produtos
CREATE TABLE public.produtos (
    id                  TEXT PRIMARY KEY, -- Alterado para TEXT
    sku                 TEXT NOT NULL UNIQUE,
    descricao           TEXT NOT NULL,
    unidade             TEXT NOT NULL DEFAULT 'PC',
    tipo                TEXT,
    familia             TEXT,
    marca               TEXT,
    ncm                 TEXT,
    ean                 TEXT,
    peso_bruto          NUMERIC(15,3),
    peso_liquido        NUMERIC(15,3),
    altura              NUMERIC(15,2),
    largura             NUMERIC(15,2),
    profundidade        NUMERIC(15,2),
    local_estoque       TEXT,
    dias_crossdocking   INTEGER DEFAULT 0,
    estoque_erp         NUMERIC(15,3) DEFAULT 0,
    estoque_wms         NUMERIC(15,3) DEFAULT 0,
    estoque_real        NUMERIC(15,3) DEFAULT 0,
    estoque_minimo      NUMERIC(15,3) DEFAULT 0,
    preco_venda         NUMERIC(15,2),
    preco_custo         NUMERIC(15,2),
    movimenta_estoque   BOOLEAN DEFAULT true,
    regra_expedicao     TEXT DEFAULT 'FIFO',
    observacao          TEXT,
    descricao_detalhada TEXT,
    codigo_integracao   TEXT,
    embalagens          JSONB DEFAULT '[]',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    ativo               BOOLEAN DEFAULT true
);

-- 5. Tabela: alocacao_estoque
CREATE TABLE public.alocacao_estoque (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
    endereco_id  TEXT REFERENCES public.enderecos(id) ON DELETE CASCADE,
    produto_id   TEXT REFERENCES public.produtos(id) ON DELETE CASCADE,
    quantidade   NUMERIC(15,3) DEFAULT 0,
    updated_at   TIMESTAMPTZ DEFAULT NOW(),
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(endereco_id, produto_id)
);

-- 6. Tabela: tarefas
CREATE TABLE public.tarefas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo        TEXT NOT NULL,
    prioridade  TEXT NOT NULL DEFAULT 'Normal',
    status      TEXT NOT NULL DEFAULT 'pendente',
    operador_id TEXT REFERENCES public.operadores(id) ON DELETE SET NULL,
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
    detalhes    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela: activity_logs
CREATE TABLE public.activity_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID, -- Mantido UUID apenas para o Auth do Supabase se necessário
    user_email    TEXT NOT NULL,
    user_name     TEXT,
    action        TEXT NOT NULL,
    resource_type TEXT,
    resource_id   TEXT,
    resource_name TEXT,
    details       JSONB DEFAULT '{}',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela: user_groups
CREATE TABLE public.user_groups (
    id                TEXT PRIMARY KEY, -- Alterado para TEXT (ex: ug0001...)
    grupo             TEXT NOT NULL UNIQUE,
    ativa_exportacoes BOOLEAN DEFAULT false,
    permitir_download BOOLEAN DEFAULT false,
    coletor           JSONB DEFAULT '[]',
    enterprise        JSONB DEFAULT '[]',
    web               JSONB DEFAULT '[]',
    operacao_deposito JSONB DEFAULT '[]',
    atividades        JSONB DEFAULT '[]',
    usuarios          JSONB DEFAULT '[]',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabela: companies
CREATE TABLE public.companies (
    id        TEXT PRIMARY KEY, -- Alterado para TEXT
    name      TEXT NOT NULL,
    cnpj      TEXT NOT NULL UNIQUE,
    address   TEXT,
    currency  TEXT DEFAULT 'BRL',
    timezone  TEXT DEFAULT 'GMT-3',
    status    TEXT DEFAULT 'Ativo',
    tipo      TEXT DEFAULT 'empresa',
    email     TEXT,
    telefone  TEXT,
    cidade    TEXT,
    estado    TEXT,
    cep       TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alocacao_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Políticas
DO $$ 
BEGIN
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.operadores FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.warehouses FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.enderecos FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.produtos FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.alocacao_estoque FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.tarefas FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.activity_logs FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.user_groups FOR ALL USING (auth.uid() IS NOT NULL)';
    EXECUTE 'CREATE POLICY "Acesso Autenticado" ON public.companies FOR ALL USING (auth.uid() IS NOT NULL)';
EXCEPTION WHEN OTHERS THEN 
    NULL; 
END $$;
