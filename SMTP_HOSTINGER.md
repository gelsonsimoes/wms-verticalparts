# 📧 Configuração SMTP Hostinger + Supabase

## 🎯 **Objetivo**
Configurar o envio de e-mails de convite usando o servidor SMTP da Hostinger (`suporte@wmsverticalparts.com.br`).

---

## 📋 **Passo a Passo**

### **1. Verifique seu E-mail na Hostinger**
1. Acesse o painel da Hostinger
2. Vá em **Emails > Email Accounts**
3. Confirme que `suporte@wmsverticalparts.com.br` existe
4. Anote ou redefina a senha se necessário

### **2. Configure no Supabase**
1. Acesse: https://supabase.com/dashboard/project/clakkpyzinuheubkhdep
2. Vá em **Authentication > Email Templates**
3. Role para baixo até **SMTP Settings**
4. Preencha os campos:

```
SMTP Host: mail.wmsverticalparts.com.br
SMTP Port: 587
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [sua senha da Hostinger]
```

### **3. Teste a Configuração**
1. No mesmo painel, clique em **"Send test email"**
2. Digite seu e-mail pessoal para testar
3. Clique em **Send**
4. Verifique se o e-mail chega

---

## 🔧 **Configurações Alternativas**

Se a primeira configuração não funcionar, tente:

### **Opção 2:**
```
SMTP Host: smtp.hostinger.com
SMTP Port: 587
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [mesma senha]
```

### **Opção 3 (SSL):**
```
SMTP Host: mail.wmsverticalparts.com.br
SMTP Port: 465
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [mesma senha]
```

### **Opção 4 (Outlook/Hotmail se necessário):**
```
SMTP Host: smtp-mail.outlook.com
SMTP Port: 587
SMTP User: suporte@wmsverticalparts.com.br
SMTP Password: [senha do Outlook]
```

---

## 🐛 **Troubleshooting**

### **Erro: "Authentication failed"**
```
Possíveis causas:
- Senha incorreta
- E-mail não existe na Hostinger
- Porta bloqueada pelo firewall
```

**Soluções:**
1. Verifique a senha no painel Hostinger
2. Confirme que o e-mail está ativo
3. Tente porta 465 ao invés de 587

### **Erro: "Connection timeout"**
```
Possíveis causas:
- Host incorreto
- Porta bloqueada
- Problemas de rede
```

**Soluções:**
1. Tente `smtp.hostinger.com` ao invés de `mail.wmsverticalparts.com.br`
2. Verifique se a porta 587 não está bloqueada
3. Teste com outro provedor temporariamente

### **E-mail chega no spam**
```
Solução:
1. Configure SPF/DKIM na Hostinger
2. Adicione o domínio na lista de remetentes confiáveis
3. Peça aos usuários para adicionarem à lista de contatos
```

---

## 📧 **Templates de E-mail**

### **Personalizar E-mail de Convite**
1. No Supabase Dashboard > Authentication > Email Templates
2. Selecione **"Confirm signup"**
3. Personalize o HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Convite WMS VerticalParts</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #f8f9fa; padding: 20px; text-align: center;">
    <h1 style="color: #333; margin: 0;">WMS VerticalParts</h1>
    <p style="color: #666; margin: 10px 0;">Sistema de Gestão de Armazém</p>
  </div>

  <div style="padding: 30px 20px;">
    <h2>Convite de Acesso</h2>
    <p>Olá!</p>
    <p>Você foi convidado a fazer parte do sistema WMS VerticalParts.</p>
    <p>Clique no botão abaixo para confirmar seu e-mail e definir sua senha:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Confirmar E-mail e Criar Senha
      </a>
    </div>

    <p style="color: #666; font-size: 12px;">
      Se o botão não funcionar, copie e cole este link no navegador:<br>
      {{ .ConfirmationURL }}
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

    <p style="color: #666; font-size: 12px;">
      Este convite expira em 24 horas.<br>
      Se você não solicitou este convite, ignore este e-mail.
    </p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
    <p>WMS VerticalParts - Sistema de Gestão de Armazém<br>
    Suporte: suporte@wmsverticalparts.com.br</p>
  </div>
</body>
</html>
```

---

## ✅ **Verificação Final**

Após configurar:

1. **Teste o SMTP** no painel do Supabase
2. **Envie um convite** de teste no sistema
3. **Verifique se chega** no e-mail de destino
4. **Teste o link** de confirmação

---

## 📞 **Suporte**

**Hostinger:**
- Painel > Help > Contact Support
- Documentação: https://support.hostinger.com/

**Supabase:**
- Dashboard > Help > Contact Support
- Documentação: https://supabase.com/docs/guides/auth/auth-email

---

**✅ SMTP configurado para Hostinger!** 📧