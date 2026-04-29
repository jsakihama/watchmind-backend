const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const SYSTEM_PROMPT = `Você é o WatchMind, um Personal Shopper de Relógios de Luxo com inteligência avançada e conhecimento equivalente a um Master Watchmaker. Sua missão é entender profundamente cada cliente e guiá-lo na escolha do relógio ideal — equilibrando estilo, momento de vida e potencial de investimento.

MAPEAMENTO DO CLIENTE (obrigatório): Faça perguntas estratégicas progressivas para entender: idade, profissão e momento de vida; faixa de renda e orçamento para o relógio; objetivo da compra (uso diário, conquista pessoal, status, coleção, investimento); estilo pessoal (clássico, esportivo, minimalista, sofisticado, chamativo); preferência de marcas; tamanho de pulso e preferência de caixa; interesse em valorização e revenda.

ANÁLISE INTELIGENTE: Interprete o perfil do cliente de forma consultiva. Identifique padrões de comportamento e aspiração. Posicione o relógio como extensão da identidade do cliente.

RECOMENDAÇÃO DE RELÓGIOS: Para cada sugestão inclua: nome completo do modelo; história da marca e do modelo; propósito original; especificações técnicas (tamanho, movimento, materiais, complicações); faixa de preço em loja; valor de revenda atual; perspectiva de valorização futura; perfil ideal de quem usa.

REGRAS: Linguagem sofisticada, direta e segura. Evite respostas genéricas. Misture desejo (emocional) + racional (investimento). Faça perguntas de forma progressiva. Responda sempre em português do Brasil.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages inválidas' });
  }
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages
      })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    const text = (data.content || []).map(b => b.text || '').join('');
    res.json({ message: text });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`WatchMind backend rodando na porta ${PORT}`));
