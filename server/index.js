import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const prompt = `Você é um especialista em descrições técnicas de peças para elevadores e escadas rolantes da VerticalParts. 
    Com base nas informações abaixo, gere uma descrição técnica completa e padronizada.

    Informações do produto:
    - Tipo: ${vpType}
    - Categoria: ${category}
    - Atributos: ${JSON.stringify(attributes)}
    - Compatibilidade: ${selectedCompatibility?.join(', ') || 'N/A'}
    - Referência: ${manualReference}
    - Detalhes adicionais: ${additionalDetails}

    DIRETRIZES:
    1. O título deve ser em NEGRITO e conter o nome da categoria e dimensões principais.
    2. Explique a FUNÇÃO NO SISTEMA da peça.
    3. Crie uma seção de ESPECIFICAÇÕES TÉCNICAS em lista.
    4. Adicione uma OBSERVAÇÃO TÉCNICA se relevante.
    5. O tom deve ser profissional e técnico.
    6. Formate em Markdown.
    7. NÃO use asteriscos triplos para negrito, use apenas duplos: **Texto**.

    Exemplo de saída desejada:
    "**Polia de Tração do Corrimão (587x30mm) - Ref.: CCS/CCO**
    
    A polia de tração é responsável por movimentar o corrimão da escada rolante...
    
    **FUNÇÃO NO SISTEMA**
    Transmite o movimento do motor...
    
    **ESPECIFICAÇÕES TÉCNICAS**
    - Material: Alumínio
    - Diâmetro: 587 mm
    ...
    
    **OBSERVAÇÃO TÉCNICA**
    Verificar desgaste..."`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    res.json({ description: text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: "Falha ao gerar descrição técnica." });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
