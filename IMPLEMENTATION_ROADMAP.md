# 🎯 Roadmap de Implementação - Supabase + Web + Mobile

## ✅ Completo

- [x] Configuração Supabase (project ID: clakkpyzinuheubkhdep)
- [x] Schema do banco (migrations com 8 tabelas principais)
- [x] GitHub Actions workflow para deploy automático
- [x] Variáveis de ambiente configuradas
- [x] Cliente Supabase (supabaseClient.js)
- [x] Hooks Realtime (useRealtimeSync.js)
- [x] Documentação (SYNC_GUIDE.md, SETUP.md)

---

## 📋 TODO - Próximos Passos

### 1️⃣ Configuração Local (1-2 horas)

```powershell
# 1. Copiar arquivo de env
Copy-Item .env.example .env.local

# 2. Editar .env.local com credenciais do Supabase
# VITE_SUPABASE_URL = https://clakkpyzinuheubkhdep.supabase.co
# VITE_SUPABASE_ANON_KEY = [copiar do Dashboard]

# 3. Instalar dependências (se não feito)
npm install

# 4. Iniciar localmente
npm run dev
```

### 2️⃣ Configurar GitHub (30 minutos)

- [ ] Ir em: https://github.com/gelsonsimoes/wms-verticalparts/settings/secrets/actions
- [ ] Adicionar 3 secrets:
  - `SUPABASE_ACCESS_TOKEN` (gerar em Supabase Dashboard)
  - `SUPABASE_PROJECT_ID` (clakkpyzinuheubkhdep)
  - `SUPABASE_DB_PASSWORD` (senha do postgres)
- [ ] Repetir para repositório mobile

### 3️⃣ Implementar Componentes React (4-8 horas)

#### Dashboard com Realtime - Exemplo:

```jsx
// src/pages/Dashboard.jsx
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useAuth } from '../context/AppContext'; // seu contexto

export const Dashboard = () => {
  const { user } = useAuth();
  
  // Sincroniza tarefas em tempo real
  const { data: tasks, loading, error } = useRealtimeSync('tasks', {
    warehouse_id: user.warehouse_id
  });

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="dashboard">
      <h1>Tarefas Ativas ({tasks.length})</h1>
      <div className="grid">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
```

#### Componentes a Criar:

| Componente | Função | Prioridade | Estimado |
|-----------|--------|-----------|----------|
| `TaskCard` | Exibir tarefa individual | 🔴 Alta | 1h |
| `TaskForm` | Criar/editar tarefa | 🔴 Alta | 2h |
| `StockAllocationMap` | Visualizar estoque | 🟡 Média | 3h |
| `InventoryMovementsList` | Histórico de movimentos | 🟡 Média | 2h |
| `SyncStatus` | Indicador de sincronização | 🟢 Baixa | 1h |

### 4️⃣ Implementar Mobile (React Native) (8-16 horas)

```javascript
// src/screens/TasksScreen.js (mobile)
import { useRealtimeSync } from '../hooks/useRealtimeSync';
import { useOfflineSync } from '../hooks/useRealtimeSync';

export const TasksScreen = () => {
  const { data: tasks } = useRealtimeSync('tasks', { warehouse_id: WAREHOUSE_ID });
  const { addToPending, isOnline } = useOfflineSync('tasks');

  const completeTask = async (taskId) => {
    // Se offline, enfileira
    if (!isOnline) {
      addToPending({
        operation: 'UPDATE',
        record: {
          id: taskId,
          status: 'completed',
          completed_at: new Date(),
        },
      });
      return;
    }

    // Se online, sincroniza direto
    await updateTask(taskId, { status: 'completed' });
  };

  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => (
        <TaskCard task={item} onComplete={completeTask} />
      )}
    />
  );
};
```

### 5️⃣ RLS (Row Level Security) - Segurança (2 horas)

Adicionar policies de segurança no Supabase:

```sql
-- Usuários veem apenas tarefas de seu armazém
CREATE POLICY "users_see_own_warehouse_tasks" ON tasks
  FOR SELECT
  USING (
    warehouse_id IN (
      SELECT warehouse_id FROM users WHERE id = auth.uid()
    )
  );

-- Apenas operadores podem criar tarefas
CREATE POLICY "only_operators_create_tasks" ON tasks
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM users WHERE id = auth.uid()) IN ('admin', 'manager')
  );
```

