# Configuração Supabase — VerticalParts WMS

> **Para Claude:** Siga este documento passo a passo para corrigir a configuração do Supabase.
> O projeto está em: https://supabase.com/dashboard/project/lbobuczpnmcnbuhslewx

---

## 🚨 Problema Principal

O **Site URL** do Supabase está configurado como `localhost`, por isso os links
de convite e redefinição de senha no e-mail apontam para `localhost` em vez de
`https://wmsverticalparts.com.br`.

---

## ✅ PASSO 1 — Corrigir Site URL e Redirect URLs

**Via Dashboard** (Authentication → URL Configuration):

| Campo | Valor correto |
|-------|--------------|
| Site URL | `https://wmsverticalparts.com.br` |
| Redirect URLs | `https://wmsverticalparts.com.br/**` |

**Via Management API** (se preferir automatizar):
```bash
# Requer: SUPABASE_ACCESS_TOKEN do https://supabase.com/dashboard/account/tokens
curl -X PATCH https://api.supabase.com/v1/projects/lbobuczpnmcnbuhslewx/config/auth \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "site_url": "https://wmsverticalparts.com.br",
    "uri_allow_list": "https://wmsverticalparts.com.br/**"
  }'
```

---

## ✅ PASSO 2 — Template: Convite de Usuário (Invite User)

**Via Dashboard**: Authentication → Email → Invite user

Cole no campo **Subject**:
```
Você foi convidado ao VerticalParts WMS
```

Cole no campo **Body** (Source):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

<!-- HEADER -->
<tr><td style="background-color:#FFD700;padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#0f172a;font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">VERTICALPARTS</h1>
  <p style="margin:4px 0 0;color:#0f172a;font-size:11px;letter-spacing:3px;font-weight:700;text-transform:uppercase;">Warehouse Management System</p>
</td></tr>

<!-- BODY -->
<tr><td style="padding:40px;">
  <h2 style="color:#FFD700;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">🎉 Você foi convidado!</h2>
  <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">Um administrador concedeu acesso à plataforma <strong style="color:#e2e8f0;">VerticalParts WMS</strong>. Clique no botão abaixo para aceitar o convite e criar sua senha de acesso.</p>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" width="100%"><tr>
    <td align="center" style="padding:4px 0 36px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#FFD700;color:#0f172a;text-decoration:none;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:18px 48px;border-radius:12px;">✓ Aceitar Convite e Criar Senha</a>
    </td>
  </tr></table>

  <!-- STEPS -->
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:28px;">
  <tr><td style="padding:24px;">
    <p style="color:#FFD700;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 16px;">📋 Como começar</p>
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr><td style="padding:7px 0;">
        <span style="display:inline-block;background:#FFD700;color:#0f172a;font-size:10px;font-weight:900;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;margin-right:12px;vertical-align:middle;">1</span>
        <span style="color:#cbd5e1;font-size:13px;vertical-align:middle;">Clique no botão acima para aceitar o convite</span>
      </td></tr>
      <tr><td style="padding:7px 0;">
        <span style="display:inline-block;background:#FFD700;color:#0f172a;font-size:10px;font-weight:900;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;margin-right:12px;vertical-align:middle;">2</span>
        <span style="color:#cbd5e1;font-size:13px;vertical-align:middle;">Crie uma senha segura com no mínimo 6 caracteres</span>
      </td></tr>
      <tr><td style="padding:7px 0;">
        <span style="display:inline-block;background:#FFD700;color:#0f172a;font-size:10px;font-weight:900;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;margin-right:12px;vertical-align:middle;">3</span>
        <span style="color:#cbd5e1;font-size:13px;vertical-align:middle;">Acesse em <strong style="color:#FFD700;">wmsverticalparts.com.br</strong> com seu e-mail e senha</span>
      </td></tr>
      <tr><td style="padding:7px 0;">
        <span style="display:inline-block;background:#FFD700;color:#0f172a;font-size:10px;font-weight:900;width:22px;height:22px;border-radius:50%;text-align:center;line-height:22px;margin-right:12px;vertical-align:middle;">4</span>
        <span style="color:#cbd5e1;font-size:13px;vertical-align:middle;">Nunca compartilhe sua senha — a VerticalParts nunca pedirá</span>
      </td></tr>
    </table>
  </td></tr></table>

  <p style="color:#475569;font-size:11px;text-align:center;margin:0;">Este link expira em 24 horas. Se não solicitou acesso, ignore este e-mail.</p>
</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
  <p style="color:#475569;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:1px;">VerticalParts WMS Enterprise</p>
  <p style="color:#334155;font-size:10px;margin:4px 0 0;">wmsverticalparts.com.br</p>
</td></tr>

