import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

app.post('/api/chat', async (req, res) => {
  const { messages, input, systemPrompt, currentPage } = req.body;

  try {
    // Monta histórico: exclui a mensagem inicial do assistente, converte roles
    const history = messages
      .filter(m => m.content && m.role !== 'assistant' || messages.indexOf(m) > 0)
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }));

    // Garante que começa com 'user' (requisito da API)
    const validHistory = [];
    for (const msg of history) {
      if (validHistory.length === 0 && msg.role !== 'user') continue;
      validHistory.push(msg);
    }

    // Adiciona mensagem atual do usuário
    validHistory.push({ role: 'user', content: input });

    const pageContext = currentPage
      ? `\n\nPÁGINA ATUAL DO USUÁRIO: ${currentPage} — responda com foco nesta área do sistema.`
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: (systemPrompt || '') + pageContext,
      messages: validHistory,
    });

    const text = response.content[0]?.text || '';
    res.json({ text });
  } catch (error) {
    console.error("Server Claude Error:", error);
    res.status(500).json({ error: error.message || "Erro no servidor de IA" });
  }
});

app.post('/api/generate-description', async (req, res) => {
  const { vpType, category, attributes, selectedCompatibility, manualReference, additionalDetails, sku, descricao } = req.body;

  try {
    // selectedCompatibility pode chegar como string (já formatada pelo frontend) ou array
    const compatStr = Array.isArray(selectedCompatibility)
      ? selectedCompatibility.join(', ')
      : (selectedCompatibility || 'Multimarcas');

    const prompt = `Você é um Engenheiro Sênior da VerticalParts, especialista em documentação técnica de elevadores, escadas rolantes e esteiras.
Sua tarefa é transformar dados de um produto em uma FICHA TÉCNICA DE ALTA QUALIDADE, rica e profissional, pronta para uso em catálogo de vendas e Nota Fiscal.

DADOS DO PRODUTO:
- SKU: ${sku || vpType || 'N/A'}
- Descrição curta: ${descricao || 'N/A'}
- Prefixo VP: ${vpType || 'N/A'}
- Natureza/Categoria: ${category || 'N/A'}
- Atributos técnicos: ${JSON.stringify(attributes || {})}
- Compatibilidade com marcas: ${compatStr}
- Referência/Marca: ${manualReference || 'N/A'}

OBSERVAÇÕES DO OPERADOR (PRIORIDADE MÁXIMA — incorpore todo este conteúdo):
"${additionalDetails || '(Nenhuma observação fornecida)'}"

INSTRUÇÕES DE FORMATAÇÃO:
1. Comece com um parágrafo de introdução comercial/técnica (3-4 linhas) descrevendo o produto e sua aplicação.
2. Seção **FUNÇÃO NO SISTEMA**: onde e como este componente é instalado/utilizado.
3. Seção **ESPECIFICAÇÕES TÉCNICAS**: lista detalhada com todos os atributos fornecidos (dimensões, materiais, tensões, etc.).
4. Seção **COMPATIBILIDADE**: marcas e modelos compatíveis.
5. Seção **OBSERVAÇÃO TÉCNICA**: alertas importantes de instalação, armazenamento ou manutenção.
Use linguagem de engenharia: "interface", "acoplamento", "balaustrada", "cabina", "manobra", "vão livre", "carga nominal", "ciclos de operação".
Responda em Português Brasileiro. Seja preciso e profissional. Não use bullet points genéricos — use linguagem técnica de catálogo industrial.`;

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text || '';
    res.json({ description: text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Falha ao gerar descrição técnica." });
  }
});

// ── Convidar novo usuário via Supabase Admin ──────────────────────────────────
app.post('/api/invite-user', async (req, res) => {
  const { email, nome, cargo, employee_id, grupo_acesso_id, paginas_permitidas } = req.body;

  const supabaseUrl     = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Variáveis de ambiente do servidor não configuradas.' });
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Convite via Supabase Auth
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { data: { must_change_password: true, nome, cargo } }
    );
    if (inviteError) throw inviteError;

    const userId = inviteData.user.id;

    // 2. Upsert na tabela operadores
    const operadorData = {
      id:          userId,
      nome,
      email,
      cargo:       cargo       || 'Operador',
      employee_id: employee_id || email.split('@')[0],
      role:        'operador',
      ativo:       true,
    };
    if (grupo_acesso_id)    operadorData.grupo_acesso_id    = grupo_acesso_id;
    if (paginas_permitidas) operadorData.paginas_permitidas = paginas_permitidas;

    const { error: upsertError } = await supabaseAdmin
      .from('operadores')
      .upsert(operadorData);
    if (upsertError) throw upsertError;

    res.json({ success: true, user_id: userId });
  } catch (error) {
    console.error('Invite error:', error);
    res.status(500).json({ error: error.message || 'Falha ao convidar usuário.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
