/**
 * Supabase Client Configuration
 * Este arquivo inicializa o cliente Supabase para toda a aplicação
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local file.\n' +
    'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.'
  );
}

// URL de produção fixa para redirecionamentos de e-mail (convites, recuperação de senha)
// Usar window.location.origin causaria links com localhost se o admin estiver no ambiente de dev
const APP_URL = import.meta.env.VITE_APP_URL || 'https://wmsverticalparts.com.br';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // lê o token do hash da URL (convites e reset de senha)
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

/**
 * Helper para autenticação
 */
export const signUp = async (email, password, fullName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

/**
 * Sistema de Convites de Usuários
 */
export const inviteUser = async (email, userData = {}) => {
  try {
    // Verifica se o e-mail já existe na tabela operadores
    const { data: existingUser } = await supabase
      .from('operadores')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return {
        success: false,
        error: 'Usuário já existe com este e-mail',
        code: 'USER_EXISTS'
      };
    }

    // Cria o usuário no Supabase Auth (o trigger handle_new_user insere em operadores automaticamente)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: crypto.randomUUID(),
      options: {
        data: {
          nome: userData.nomeUsuario || userData.name || '',
          nivel: userData.nivel || 'Operador',
          cargo: userData.cargo || '',
          departamento: userData.departamento || '',
          employee_id: userData.employee_id || null,
        },
        emailRedirectTo: `${APP_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Erro no signup:', authError);
      return { success: false, error: authError.message, code: authError.status };
    }

    return {
      success: true,
      user: authData.user,
      message: 'Convite enviado com sucesso! O usuário receberá um e-mail para definir sua senha.'
    };

  } catch (error) {
    console.error('Erro geral no convite:', error);
    return { success: false, error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' };
  }
};

/**
 * Reset de senha
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${APP_URL}/auth/callback`,
  });
  return { error };
};

/**
 * Verificar se email já existe
 */
export const checkEmailExists = async (email) => {
  const { data, error } = await supabase
    .from('operadores')
    .select('email')
    .eq('email', email)
    .maybeSingle();

  return {
    exists: !!data,
    error
  };
};

/**
 * Helpers para operações comuns
 */

