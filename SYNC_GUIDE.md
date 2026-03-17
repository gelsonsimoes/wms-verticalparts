# 🔄 Guia de Sincronização: Web + Mobile (WMS VerticalParts)

## Arquitetura

```
┌─────────────────────────────────────┐
│   WMS Web (React/Vite)              │
│   Port: 5173                        │
└──────────┬──────────────────────────┘
           │
           │ HTTP/WebSocket (Realtime)
           │
┌──────────▼──────────────────────────┐
│  Supabase Backend                   │
│  ├─ PostgreSQL Database             │
│  ├─ Realtime Subscriptions          │
│  ├─ Row Level Security (RLS)        │
│  └─ REST API                        │
└──────────┬──────────────────────────┘
           │
           │ HTTP/WebSocket (Realtime)
           │
┌──────────▼──────────────────────────┐
│  WMS Mobile (React Native)          │
│  - Android / iOS                    │
│  - Offline Sync Queue               │
└─────────────────────────────────────┘
```

---

## 1️⃣ Dados Sincronizados em Realtime

Os dados das tabelas abaixo são sincronizados **em tempo real** entre web e mobile:

| Tabela | Descrição | Prioridade |
|--------|-----------|-----------|
| `tasks` | Tarefas de picking, receiving, packing | 🔴 CRÍTICA |
| `stock_allocation` | Alocação de produtos em locais | 🔴 CRÍTICA |
| `inventory_movements` | Histórico de movimentações | 🟡 ALTA |
| `locations` | Endereços do armazém | 🟢 MÉDIA |
| `products` | Catálogo de produtos | 🟢 MÉDIA |

---

## 2️⃣ Funcionalidades de Sincronização

### Web → Mobile
- Nova tarefa criada na web → Aparece no mobile instantaneamente
- Stock atualizado na web → Mobile recebe em tempo real
- Mudancies de status de tarefas

### Mobile → Web
- Operador marca tarefa como `completed` → Web atualiza imediatamente
- Contagem de estoque feita no mobile → Web recebe e valida
- Movimetações de inventário registradas

### Offline-First (Mobile)
- Se mobile perder conexão, dados são **enfileirados** localmente
- Quando reconectar, sincroniza automaticamente
- Conflitos são resolvidos por **last-write-wins** ou **manual review**

---

## 3️⃣ Configurar Supabase Realtime

### A. No Dashboard Supabase:

1. Vá em **Settings > Realtime**
2. Habilite Realtime para as tabelas:
   - `tasks` ✅
   - `stock_allocation` ✅
   - `inventory_movements` ✅
   - `locations` ✅
   - `products` ✅

### B. Configure RLS (Row Level Security):

```sql
-- Cada usuário vê apenas dados de seu armazém
CREATE POLICY "see_own_warehouse_tasks" ON tasks
  FOR SELECT USING (
    warehouse_id IN (SELECT warehouse_id FROM users WHERE id = auth.uid())
  );
```

---

## 4️⃣ Implementação - Web (React)

### Hook customizado: `useRealtimeSync`

```javascript
// src/hooks/useRealtimeSync.js
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useRealtimeSync = (tableName, filterOptions = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      let query = supabase.from(tableName).select('*');
      
      // Aplicar filtros
      Object.entries(filterOptions).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data: initialData, error: fetchError } = await query;
      
      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      setData(initialData || []);
      setLoading(false);
    };

    fetchData();

    // Subscribe to realtime changes
    const subscription = supabase
      .from(tableName)
      .on('*', (payload) => {
        console.log('Realtime update:', payload);
        
        if (payload.eventType === 'INSERT') {
          setData(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setData(prev => 
            prev.map(item => item.id === payload.new.id ? payload.new : item)
          );
        } else if (payload.eventType === 'DELETE') {
          setData(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, filterOptions]);

  return { data, loading, error };
};
```

### Uso em Componente:

