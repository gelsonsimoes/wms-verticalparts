import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.clakkpyzinuheubkhdep:Vertic%40lParts383%25%40@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
  try {
    await client.connect();
    console.log('✅ Conectado ao novo Supabase!');

    // 1. Criar extensões necessárias
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

    // 2. Criar tabela de operadores (se não existir)
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.operadores (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        employee_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        branch TEXT NOT NULL,
        status TEXT DEFAULT 'Ativo',
        avatar_url TEXT,
        last_login TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✅ Tabela "operadores" ok.');

    // 3. Criar tabela de produtos com os campos NOVOS do Omie
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.produtos (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        sku TEXT UNIQUE NOT NULL,
        descricao TEXT NOT NULL,
        unidade TEXT DEFAULT 'PC',
        tipo TEXT,
        familia TEXT,
        marca TEXT,
        ncm TEXT,
        peso_bruto NUMERIC(18,3),
        peso_liquido NUMERIC(18,3),
        altura NUMERIC(18,3),
        largura NUMERIC(18,3),
        profundidade NUMERIC(18,3),
        local_estoque TEXT,
        dias_crossdocking INTEGER,
        estoque_erp NUMERIC(12,6),
        estoque_wms NUMERIC(12,6) DEFAULT 0,
        estoque_real NUMERIC(12,6),
        estoque_minimo NUMERIC(12,6),
        preco_venda NUMERIC(11,6),
        preco_custo NUMERIC(11,6),
        codigo_integracao TEXT,
        movimenta_estoque BOOLEAN DEFAULT true,
        regra_expedicao TEXT DEFAULT 'FIFO',
        observacao TEXT,
        descricao_detalhada TEXT,
        embalagens JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✅ Tabela "produtos" (versão Omie) ok.');

    // 4. Criar um operador inicial para login
    // Nota: Como o Supabase Auth é separado, este registro vincula o perfil ao usuário
    // Por enquanto, vamos garantir que o registro existe no banco público.
    await client.query(`
      INSERT INTO public.operadores (employee_id, name, role, branch, status)
      VALUES ('OP001', 'Gelson Simões', 'Gestor', 'MATRIZ', 'Ativo')
      ON CONFLICT (employee_id) DO NOTHING;
    `);
    console.log('✅ Usuário OP001 cadastrado.');

    console.log('\n🚀 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    
  } catch (err) {
    console.error('❌ Erro na migração:', err);
  } finally {
    await client.end();
  }
}

setup();