</table>
</td></tr></table>
</body>
</html>
```

---

## ✅ PASSO 3 — Template: Redefinição de Senha (Recovery)

**Via Dashboard**: Authentication → Email → Reset Password

Cole no campo **Subject**:
```
Redefinição de senha — VerticalParts WMS
```

Cole no campo **Body** (Source):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

<!-- HEADER -->
<tr><td style="background-color:#FFD700;padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#0f172a;font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">VERTICALPARTS</h1>
  <p style="margin:4px 0 0;color:#0f172a;font-size:11px;letter-spacing:3px;font-weight:700;text-transform:uppercase;">Warehouse Management System</p>
</td></tr>

<!-- BODY -->
<tr><td style="padding:40px;">
  <h2 style="color:#FFD700;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">🔐 Redefinir Senha</h2>
  <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color:#e2e8f0;">VerticalParts WMS</strong>. Clique no botão abaixo para criar uma nova senha.</p>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" width="100%"><tr>
    <td align="center" style="padding:4px 0 36px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#FFD700;color:#0f172a;text-decoration:none;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:18px 48px;border-radius:12px;">🔑 Criar Nova Senha</a>
    </td>
  </tr></table>

  <table cellpadding="0" cellspacing="0" width="100%" style="background-color:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
    <p style="color:#FFD700;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">⚠️ Segurança</p>
    <p style="color:#94a3b8;font-size:12px;margin:0;line-height:1.6;">Se você não solicitou a redefinição de senha, ignore este e-mail — sua conta continua segura. O link expira em <strong style="color:#e2e8f0;">1 hora</strong>.</p>
  </td></tr></table>

  <p style="color:#475569;font-size:11px;text-align:center;margin:0;">A VerticalParts nunca pedirá sua senha por e-mail ou telefone.</p>
</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
  <p style="color:#475569;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:1px;">VerticalParts WMS Enterprise</p>
  <p style="color:#334155;font-size:10px;margin:4px 0 0;">wmsverticalparts.com.br</p>
</td></tr>

</table>
</td></tr></table>
</body>
</html>
```

---

## ✅ PASSO 4 — Template: Confirmar E-mail (Confirm Signup)

**Via Dashboard**: Authentication → Email → Confirm sign up

Cole no campo **Subject**:
```
Confirme seu acesso — VerticalParts WMS
```

Cole no campo **Body** (Source):
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

<!-- HEADER -->
<tr><td style="background-color:#FFD700;padding:28px 40px;text-align:center;">
  <h1 style="margin:0;color:#0f172a;font-size:24px;font-weight:900;letter-spacing:4px;text-transform:uppercase;">VERTICALPARTS</h1>
  <p style="margin:4px 0 0;color:#0f172a;font-size:11px;letter-spacing:3px;font-weight:700;text-transform:uppercase;">Warehouse Management System</p>
</td></tr>

<!-- BODY -->
<tr><td style="padding:40px;">
  <h2 style="color:#FFD700;font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">✉️ Confirme seu e-mail</h2>
  <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 28px;">Para ativar seu acesso ao <strong style="color:#e2e8f0;">VerticalParts WMS</strong>, confirme seu endereço de e-mail clicando no botão abaixo.</p>

  <!-- CTA -->
  <table cellpadding="0" cellspacing="0" width="100%"><tr>
    <td align="center" style="padding:4px 0 36px;">
      <a href="{{ .ConfirmationURL }}" style="display:inline-block;background-color:#FFD700;color:#0f172a;text-decoration:none;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:2px;padding:18px 48px;border-radius:12px;">✓ Confirmar E-mail</a>
    </td>
  </tr></table>

  <p style="color:#475569;font-size:11px;text-align:center;margin:0;">Este link expira em 24 horas. Se não criou uma conta, ignore este e-mail.</p>
</td></tr>

<!-- FOOTER -->
<tr><td style="background-color:#0f172a;padding:20px 40px;text-align:center;border-top:1px solid #1e293b;">
  <p style="color:#475569;font-size:10px;margin:0;text-transform:uppercase;letter-spacing:1px;">VerticalParts WMS Enterprise</p>
  <p style="color:#334155;font-size:10px;margin:4px 0 0;">wmsverticalparts.com.br</p>
</td></tr>

</table>
</td></tr></table>
</body>
</html>
```

---

## ✅ PASSO 5 — Verificação Final

Após aplicar todas as mudanças:

1. Acesse o dashboard: Authentication → URL Configuration
2. Confirme que **Site URL** = `https://wmsverticalparts.com.br`
3. Vá em Authentication → Users → Invite a User (use seu próprio e-mail para teste)
4. Verifique que o e-mail recebido tem o layout correto e o link aponta para `wmsverticalparts.com.br`
5. Clique no link → deve abrir `wmsverticalparts.com.br/redefinir-senha`
6. Crie uma nova senha → deve redirecionar para o login

---

## 📌 Referência Rápida

| Item | Valor |
|------|-------|
| Project Ref | `lbobuczpnmcnbuhslewx` |
| Project URL | `https://lbobuczpnmcnbuhslewx.supabase.co` |
| Dashboard | `https://supabase.com/dashboard/project/lbobuczpnmcnbuhslewx` |
| Site URL correto | `https://wmsverticalparts.com.br` |
| Redirect após convite | `https://wmsverticalparts.com.br/redefinir-senha` |
| Redirect após reset senha | `https://wmsverticalparts.com.br/redefinir-senha` |
