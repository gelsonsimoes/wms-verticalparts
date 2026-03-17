# WMS VerticalParts — Supabase Database Reference

Gerado em: 2026-03-12
Projeto: WMS VerticalParts (wmsverticalparts.com.br)

---

## Tabelas Identificadas no Código

| # | Tabela | Origem | Descrição |
|---|--------|--------|-----------|
| 1 | `operadores` | `App.jsx`, `lib/supabaseClient.js`, `AuthCallbackPage.jsx` | Usuários/colaboradores do sistema WMS |
| 2 | `activity_logs` | `lib/supabaseClient.js`, `CollaboratorReport.jsx` | Auditoria de ações dos colaboradores |
| 3 | `produtos` | `ProductCatalog.jsx`, `AllocationKanban.jsx`, `WavePickingWizard.jsx`, `WeighingStation.jsx`, `Header.jsx` | Catálogo de produtos/peças automotivas |
| 4 | `tarefas` | `AllocationKanban.jsx`, `WavePickingWizard.jsx`, `Header.jsx` | Tarefas WMS (alocação, separação, conferência) |
| 5 | `itens_tarefa` | `AllocationKanban.jsx`, `WavePickingWizard.jsx` | Itens vinculados a cada tarefa |
| 6 | `enderecos` | `useWarehouseMap.js`, `Header.jsx` | Endereços físicos do armazém (posições de estoque) |
| 7 | `estoques` | `useWarehouseMap.js` | Estoque por endereço (posição física) |
| 8 | `warehouses` | `lib/supabaseClient.js` | Armazéns/centros de distribuição |
| 9 | `tasks` | `lib/supabaseClient.js` | Tarefas em inglês (helpers da lib — paralelas às `tarefas`) |
| 10 | `stock_allocation` | `lib/supabaseClient.js` | Alocação de estoque por localização |
| 11 | `inventory_movements` | `lib/supabaseClient.js` | Movimentações de estoque (entradas, saídas, transferências) |
| 12 | `locations` | `lib/supabaseClient.js` | Localizações de armazém (alias para enderecos) |
| 13 | `products` | `lib/supabaseClient.js` | Produtos em inglês (alias para produtos) |
| 14 | `sync_logs` | `lib/supabaseClient.js` | Log de sincronização de dispositivos |
| 15 | `companies` | `AppContext.jsx` (localStorage) | Empresas/entidades (cliente, fornecedor, transportadora) |
| 16 | `user_groups` | `AppContext.jsx` (localStorage) | Grupos de acesso/permissões |

> **Nota:** `endereco` (singular) já foi fornecida pelo usuário e não está nesta lista.
> As tabelas `tasks`/`products`/`locations` são os helpers em inglês da `supabaseClient.js` e correspondem a `tarefas`/`produtos`/`enderecos`.

---

## SQL CREATE TABLE — Executar no Supabase SQL Editor

### 1. operadores

```sql
CREATE TABLE IF NOT EXISTS operadores (
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
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE operadores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON operadores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Gerência próprio registro" ON operadores FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin gerencia tudo" ON operadores USING (
  EXISTS (SELECT 1 FROM operadores o WHERE o.id = auth.uid() AND o.nivel = 'Administrador')
);
```

### 2. activity_logs

