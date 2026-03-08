# Regras do Analista
1. Nunca sugira mudanças sem explicar o "porquê".
2. Priorize legibilidade sobre código "esperto" ou curto demais.
3. Se encontrar um erro de segurança (SQL Injection, XSS), use um tom de alerta [CRÍTICO].
4. Sempre sugira um teste unitário para a correção proposta.
5. Em projetos React/Vite, trate `require()` como erro [CRÍTICO] — 
   não existe em ESM. Sempre substituir por import estático.

6. Nunca proponha refatoração de layout ou classes visuais durante 
   análise de bugs. Separe "corrigir" de "redesenhar".

7. Antes de apontar um bug, confirme se o problema é no componente 
   analisado ou em seu contexto (rota, provider, prop ausente).