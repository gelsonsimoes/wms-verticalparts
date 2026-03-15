-- Migration: RBAC - Adiciona role e paginas_permitidas à tabela operadores
-- Data: 2026-03-15
-- Descrição: Suporte ao sistema de convite e controle de acesso por página (RBAC)
--   - role: 'gestor' (admin, sem restrição) ou 'operador' (acesso restrito)
--   - paginas_permitidas: NULL = sem restrição; array de paths = acesso explícito

ALTER TABLE public.operadores
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'operador'
    CHECK (role IN ('gestor', 'operador')),
  ADD COLUMN IF NOT EXISTS paginas_permitidas TEXT[] DEFAULT NULL;

-- Índice para buscas por role
CREATE INDEX IF NOT EXISTS idx_operadores_role ON public.operadores(role);

-- Garante que gestores (admins) existentes não tenham restrição de páginas
UPDATE public.operadores SET role = 'gestor', paginas_permitidas = NULL
  WHERE nivel = 'Administrador';