```javascript
// src/pages/Dashboard.jsx
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export const Dashboard = () => {
  const userId = useAuth().user.id;
  const warehouseId = useAuth().user.warehouse_id;

  // Sincroniza tarefas em tempo real
  const { data: tasks, loading } = useRealtimeSync('tasks', {
    warehouse_id: warehouseId
  });

  if (loading) return <div>Carregando tarefas...</div>;

  return (
    <div>
      <h1>Tarefas em Tempo Real</h1>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};
```

---

## 5️⃣ Implementação - Mobile (React Native + Supabase)

### Servico de Sync Offline:

```javascript
// src/services/syncService.js (React Native)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';

class SyncQueue {
  async addToQueue(action) {
    // Armazena localmente se offline
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const parsed = JSON.parse(queue);
    parsed.push({ ...action, timestamp: Date.now() });
    await AsyncStorage.setItem('syncQueue', JSON.stringify(parsed));
  }

  async processPendingActions() {
    const queue = await AsyncStorage.getItem('syncQueue') || '[]';
    const actions = JSON.parse(queue);

    for (const action of actions) {
      try {
        // Envia para Supabase
        const { data, error } = await supabase
          .from(action.table)
          .update(action.payload)
          .eq('id', action.id);

        if (error) throw error;

        console.log('✅ Action synced:', action.id);
      } catch (err) {
        console.error('❌ Sync failed:', err);
        break; // Para na primeira falha
      }
    }

    // Limpa fila
    await AsyncStorage.setItem('syncQueue', '[]');
  }
}

export const syncQueue = new SyncQueue();
```

### Uso em Mobile:

```javascript
// Quando operador marca tarefa como concluída
const completeTask = async (taskId) => {
  try {
    await syncQueue.addToQueue({
      table: 'tasks',
      id: taskId,
      payload: {
        status: 'completed',
        completed_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Tarefa concluída (fila local)');
    
    // Se online, sincroniza imediatamente
    if (isOnline()) {
      await syncQueue.processPendingActions();
    }
  } catch (error) {
    console.error('Erro ao completar tarefa:', error);
  }
};
```

---

## 6️⃣ Tratamento de Conflitos

Quando web e mobile tentam atualizar o mesmo registro:

```sql
-- Solução 1: Last-Write-Wins (padrão)
-- O registro com updated_at mais recente vence
SELECT * FROM tasks 
WHERE id = 'xxx' 
ORDER BY updated_at DESC 
LIMIT 1;

-- Solução 2: Manual Review
-- Flagged como conflict para review humano
CREATE TABLE conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT,
  record_id UUID,
  web_version JSONB,
  mobile_version JSONB,
  resolved_version JSONB DEFAULT NULL,
  status TEXT DEFAULT 'pending', -- pending, resolved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

---

## 7️⃣ Documentação no GitHub

Adicione ao `README.md`:

```markdown
## 🔄 Sincronização Web + Mobile

O WMS suporta sincronização em duas vias via Supabase Realtime:

### Features
- ✅ Atualizações instantâneas entre web e mobile
- ✅ Suporte offline-first no mobile
- ✅ Fila de sincronização automática
- ✅ Resolução de conflitos

### Como começar
1. Configure variáveis de ambiente (veja `.env.example`)
2. Inicie o servidor local: `npm run dev`
3. Inicie o app mobile: `npm run mobile`
4. Teste: Crie tarefa na web, veja aparecer no mobile em <1 segundo

### Troubleshooting
- Se dados não sincronizam: Verifique Realtime no Dashboard
- Se conflitos aparecem: Revise tabela `conflicts`
- Logs de sincronização: `tailwindcss` logs no console
```

---

## 8️⃣ Setup Inicial (Próximos Passos)

- [ ] Copiar ANON_KEY do Dashboard Supabase para `.env.local`
- [ ] Executar `supabase db push` localmente para testar migrations
- [ ] Instalar dependências: `npm install @supabase/supabase-js`
- [ ] Criar `lib/supabaseClient.js`
- [ ] Testar Realtime com painel do Supabase Studio

---

## Links Úteis

- 📚 [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- 📱 [React Native x Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- 🔐 [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- 🆚 [Conflict Resolution Patterns](https://supabase.com/docs/guides/realtime/concepts)
