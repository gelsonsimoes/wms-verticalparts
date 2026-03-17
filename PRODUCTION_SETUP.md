# 🚀 Configuração para Produção (Hostinger)

## 📋 Checklist de Produção

### ✅ 1. **Variáveis de Ambiente**
- [ ] Arquivo `.env.production` criado com configurações corretas
- [ ] `VITE_SUPABASE_ANON_KEY` obtida do Dashboard Supabase
- [ ] `VITE_API_URL=https://wmsverticalparts.com.br/api`

### ✅ 2. **Configuração Supabase (CRÍTICO)**
**Acesse:** https://supabase.com/dashboard/project/clakkpyzinuheubkhdep

#### **2.1 Authentication > URL Configuration**
```
Site URL: https://wmsverticalparts.com.br
Redirect URLs:
- https://wmsverticalparts.com.br/auth/callback
- https://wmsverticalparts.com.br/auth/reset-password
```

#### **2.2 Authentication > Email Templates**
Configure SMTP para enviar e-mails usando a Hostinger:

**Para Hostinger (Recomendado):**
```
SMTP Host: mail.wmsverticalparts.com.br
SMTP Port: 587 (ou 465 para SSL)
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [sua senha do e-mail Hostinger]
```

**Se não funcionar, tente:**
```
SMTP Host: smtp.hostinger.com
SMTP Port: 587
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [sua senha do e-mail Hostinger]
```

**Verificação da configuração:**
1. No painel da Hostinger, vá em **Emails > Email Accounts**
2. Confirme que `suporte@wmsverticalparts.com.br` existe
3. Use a senha mostrada ou redefina se necessário

### ✅ 3. **Deploy na Hostinger**
- [ ] Faça upload dos arquivos para a Hostinger
- [ ] Configure as variáveis de ambiente no painel da Hostinger
- [ ] Teste o acesso: https://wmsverticalparts.com.br

### ✅ 4. **Teste em Produção**
1. Acesse: https://wmsverticalparts.com.br/seguranca/usuarios
2. Tente enviar um convite
3. Verifique se o e-mail chega
4. Teste o link de confirmação

---

## 🔧 **Configuração Detalhada do Supabase**

### **Passo 1: Site URL**
1. Dashboard Supabase > Authentication > Settings
2. **Site URL**: `https://wmsverticalparts.com.br`
3. Salve

### **Passo 2: Redirect URLs**
1. Na mesma página, **Redirect URLs**
2. Adicione:
   ```
   https://wmsverticalparts.com.br/auth/callback
   https://wmsverticalparts.com.br/auth/reset-password
   ```
3. Salve

### **Passo 3: SMTP Configuration**
1. Dashboard > Authentication > Email Templates
2. **SMTP Settings**:
   ```
   Host: smtp.gmail.com
   Port: 587
   User: seu-email@wmsverticalparts.com.br
   Password: [senha de app]
   ```
3. **Teste o SMTP** clicando em "Send test email"

---

## 🐛 **Possíveis Problemas em Produção**

### **Problema: "Invalid redirect URL"**
```
Solução: Verifique se as URLs estão exatamente corretas no Supabase
- Deve ser https:// (não http://)
- Deve incluir /auth/callback e /auth/reset-password
```

### **Problema: E-mails não chegam**
```
Verifique:
1. SMTP configurado corretamente
2. Senha de app do Gmail (não senha normal)
3. E-mail não está no spam
4. Limites do Gmail não foram atingidos
```

### **Problema: "CORS error"**
```
Solução: Verifique se o domínio está na lista de allowed origins
Dashboard > Settings > API > Allowed Origins
Adicione: https://wmsverticalparts.com.br
```

---

## 📧 **Templates de E-mail**

### **Convite de Cadastro**
O Supabase envia automaticamente. Para personalizar:

1. Dashboard > Authentication > Email Templates
2. **Confirm signup** template
3. Personalize o HTML/CSS

### **Reset de Senha**
1. **Reset password** template
2. Personalize conforme necessário

---

## 🔐 **Segurança em Produção**

### **Variáveis de Ambiente**
- ✅ Nunca commite `.env.production` no Git
- ✅ Use variáveis do painel da Hostinger
- ✅ Mantenha `VITE_DEBUG=false`

### **Supabase Security**
- ✅ RLS (Row Level Security) ativado
- ✅ Políticas de segurança configuradas
- ✅ Apenas usuários autorizados podem convidar

---

## 🧪 **Teste Final**

```bash
# Build de produção
npm run build

# Teste local com produção
npm run preview

# Verifique se funciona antes de subir para Hostinger
```

---

## 📞 **Suporte**

Se tiver problemas:
1. **Logs do Supabase**: Dashboard > Logs
2. **Console do navegador**: F12 > Console
3. **Logs da Hostinger**: Painel de controle

**URLs importantes:**
- Site: https://wmsverticalparts.com.br
- Supabase: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep
- Hostinger: [seu painel de controle]

---

**✅ Configurado para produção!** 🚀