# ⚙️ Configuração Hostinger + Supabase

## 📋 **Para Configurar na Hostinger**

### **Passo 1: Acesse o Painel da Hostinger**
1. Entre no seu painel de controle da Hostinger
2. Vá para **Files > File Manager** ou **Gerenciador de Arquivos**
3. Navegue até a pasta do seu projeto (geralmente `public_html` ou similar)

### **Passo 2: Configure Variáveis de Ambiente**
Na Hostinger, você pode configurar variáveis de ambiente de duas formas:

#### **Opção A: Arquivo .env (Recomendado)**
1. No File Manager, crie um arquivo `.env` na raiz do projeto
2. Adicione estas linhas:

```env
# Supabase Configuration - PRODUÇÃO
VITE_SUPABASE_URL=https://clakkpyzinuheubkhdep.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=clakkpyzinuheubkhdep

# API Configuration
VITE_API_URL=https://wmsverticalparts.com.br/api
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_REALTIME=true
VITE_ENABLE_SYNC=true
VITE_SYNC_INTERVAL=5000

# Production
VITE_DEBUG=false
VITE_ENVIRONMENT=production
```

#### **Opção B: Via Painel de Controle**
1. Vá em **Settings > Environment Variables**
2. Adicione cada variável separadamente:
   - `VITE_SUPABASE_URL` = `https://clakkpyzinuheubkhdep.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `[sua chave anon]`
   - etc.

### **Passo 3: Obter a Chave ANON**
1. Acesse: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep
2. **Settings > API**
3. Copie a **anon public** key
4. Cole no arquivo `.env` da Hostinger

---

## 🔧 **Configuração do Supabase para Produção**

### **1. Site URL**
```
Dashboard Supabase > Authentication > Settings
Site URL: https://wmsverticalparts.com.br
```

### **2. Redirect URLs**
```
Adicione na seção "Redirect URLs":
- https://wmsverticalparts.com.br/auth/callback
- https://wmsverticalparts.com.br/auth/reset-password
```

### **3. SMTP para E-mails**
```
Dashboard > Authentication > Email Templates > SMTP Settings

# Para e-mail da Hostinger (suporte@wmsverticalparts.com.br)
Host: mail.wmsverticalparts.com.br
Port: 587
User: suporte@wmsverticalparts.com.br
Password: [senha do e-mail no painel Hostinger]
```

**Se não funcionar, tente estas alternativas:**
```
Host: smtp.hostinger.com
Port: 587
# ou
Host: mail.wmsverticalparts.com.br
Port: 465
```

**Como obter a senha:**
1. Painel Hostinger > Emails > Email Accounts
2. Encontre `suporte@wmsverticalparts.com.br`
3. Use a senha atual ou clique em "Change Password"

---

## 🧪 **Teste em Produção**

Após configurar tudo:

1. **Acesse**: https://wmsverticalparts.com.br/seguranca/usuarios
2. **Teste convite**: Preencha nome/e-mail e clique "Enviar Convite"
3. **Verifique e-mail**: Deve chegar com link para confirmação
4. **Teste link**: Deve redirecionar para o site correto

---

## 🚨 **Troubleshooting**

### **E-mails não chegam?**
- Verifique SMTP no Supabase
- Teste enviando e-mail de teste no painel
- Verifique pasta spam

### **"Invalid redirect URL"?**
- URLs devem ser exatamente: `https://wmsverticalparts.com.br/auth/callback`
- Não esqueça o `/auth/callback`

### **Convites funcionam localmente mas não em produção?**
- Verifique se as variáveis estão configuradas na Hostinger
- Compare com `.env.local` (desenvolvimento)

---

## 📞 **Suporte Hostinger**

Se precisar de ajuda com a Hostinger:
- **Chat ao vivo**: Disponível no painel
- **Documentação**: https://support.hostinger.com/
- **Configurações PHP**: Geralmente em Settings > PHP Configuration

---

**✅ Pronto para produção!** 🎉