### 6️⃣ Testes de Sincronização (4 horas)

```javascript
// src/__tests__/sync.test.js
describe('Sincronização Web + Mobile', () => {
  test('Criar tarefa na web aparece no mobile em <1s', async () => {
    // Criar task na web
    const task = await createTask({ ... });
    
    // Verificar que mobile recebe via Realtime
    // Usar WebSockets para testar
  });

  test('Editar estoque no mobile atualiza web', async () => {
    // Mobile enfileira atualização
    // Sincronizar
    // Verificar que web recebeu
  });

  test('Conflito é resolvido por last-write-wins', async () => {
    // Simular mesma tarefa editada em web e mobile
    // Verificar que versão mais recente vence
  });
});
```

### 7️⃣ Deploy em Produção (2 horas)

```powershell
# 1. Fazer commit
git add .
git commit -m "feat: implement Supabase sync and Realtime"
git push origin main

# 2. GitHub Actions deploy automático ✅
# (monitor em Actions tab)

# 3. Testar em produção
# Acessar https://seu-dominio.com
# Mobile baixa novo build

# 4. Monitorar logs
# Supabase Dashboard > Logs
```

---

## 📱 URLs Importantes

- **Projeto Web**: https://github.com/gelsonsimoes/wms-verticalparts
- **Projeto Mobile**: https://github.com/gelsonsimoes/WMS_VerticalParts_Mobile
- **Supabase Dashboard**: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep
- **GitHub Actions**: https://github.com/gelsonsimoes/wms-verticalparts/actions

---

## 🔗 Sincronização: Como Funciona

```
┌─ Criação de Tarefa (Web) ─┐
│                           │
│  1. Usuário clica + Nova  │
│  2. Form POST para API    │
│  3. Salva em DB           │
│  4. Trigger Realtime ✨   │
│  5. Broadcast para Mobile │
│                           │
└───────────────────────────┘
         ↓ (~50ms)
┌─ Mobile Recebe ─────────┐
│                         │
│  1. Websocket update    │
│  2. Sincroniza com app  │
│  3. Atualiza tela       │
│  4. Toca notificação    │
│                         │
└─────────────────────────┘
```

---

## ❓ Dúvidas Frequentes

**P: E se o mobile ficar offline?**
R: Ações são enfileiradas localmente (AsyncStorage). Quando reconectar, sincroniza tudo.

**P: Como resolver conflitos (web+mobile editam mesmo campo)?**
R: Last-write-wins por padrão. Se crítico, cria entry em tabela `conflicts` para review.

**P: Mobile precisa ser React Native?**
R: Não, pode ser Flutter, nativa, etc. Qualquer app que conectar ao Supabase funciona.

**P: Como debugar sincronização?**
R: `VITE_DEBUG=true` nos logs. Supabase Dashboard > Logs > Realtime.

---

## 🚀 Quick Start (TL;DR)

```powershell
# 1. Setup
cp .env.example .env.local
# Editar .env.local com credenciais Supabase

# 2. Dev local
npm run dev

# 3. GitHub Secrets
# Adicionar em: github.com/gelsonsimoes/wms-verticalparts/settings/secrets

# 4. Deploy
git push origin main
# GitHub Actions cuida do resto! ✨
```

---

## 📞 Precisa de Ajuda?

1. **Erro de autenticação?** → Verifique ANON_KEY em `.env.local`
2. **Realtime não funciona?** → Ative em Supabase Settings > Realtime
3. **Mobile não sincroniza?** → Veja logs em `sync_logs` table
4. **GitHub Actions falhou?** → Check Actions > Logs para detalhes

---

## ✨ Próxima Fase: AI Integration

Após sincronização funcionar, adicione:
- 🤖 Chat AI para análise de estoque (já tem Google Generative AI)
- 📊 Previsão de demanda via ML
- 🎯 Otimização de rotas de picking

---

**Status**: 🟢 Pronto para começar!  
**Última atualização**: 9 de março de 2026  
**Questões?** Verifique `SYNC_GUIDE.md` ou `SETUP.md`
