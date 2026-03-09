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
    1. O título deve ser em NEGRITO e conter o nome da categoria e dimensões principais (ex: **NOME DO PRODUTO (DIMENSÕES) - Ref.: COMPATIBILIDADE**).
    2. Logo abaixo do título, escreva uma descrição rica e detalhada da peça, especificando seu material, onde se encaixa e seu acabamento.
    3. Crie uma seção de FUNÇÃO NO SISTEMA detalhando para que a peça serve e como ela funciona.
    4. Crie uma seção de ESPECIFICAÇÕES TÉCNICAS em lista (Markdown).
    5. Adicione uma OBSERVAÇÃO TÉCNICA com alertas de instalação ou substituição.
    6. O tom deve ser profissional e de engenharia.
    7. NÃO use asteriscos triplos para negrito, use apenas duplos: **Texto**.

    Exemplo de Excelência (Use este nível de detalhamento):
    "**CAPA PROTETORA DE ENTRADA DO CORRIMÃO (HANDRAIL INLET COVER) — ESQUERDO**
    
    Capa protetora em plástico instalada na caixa de entrada do corrimão da escada ou esteira rolante. Lado esquerdo. Cobre o ponto de acesso do corrimão à estrutura interna, prevenindo contato acidental com o mecanismo de acionamento e ocultando a abertura de forma esteticamente integrada à balaustrada.
    
    **FUNÇÃO NO SISTEMA**
    A Capa Protetora (também chamada Handrail Inlet Cover ou Handrail Entry Box) é a cobertura externa da caixa de entrada do corrimão. Funciona como barreira física contra intrusão de dedos e objetos na região do mecanismo de acionamento do corrimão.
    
    **ESPECIFICAÇÕES TÉCNICAS**
    - Material: Plástico de engenharia (resistente ao impacto e UV)
    - Cor: Preto
    - Lado: Esquerdo
    - Compatibilidade: Escadas rolantes modelo XIZI (compatível com Otis)
    
    **OBSERVAÇÃO TÉCNICA**
    O part number identifica especificamente o lado esquerdo. Em caso de substituição, confirmar o side marking na peça original."`;

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
