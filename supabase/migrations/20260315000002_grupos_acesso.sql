-- Migration: Sistema de Grupos de Acesso (RBAC por grupo)
-- Data: 2026-03-15
-- Modelo inspirado no Omie ERP: grupos com páginas predefinidas,
-- admin atribui grupo ao convidar usuário.

-- ── 1. Criar tabela grupos_acesso ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.grupos_acesso (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome        TEXT NOT NULL UNIQUE,
  descricao   TEXT,
  tipo        TEXT NOT NULL DEFAULT 'personalizado'
                CHECK (tipo IN ('padrao', 'personalizado')),
  paginas     TEXT[] NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.grupos_acesso ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler os grupos (para montar dropdowns)
CREATE POLICY "Leitura autenticada grupos" ON public.grupos_acesso
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Apenas gestores podem criar/editar/excluir grupos
CREATE POLICY "Gestores gerenciam grupos" ON public.grupos_acesso
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.operadores
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- ── 2. Adicionar grupo_acesso_id em operadores ─────────────────
ALTER TABLE public.operadores
  ADD COLUMN IF NOT EXISTS grupo_acesso_id UUID
    REFERENCES public.grupos_acesso(id) ON DELETE SET NULL;

-- ── 3. Inserir os 5 grupos padrão VerticalParts ───────────────
INSERT INTO public.grupos_acesso (nome, descricao, tipo, paginas) VALUES

-- 3.1 Administrador (acesso total — role='gestor' ignora paginas)
(
  'Administrador',
  'Acesso total ao sistema. Gerencia usuários, grupos, configurações e integrações.',
  'padrao',
  ARRAY[]::TEXT[]
),

-- 3.2 Operadores WMS (chão de fábrica)
(
  'Operadores WMS',
  'Equipe de armazém. Recebimento, alocação, picking, packing e expedição.',
  'padrao',
  ARRAY[
    '/',
    '/operacao/cruzar-docas',
    '/operacao/processar-devolucoes',
    '/operacao/pesar-cargas',
    '/operacao/gerenciar-recebimento',
    '/operacao/conferir-recebimento',
    '/operacao/gerar-mapa',
    '/operacao/conferencia-cega',
    '/operacao/alocar-estoque',
    '/operacao/kanban-alocacao',
    '/operacao/separar-pedidos',
    '/operacao/embalar-pedidos',
    '/operacao/monitorar-saida',
    '/operacao/recebimento',
    '/operacao/estacao-kits',
    '/operacao/conferencia-colmeia',
    '/operacao/ordem-servico',
    '/operacao/pesagem-rodoviaria',
    '/operacao/mapa-visual',
    '/operacao/buffer-1',
    '/operacao/buffer-2',
    '/operacao/gerenciamento-pedidos',
    '/planejamento/monitorar-atividades',
    '/planejamento/atividades-docas',
    '/estoque/analisar-estoque',
    '/estoque/remanejar',
    '/estoque/controlar-lotes',
    '/estoque/monitorar-avarias',
    '/cadastros/enderecos',
    '/cadastros/produtos',
    '/config/etiquetas'
  ]
),

-- 3.3 Engenheiros (técnicos de elevadores)
(
  'Engenheiros',
  'Equipe técnica. SKU, ordens de serviço, catálogo de peças e análise de estoque.',
  'padrao',
  ARRAY[
    '/',
    '/operacao/ordem-servico',
    '/operacao/gestao-seguros',
    '/estoque/analisar-estoque',
    '/estoque/consultar-kardex',
    '/estoque/controlar-lotes',
    '/estoque/monitorar-avarias',
    '/cadastros/produtos',
    '/cadastros/clientes',
    '/cadastros/enderecos',
    '/config/gerar-sku',
    '/config/etiquetas',
    '/indicadores/ocupacao',
    '/indicadores/produtividade'
  ]
),

-- 3.4 Compras / Importação
(
  'Compras / Importação',
  'Equipe de compras e importação. NF-e, CT-e, Omie ERP, recebimento e contratos.',
  'padrao',
  ARRAY[
    '/',
    '/operacao/gerenciar-recebimento',
    '/operacao/conferir-recebimento',
    '/operacao/gestao-seguros',
    '/estoque/analisar-estoque',
    '/estoque/consultar-kardex',
    '/estoque/controlar-lotes',
    '/cadastros/produtos',
    '/cadastros/clientes',
    '/cadastros/empresas',
    '/config/gerar-sku',
    '/fiscal/gerenciar-nfe',
    '/fiscal/gerenciar-cte',
    '/fiscal/armazem-geral',
    '/financeiro/calcular-diarias',
    '/financeiro/contratos',
    '/integrar/omie',
    '/integrar/ordens-erp',
    '/integrar/alertas',
    '/indicadores/integracao'
  ]
),

-- 3.5 Vendedores
(
  'Vendedores',
  'Equipe de vendas. Consulta de estoque, catálogo de produtos e Omie ERP.',
  'padrao',
  ARRAY[
    '/',
    '/estoque/analisar-estoque',
    '/estoque/consultar-kardex',
    '/cadastros/produtos',
    '/cadastros/clientes',
    '/integrar/omie',
    '/integrar/ordens-erp',
    '/indicadores/financeiro'
  ]
)

ON CONFLICT (nome) DO NOTHING;
