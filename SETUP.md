# 🚀 Setup Supabase + GitHub Actions

## Passo a Passo para Configurar

### 1. Obter Credenciais do Supabase

1. Acesse: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep
2. Vá em **Settings > API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon Public** → `VITE_SUPABASE_ANON_KEY`
   - **Project ID**: `clakkpyzinuheubkhdep`

### 2. Gerar Access Token (para Deploy Automático)

1. No Dashboard Supabase, vá em **Settings > Access Tokens**
2. Clique em **Generate new token**
3. Nomeie como: `github-deploy`
4. **Escopo**: `database.admin`
5. Copie o token (não será mostrado novamente!)

### 3. Configurar GitHub Secrets

#### Web Repository (wms-verticalparts)

1. Acesse: https://github.com/gelsonsimoes/wms-verticalparts/settings/secrets/actions
2. Clique em **New repository secret**
3. Adicione estes 3 secrets:

| Name | Value |
|------|-------|
| `SUPABASE_ACCESS_TOKEN` | Token do passo anterior |
| `SUPABASE_PROJECT_ID` | `clakkpyzinuheubkhdep` |
| `SUPABASE_DB_PASSWORD` | Senha do seu DB Postgres |

**Encontrar Senha do BD**:
- Dashboard Supabase > Settings > Database > Password

#### Mobile Repository (WMS_VerticalParts_Mobile)

Repita o mesmo para: https://github.com/gelsonsimoes/WMS_VerticalParts_Mobile/settings/secrets/actions

---

### 4. Configurar Arquivo `.env.local`

```bash
# No diretório do projeto
cp .env.example .env.local
```

Edite `.env.local`:

```env
VITE_SUPABASE_URL=https://clakkpyzinuheubkhdep.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=clakkpyzinuheubkhdep
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

---

### 5. Testar Migrations Localmente

```powershell
# Ir para pasta do projeto
cd C:\Users\gelso\Projetos_Antigravity\WMS_VerticalParts

# Iniciar Supabase localmente (requer Docker)
supabase start

# Aplicar migrations
supabase db push

# Ver status
supabase status

# Para quando terminar
supabase stop
```

---

### 6. Fazer Commit no GitHub

```powershell
# Adicionar arquivo de configuração (sem .env.local !)
git add .github/ supabase/ .env.example SETUP.md SYNC_GUIDE.md

# Atualizar .gitignore
echo ".env.local" >> .gitignore
echo ".supabase/" >> .gitignore

git commit -m "chore: add Supabase integration and GitHub Actions workflow"
git push origin main
```

---

### 7. Testar Deploy Automático

1. Faça uma mudança no arquivo de migration:
   ```bash
   # Criar nova migration
   supabase migration new add_new_table
   ```

2. Edite o arquivo `.sql` criado

3. Commit e push:
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add new table"
   git push
   ```

4. Verifique em **Actions** → O workflow deve executar automaticamente! ✅

---

## ⚠️ Checklist de Segurança

- [ ] `.env.local` está no `.gitignore`
- [ ] Access Token está apenas no GitHub Secrets (não no código)
- [ ] RLS (Row Level Security) está ativado nas tabelas
- [ ] Só pessoas autorizadas têm acesso aos Secrets
- [ ] Senhas não foram commitadas (rode `git log -p` para verificar)

---

## 🔧 Troubleshooting

### ❌ "Migration failed"
```
Solução: Verifique SQL syntax
supabase status  # Ver logs detalhados
```

### ❌ "Access Token inválido"
```
Solução: Regenerar token em Supabase Dashboard
```

### ❌ Docker não funciona (Windows)
```
Solução Alternativa: Use Supabase Cloud ao invés de local
# Skip: supabase start
# Use diretamente a URL da nuvem
```

### ❌ Dados não sincronizam entre web e mobile
```
Checklist:
1. Realtime habilitado em Settings > Realtime
2. RLS policies corretas
3. Mesmo projeto_id em ambos apps
4. Mesma ANON_KEY
```

---

## 📱 Para Mobile (React Native)

1. Copie as mesmas variáveis `.env` para o projeto mobile
2. Instale dependências:
   ```bash
   npm install @supabase/supabase-js @react-native-async-storage/async-storage
   ```

3. Configure cliente Supabase:
   ```javascript
   // src/lib/supabaseClient.js
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.VITE_SUPABASE_URL,
     process.env.VITE_SUPABASE_ANON_KEY
   );
   ```

4. Implemente sync offline (veja `SYNC_GUIDE.md`)

---

## 📚 Documentação

- ✅ `SYNC_GUIDE.md` - Como sincronizar web + mobile
- ✅ `SETUP.md` - Este arquivo (primeiros passos)
- ✅ `.github/workflows/deploy.yml` - Deploy automático
- ✅ `supabase/config.toml` - Configuração do Supabase
- ✅ `supabase/migrations/` - Versionamento do banco

---

## ✅ Próximo Passo

Após completar este setup:

1. Crie componentes React para **ListarTarefas** (Realtime)
2. Implemente **Tarefas Mobile Offline**
3. Configure **RLS Policies** personalizadas
4. Teste sincronização web ↔ mobile

Quer ajuda com alguma dessas implementações? 🚀
