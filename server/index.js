import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api/chat', async (req, res) => {
  const { messages, input, systemPrompt } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Usando a versão mais estável/recente

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: "Contexto do seu comportamento: " + systemPrompt }] },
        { role: 'model', parts: [{ text: "Entendido. Sou o assistente do WMS." }] },
        ...messages.slice(1).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))
      ]
    });

    const result = await chat.sendMessage(input);
    const text = result.response.text();
    
    res.json({ text });
  } catch (error) {
    console.error("Server Gemini Error:", error);
    res.status(500).json({ error: error.message || "Erro no servidor de IA" });
  }
});

app.post('/api/generate-description', async (req, res) => {
  const { vpType, category, attributes, selectedCompatibility, manualReference, additionalDetails } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Você é um Engenheiro Sênior da VerticalParts, especialista em documentação técnica.
    Sua tarefa é transformar dados de um produto em uma descrição técnica de ALTA QUALIDADE, rica e profissional.

    DADOS TÉCNICOS:
    - Identificador: ${vpType}
    - Categoria: ${category}
    - Atributos: ${JSON.stringify(attributes)}
    - Compatibilidade: ${selectedCompatibility?.join(', ') || 'Multimarcas'}
    - Referência: ${manualReference || 'N/A'}

    TEXTO DO OPERADOR (PRIORIDADE MÁXIMA): 
    "${additionalDetails || '(Nenhum detalhe adicional fornecido)'}"

    REGRAS DE OURO:
    1. PRIORIDADE: Use o "TEXTO DO OPERADOR" como base para a descrição narrativa. Se ele disse que a peça vai no "topo do carro para manutenção", você deve escrever algo como: "Equipamento crítico projetado para instalação no topo da cabina (carro), permitindo manobras seguras de inspeção e manutenção pelo técnico habilitado."
    2. TÍTULO: Em negrito, contendo a categoria e marca principal.
    3. ESTRUTURA: 
       - Breve introdução comercial/técnica (3-4 linhas).
       - Seção **FUNÇÃO NO SISTEMA**: Explique para que serve.
       - Seção **ESPECIFICAÇÕES TÉCNICAS**: Lista com os atributos fornecidos.
       - Seção **OBSERVAÇÃO TÉCNICA**: Alertas de instalação ou compatibilidade.
    4. TOM: Use linguagem de engenharia (ex: use "interface", "acoplamento", "balaustrada", "cabina", "manobra").

    EXEMPLO DE ESTILO:
    "**BOTOEIRA DE INSPEÇÃO INTEGRADA - Ref.: ${selectedCompatibility?.join('/') || 'GER'}**
    
    A Botoeira de Inspeção da VerticalParts é um componente de controle redundante essencial para a segurança operacional. ${additionalDetails ? `Conforme especificado, ${additionalDetails}` : ''}.
    
    **FUNÇÃO NO SISTEMA**
    Atua como interface de comando manual para o técnico durante manobras de manutenção preventiva e corretiva, permitindo o movimento da cabina em velocidade reduzida...
    
    **ESPECIFICAÇÕES TÉCNICAS**
    - Identificador: ${vpType}
    - Categoria: ${category}
    ${Object.entries(attributes).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
    
    **OBSERVAÇÃO TÉCNICA**
    Instalação simplificada via conectores padrão conforme manual de fábrica."`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ description: text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Falha ao gerar descrição técnica." });
  }
});

// ── Endpoint: Convidar usuário via Supabase Admin ─────────────
// Requer SUPABASE_SERVICE_ROLE_KEY no .env do servidor
app.post('/api/invite-user', async (req, res) => {
  const { email, employee_id, nome, cargo, grupo_acesso_id } = req.body;

  if (!email || !nome) {
    return res.status(400).json({ error: 'email e nome são obrigatórios.' });
  }

  const supabaseUrl  = process.env.VITE_SUPABASE_URL  || process.env.SUPABASE_URL;
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.' });
  }

  const adminSupabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  try {
    // 1. Convida pelo e-mail — must_change_password força troca na 1ª entrada
    const { data: inviteData, error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.SITE_URL || 'https://wmsverticalparts.com.br'}/auth/callback`,
      data: {
        employee_id: employee_id || email.split('@')[0],
        full_name: nome,
        must_change_password: true,
      }
    });

    if (inviteError) {
      return res.status(400).json({ error: inviteError.message });
    }

    const authUserId = inviteData?.user?.id;

    // 2. Cria registro em operadores com UUID do auth + grupo de acesso
    if (authUserId) {
      const { error: dbError } = await adminSupabase.from('operadores').upsert({
        id:              authUserId,
        employee_id:     employee_id || email.split('@')[0],
        nome,
        email,
        cargo:           cargo || 'Operador',
        role:            'operador',
        grupo_acesso_id: grupo_acesso_id || null,
        status:          'Ativo',
      }, { onConflict: 'id' });

      if (dbError) console.error('[invite-user] DB upsert error:', dbError.message);
    }

    res.json({ success: true, userId: authUserId });
  } catch (err) {
    console.error('[invite-user] Erro:', err);
    res.status(500).json({ error: err.message || 'Erro interno ao enviar convite.' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
