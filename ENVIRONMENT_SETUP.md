# 🔐 Configuração de Variáveis de Ambiente

## ⚠️ NÃO COMMITIR SECRETS NO REPOSITÓRIO

Este projeto contém **proteção automática contra secrets** via Git hooks.

## Arquivos Protected

Os seguintes arquivos **NUNCA devem ser commitados com valores reais**:
- `.env`
- `.env.local`
- `.env.production`
- `.env.*.local`
- `server/.env`

Todos esses arquivos estão no `.gitignore` e o Git recusará commits que contenham secrets.

## 🚀 Setup para Desenvolvimento

### 1. Criar arquivos .env locais

```bash
# Cliente (React/Vite)
cp .env.example .env.local

# Servidor (Node.js)
cp .env.server.example server/.env
```

### 2. Preencher com valores reais

#### `.env.local` (Cliente)
```
VITE_SUPABASE_URL=https://clakkpyzinuheubkhdep.supabase.co
VITE_SUPABASE_ANON_KEY=seu_anon_key_aqui
VITE_APP_URL=https://localhost:5173
```

#### `server/.env` (Servidor)
```
PORT=3000
NODE_ENV=development

# Claude (Anthropic) — https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-SEU_TOKEN_AQUI

# Supabase — https://supabase.com/dashboard
VITE_SUPABASE_URL=https://clakkpyzinuheubkhdep.supabase.co
SUPABASE_SERVICE_ROLE_KEY=seu_chave_aqui

# App URL
VITE_APP_URL=https://localhost:5173
```

## 🛡️ Proteção Automática (Pre-commit Hooks)

O projeto usa **Husky + Git Hooks** para impedir commits com secrets.

### Detecta automaticamente:
- ✅ Chaves Anthropic (`sk-ant-api03-...`)
- ✅ GitHub Personal Access Tokens (`ghp_...`)
- ✅ Supabase Keys
- ✅ Qualquer padrão de secret comum

### Exemplo de blocagem:

```bash
$ git commit -m "fix: add anthropic key"
🔐 Verificando por secrets...
❌ Possível secret encontrado: sk-ant-api03
❌ Pre-commit check falhou!
```

## 🔄 Production/Deployment

### Em servidores de produção (VPS/Railway):

1. **Definir variáveis de ambiente** via:
   - Railway Dashboard
   - VPS: `/var/www/wms-verticalparts/.env`
   - Docker/Container: Variáveis de ambiente

2. **NUNCA fazer deploy de um `.env` real**

3. **Verificar arquivo `.env.server.example`** para todas as variáveis necessárias

## 🐛 Se um Secret for Commitado Acidentalmente

### 1. Revogar o secret IMEDIATAMENTE:
```bash
# Anthropic
# Acesse: https://console.anthropic.com/account/keys
# Revogue a chave exposta

# GitHub
# Acesse: https://github.com/settings/tokens
# Revogue o PAT exposto

# Supabase
# Acesse: https://supabase.com/dashboard
# Regenere as chaves
```

### 2. Remover do histórico Git:
```bash
# Com BFG Repo-Cleaner (recomendado)
npm install -g bfg
bfg --replace-text secrets.txt

# Ou com git filter-branch (mais lento)
git filter-branch --tree-filter 'rm -f server/.env' HEAD
```

### 3. Force push (cuidado!)
```bash
git push origin --force
```

## 📋 Checklist de Setup

- [ ] Arquivo `.env.local` criado e adicionado ao `.gitignore`
- [ ] Arquivo `server/.env` criado e adicionado ao `.gitignore`
- [ ] Variáveis preenchidas com valores corretos
- [ ] Teste: `npm install && npm run dev`
- [ ] Confirmar: Nenhuma chave real no `.git` history

## 🔗 Referências

- [Anthropic API Keys](https://console.anthropic.com/account/keys)
- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [Supabase Project Settings](https://supabase.com/dashboard)
- [Husky Documentation](https://typicode.github.io/husky/)
