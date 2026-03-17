-- 1. Tabela: operadores (Extensão do auth.users)
CREATE TABLE IF NOT EXISTS public.operadores (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario       TEXT NOT NULL UNIQUE,
  nome          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  cargo         TEXT,
  nivel         TEXT NOT NULL DEFAULT 'Operador'
                  CHECK (nivel IN ('Administrador','Supervisor','Operador','Consulta')),
  departamento  TEXT,
  status        TEXT NOT NULL DEFAULT 'Ativo'
                  CHECK (status IN ('Ativo','Inativo')),
  entidade      TEXT DEFAULT 'VerticalParts Matriz',
  avatar_url    TEXT,
  employee_id   TEXT, -- Mapeamento para login legado ou integração
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela: warehouses (Armazéns)
CREATE TABLE IF NOT EXISTS public.warehouses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_interno  TEXT NOT NULL UNIQUE,
  nome            TEXT NOT NULL,
  entidade        TEXT,
  tipo            TEXT DEFAULT 'Distribuição',
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela: enderecos (Posições de estoque)
CREATE TABLE IF NOT EXISTS public.enderecos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo          TEXT NOT NULL UNIQUE,
  rua             TEXT NOT NULL,
  porta_palete    TEXT NOT NULL,
  nivel           TEXT NOT NULL,
  posicao         INTEGER NOT NULL,
  tipo            TEXT DEFAULT 'Intermediário',
  status          TEXT DEFAULT 'Disponível'
                    CHECK (status IN ('Disponível','Ocupado','Bloqueado','Manutenção')),
  capacidade      INTEGER DEFAULT 1,
  warehouse_id    UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  ativo           BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela: produtos (Catálogo de peças)
CREATE TABLE IF NOT EXISTS public.produtos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku                 TEXT NOT NULL UNIQUE,
  nome                TEXT NOT NULL,
  descricao           TEXT NOT NULL,
  unidade             TEXT NOT NULL DEFAULT 'PC',
  tipo                TEXT,
  familia             TEXT,
  marca               TEXT,
  ncm                 TEXT,
  ean                 TEXT,
  peso_bruto          NUMERIC(10,3),
  peso_liquido        NUMERIC(10,3),
  altura              NUMERIC(10,2),
  largura             NUMERIC(10,2),
  profundidade        NUMERIC(10,2),
  local_estoque       TEXT,
  estoque_erp         INTEGER DEFAULT 0,
  estoque_wms         INTEGER DEFAULT 0,
  movimenta_estoque   BOOLEAN DEFAULT true,
  regra_expedicao     TEXT DEFAULT 'FIFO' CHECK (regra_expedicao IN ('FIFO','FEFO','LIFO')),
  ativo               BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela: alocacao_estoque (Mapa de onde estão os produtos)
CREATE TABLE IF NOT EXISTS public.alocacao_estoque (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  endereco_id  UUID REFERENCES enderecos(id) ON DELETE CASCADE,
  produto_id   UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade   NUMERIC(12,3) DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(endereco_id, produto_id)
);

-- 6. Tabela: tarefas (Picking, Recebimento, etc)
CREATE TABLE IF NOT EXISTS public.tarefas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo        TEXT NOT NULL CHECK (tipo IN ('alocacao','separacao','conferencia','expedicao','inventario','ressuprimento')),
  prioridade  TEXT NOT NULL DEFAULT 'Normal' CHECK (prioridade IN ('Normal','Alta','Urgente')),
  status      TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','em_execucao','concluida','cancelada')),
  operador_id UUID REFERENCES operadores(id) ON DELETE SET NULL,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  detalhes    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabela: activity_logs (Auditoria)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email    TEXT NOT NULL,
  user_name     TEXT,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  resource_name TEXT,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabela: user_groups (Grupos de Acesso)
CREATE TABLE IF NOT EXISTS public.user_groups (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alocacao_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_groups ENABLE ROW LEVEL SECURITY;

-- Políticas Básicas (Leitura para autenticados)
CREATE POLICY "Leitura autenticada" ON public.operadores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.warehouses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.enderecos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.produtos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.alocacao_estoque FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.tarefas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.activity_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura autenticada" ON public.user_groups FOR SELECT USING (auth.uid() IS NOT NULL);