// Tasks (Tarefas)
export const getTasks = async (warehouseId, status = null) => {
  let query = supabase
    .from('tarefas') // De 'tasks' para 'tarefas'
    .select('*')
    .eq('warehouse_id', warehouseId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  return query;
};

export const createTask = async (taskData) => {
  return supabase.from('tarefas').insert([taskData]).select();
};

export const updateTask = async (taskId, updates) => {
  return supabase
    .from('tarefas')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', taskId)
    .select();
};

// Stock Allocation (Alocação de Estoque)
export const getStockAllocation = async (warehouseId) => {
  return supabase
    .from('alocacao_estoque') // De 'stock_allocation' para 'alocacao_estoque'
    .select(
      `
      *,
      location:enderecos(*),
      product:produtos(*)
      `
    )
    .eq('warehouse_id', warehouseId);
};

export const updateStockAllocation = async (locationId, productId, quantity) => {
  return supabase
    .from('alocacao_estoque')
    .update({
      quantity,
      updated_at: new Date(),
    })
    .eq('endereco_id', locationId) // De 'location_id' para 'endereco_id'
    .eq('produto_id', productId)   // De 'product_id' para 'produto_id'
    .select();
};

// Inventory Movements (Movimentações)
// Tabela correta: 'movimento_estoque' (não 'inventory_movements')
export const recordMovement = async (movementData) => {
  return supabase.from('movimento_estoque').insert([movementData]).select();
};

export const getMovements = async (warehouseId, limit = 100) => {
  return supabase
    .from('movimento_estoque')
    .select('*')
    .eq('warehouse_id', warehouseId)
    .order('created_at', { ascending: false })
    .limit(limit);
};

// Endereços físicos (enderecos)
export const getLocations = async (warehouseId) => {
  return supabase
    .from('enderecos') // De 'locations' para 'enderecos'
    .select('*')
    .eq('warehouse_id', warehouseId)
    .eq('ativo', true) // De 'is_active' para 'ativo'
    .order('codigo'); // De 'code' para 'codigo'
};

// Produtos (produtos)
export const getProducts = async (warehouseId) => {
  return supabase
    .from('produtos') // De 'products' para 'produtos'
    .select('*')
    .eq('warehouse_id', warehouseId)
    .eq('ativo', true)
    .order('nome'); // De 'name' para 'nome'
};

export const getProductBySku = async (sku) => {
  return supabase.from('produtos').select('*').eq('sku', sku).single();
};

// Warehouses (Armazéns)
export const getWarehouses = async () => {
  return supabase
    .from('warehouses')
    .select('*')
    .eq('is_active', true)
    .order('name');
};

/**
 * Realtime Subscriptions
 */
export const subscribeToTasks = (warehouseId, callback) => {
  return supabase
    .from('tarefas')
    .on('*', (payload) => {
      callback(payload);
    })
    .eq('warehouse_id', warehouseId)
    .subscribe();
};

export const subscribeToStockAllocation = (warehouseId, callback) => {
  return supabase
    .from('alocacao_estoque')
    .on('*', (payload) => {
      callback(payload);
    })
    .eq('warehouse_id', warehouseId)
    .subscribe();
};

/**
 * Activity Logs — Relatório de Colaboradores (11.3)
 *
 * Pré-requisito: executar no Supabase SQL Editor:
 *   CREATE TABLE IF NOT EXISTS activity_logs (
 *     id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *     user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
 *     user_email    TEXT NOT NULL,
 *     user_name     TEXT,
 *     action        TEXT NOT NULL,
 *     resource_type TEXT,
 *     resource_id   TEXT,
 *     resource_name TEXT,
 *     details       JSONB DEFAULT '{}',
 *     created_at    TIMESTAMPTZ DEFAULT NOW()
 *   );
 *   ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
 *   CREATE POLICY "Leitura livre" ON activity_logs FOR SELECT USING (true);
 *   CREATE POLICY "Inserção autenticada" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
 */

/**
 * Registra uma ação de colaborador no banco de dados.
 * Falha silenciosamente caso a tabela não exista ainda.
 */
export const logActivity = async ({
  userId,
  userEmail,
  userName,
  action,
  resourceType = null,
  resourceId   = null,
  resourceName = null,
  details      = {},
}) => {
  try {
    await supabase.from('activity_logs').insert([{
      user_id:       userId       || null,
      user_email:    userEmail    || 'desconhecido',
      user_name:     userName     || null,
      action,
      resource_type: resourceType || null,
      resource_id:   resourceId   != null ? String(resourceId) : null,
      resource_name: resourceName || null,
      details,
    }]);
  } catch (_) {
    // silencioso — tabela pode não existir ou RLS pode bloquear
  }
};

/**
 * Busca logs de atividades com filtros opcionais.
 */
export const getActivityLogs = async ({
  userEmail = null,
  dateFrom  = null,
  dateTo    = null,
  action    = null,
  limit     = 200,
} = {}) => {
  try {
    let q = supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userEmail) q = q.eq('user_email', userEmail);
    if (action)    q = q.eq('action', action);
    if (dateFrom)  q = q.gte('created_at', dateFrom);
    if (dateTo)    q = q.lte('created_at', dateTo + 'T23:59:59Z');

    const { data, error } = await q;
    return { data: data ?? [], error };
  } catch (e) {
    return { data: [], error: e };
  }
};

/**
 * Sync Utilities
 */
export const logSyncAction = async (userId, deviceType, syncType, status, records = 0) => {
  return supabase.from('sync_logs').insert([
    {
      user_id: userId,
      device_type: deviceType,
      sync_type: syncType,
      status,
      records_synced: records,
    },
  ]);
};