```sql
CREATE TABLE IF NOT EXISTS activity_logs (
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

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura livre" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "Inserção autenticada" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 3. produtos

```sql
CREATE TABLE IF NOT EXISTS produtos (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku                 TEXT NOT NULL UNIQUE,
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
  dias_crossdocking   INTEGER DEFAULT 0,
  estoque_erp         INTEGER,
  estoque_wms         INTEGER DEFAULT 0,
  estoque_real        INTEGER,
  estoque_minimo      INTEGER DEFAULT 0,
  preco_venda         NUMERIC(12,2),
  preco_custo         NUMERIC(12,2),
  movimenta_estoque   BOOLEAN DEFAULT true,
  regra_expedicao     TEXT DEFAULT 'FIFO' CHECK (regra_expedicao IN ('FIFO','FEFO','LIFO')),
  observacao          TEXT,
  descricao_detalhada TEXT,
  codigo_integracao   TEXT,
  embalagens          JSONB DEFAULT '[]',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON produtos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON produtos FOR ALL USING (auth.uid() IS NOT NULL);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER produtos_updated_at
  BEFORE UPDATE ON produtos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 4. warehouses

```sql
CREATE TABLE IF NOT EXISTS warehouses (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_interno  TEXT NOT NULL UNIQUE,
  nome            TEXT NOT NULL,
  entidade        TEXT,
  tipo            TEXT DEFAULT 'Distribuição',
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON warehouses FOR SELECT USING (auth.uid() IS NOT NULL);
```

### 5. enderecos (posições do armazém)

```sql
CREATE TABLE IF NOT EXISTS enderecos (
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

ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON enderecos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON enderecos FOR ALL USING (auth.uid() IS NOT NULL);
```

### 6. estoques (estoque por posição física)

```sql
CREATE TABLE IF NOT EXISTS estoques (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endereco_id     UUID REFERENCES enderecos(id) ON DELETE CASCADE,
  produto_id      UUID REFERENCES produtos(id) ON DELETE CASCADE,
  sku             TEXT NOT NULL,
  quantidade      NUMERIC(12,3) NOT NULL DEFAULT 0,
  lote            TEXT,
  data_validade   DATE,
  bloqueado       BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE estoques ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON estoques FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON estoques FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER estoques_updated_at
  BEFORE UPDATE ON estoques
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 7. tarefas

```sql
CREATE TABLE IF NOT EXISTS tarefas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo        TEXT NOT NULL DEFAULT 'alocacao'
                CHECK (tipo IN ('alocacao','separacao','conferencia','expedicao','inventario','ressuprimento')),
  prioridade  TEXT NOT NULL DEFAULT 'Normal'
                CHECK (prioridade IN ('Normal','Alta','Urgente')),
  status      TEXT NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente','em_execucao','concluida','cancelada')),
  operador_id UUID REFERENCES operadores(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON tarefas FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON tarefas FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER tarefas_updated_at
  BEFORE UPDATE ON tarefas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 8. itens_tarefa

```sql
CREATE TABLE IF NOT EXISTS itens_tarefa (
  id                   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tarefa_id            UUID REFERENCES tarefas(id) ON DELETE CASCADE,
  produto_id           UUID REFERENCES produtos(id) ON DELETE SET NULL,
  sku                  TEXT NOT NULL,
  descricao            TEXT,
  sequencia            INTEGER DEFAULT 1,
  quantidade_esperada  NUMERIC(12,3) NOT NULL DEFAULT 0,
  quantidade_realizada NUMERIC(12,3) DEFAULT 0,
  endereco_id          TEXT,
  status               TEXT DEFAULT 'pendente'
                         CHECK (status IN ('pendente','em_execucao','concluida','cancelada')),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE itens_tarefa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON itens_tarefa FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON itens_tarefa FOR ALL USING (auth.uid() IS NOT NULL);
```

### 9. inventory_movements

```sql
CREATE TABLE IF NOT EXISTS inventory_movements (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo             TEXT NOT NULL
                     CHECK (tipo IN ('entrada','saida','transferencia','ajuste','bloqueio','desbloqueio')),
  produto_id       UUID REFERENCES produtos(id) ON DELETE SET NULL,
  sku              TEXT NOT NULL,
  endereco_origem  TEXT,
  endereco_destino TEXT,
  quantidade       NUMERIC(12,3) NOT NULL,
  operador_id      UUID REFERENCES operadores(id) ON DELETE SET NULL,
  tarefa_id        UUID REFERENCES tarefas(id) ON DELETE SET NULL,
  pedido_id        TEXT,
  observacao       TEXT,
  warehouse_id     UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON inventory_movements FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Inserção autenticada" ON inventory_movements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### 10. tasks (helpers em inglês — lib/supabaseClient.js)

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  tipo         TEXT,
  status       TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending','in_progress','completed','cancelled')),
  prioridade   TEXT DEFAULT 'Normal',
  operador_id  UUID REFERENCES operadores(id) ON DELETE SET NULL,
  descricao    TEXT,
  notas        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON tasks FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON tasks FOR ALL USING (auth.uid() IS NOT NULL);
```

### 11. stock_allocation (helpers em inglês)

```sql
CREATE TABLE IF NOT EXISTS stock_allocation (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
  location_id  UUID REFERENCES enderecos(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantity     NUMERIC(12,3) DEFAULT 0,
  min_quantity NUMERIC(12,3) DEFAULT 0,
  max_quantity NUMERIC(12,3),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stock_allocation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON stock_allocation FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita autenticada" ON stock_allocation FOR ALL USING (auth.uid() IS NOT NULL);
```

### 12. sync_logs

```sql
CREATE TABLE IF NOT EXISTS sync_logs (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_type     TEXT,
  sync_type       TEXT,
  status          TEXT DEFAULT 'success' CHECK (status IN ('success','error','partial')),
  records_synced  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inserção autenticada" ON sync_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Leitura própria" ON sync_logs FOR SELECT USING (auth.uid() = user_id);
```

### 13. companies (migração do localStorage)

```sql
CREATE TABLE IF NOT EXISTS companies (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name       TEXT NOT NULL,
  cnpj       TEXT NOT NULL UNIQUE,
  address    TEXT,
  currency   TEXT DEFAULT 'BRL',
  timezone   TEXT DEFAULT 'GMT-3',
  status     TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo','Inativo')),
  tipo       TEXT DEFAULT 'empresa'
               CHECK (tipo IN ('empresa','cliente','fornecedor','transportadora')),
  email      TEXT,
  telefone   TEXT,
  cidade     TEXT,
  estado     TEXT,
  cep        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON companies FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita admin" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM operadores o WHERE o.id = auth.uid() AND o.nivel IN ('Administrador','Supervisor'))
);
```

### 14. user_groups (migração do localStorage)

```sql
CREATE TABLE IF NOT EXISTS user_groups (
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

ALTER TABLE user_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura autenticada" ON user_groups FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Escrita admin" ON user_groups FOR ALL USING (
  EXISTS (SELECT 1 FROM operadores o WHERE o.id = auth.uid() AND o.nivel = 'Administrador')
);
```

---

## Ordem de Criação (respeitar dependências de FK)

Execute os CREATE TABLE nesta ordem:

1. `warehouses`
2. `operadores`
3. `enderecos`
4. `produtos`
5. `estoques`
6. `tarefas`
7. `itens_tarefa`
8. `inventory_movements`
9. `tasks`
10. `stock_allocation`
11. `activity_logs`
12. `sync_logs`
13. `companies`
14. `user_groups`

---

## Como Importar os CSVs no Supabase

### Via Supabase Dashboard (interface web)

1. Acesse `app.supabase.com` → seu projeto
2. No menu lateral: **Table Editor**
3. Selecione a tabela desejada
4. Clique em **Import data** → **Import from CSV**
5. Selecione o arquivo `tabela_NOME.csv`
6. Confirme o mapeamento das colunas
7. Clique em **Import**

### Via SQL (copy)

```sql
-- Exemplo para operadores
COPY operadores (id, usuario, nome, email, cargo, nivel, departamento, status, entidade, avatar_url, created_at)
FROM '/caminho/para/tabela_operadores.csv'
DELIMITER ','
CSV HEADER;
```

### Via psql (linha de comando)

```bash
psql "postgresql://postgres:[SENHA]@db.[PROJECT_REF].supabase.co:5432/postgres" \
  -c "\COPY operadores FROM 'C:/Users/gelso/Projetos_Antigravity/Arquivos_Supabase/tabela_operadores.csv' CSV HEADER"
```

---

## Arquivos CSV Gerados

| Arquivo | Tabela | Linhas de Dados |
|---------|--------|----------------|
| `tabela_operadores.csv` | `operadores` | 8 |
| `tabela_activity_logs.csv` | `activity_logs` | 10 |
| `tabela_produtos.csv` | `produtos` | 10 |
| `tabela_tarefas.csv` | `tarefas` | 8 |
| `tabela_itens_tarefa.csv` | `itens_tarefa` | 9 |
| `tabela_enderecos.csv` | `enderecos` | 17 |
| `tabela_estoques.csv` | `estoques` | 10 |
| `tabela_warehouses.csv` | `warehouses` | 2 |
| `tabela_companies.csv` | `companies` | 8 |
| `tabela_user_groups.csv` | `user_groups` | 4 |
| `tabela_inventory_movements.csv` | `inventory_movements` | 10 |
| `tabela_tasks.csv` | `tasks` | 5 |
| `tabela_stock_allocation.csv` | `stock_allocation` | 10 |
| `tabela_sync_logs.csv` | `sync_logs` | 5 |

---

## Notas Importantes

- **UUID placeholders**: Os IDs nos CSVs são UUIDs formatados para facilitar referências cruzadas entre tabelas. No Supabase, ao usar `gen_random_uuid()` como default, você pode omitir a coluna `id` na importação.
- **Tabela `endereco` (fornecida)**: Não incluída neste conjunto — já existe no projeto.
- **Tabelas em inglês vs português**: O código usa tanto `produtos/tarefas/enderecos` (chamadas diretas nas pages) quanto `products/tasks/locations` (helpers da `supabaseClient.js`). Recomenda-se unificar usando os nomes em português e atualizar os helpers.
- **localStorage vs Supabase**: `companies`, `user_groups`, `warehouses`, `sectors` e várias outras ainda usam localStorage no `AppContext.jsx`. Migrar para Supabase requer criar as tabelas e adaptar o contexto.
