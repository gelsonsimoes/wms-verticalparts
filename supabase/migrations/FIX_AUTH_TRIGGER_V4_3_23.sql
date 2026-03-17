-- ============================================================================
-- SCRIPT DE AJUSTE: TRIGGER DE AUTENTICAÇÃO
-- OBJETIVO: Sincronizar a trigger do Supabase Auth com o novo Schema v4.3.23
-- ============================================================================

-- 1. Atualizar a função handle_new_user com os nomes de colunas corretos (Português)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.operadores (
    id, 
    usuario, 
    nome, 
    email, 
    cargo, 
    nivel, 
    status, 
    entidade
  )
  VALUES (
    new.id::text, -- Garante que o ID seja tratado como texto
    COALESCE(new.raw_user_meta_data->>'usuario', new.raw_user_meta_data->>'employee_id', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'nome', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'cargo', ''),
    COALESCE(new.raw_user_meta_data->>'nivel', new.raw_user_meta_data->>'role', 'Operador'),
    COALESCE(new.raw_user_meta_data->>'status', 'Ativo'),
    COALESCE(new.raw_user_meta_data->>'entidade', new.raw_user_meta_data->>'branch', 'VerticalParts Matriz')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Garantir que a trigger exista (Caso tenha sido deletada acidentalmente)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
