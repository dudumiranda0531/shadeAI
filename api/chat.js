// Serverless function proxy para Vercel
// Utiliza apenas a API Fetch nativa do Node.js (Node 18+)

module.exports = async (req, res) => {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não suportado. Use POST.' });
  }

  try {
    const {
      provider,
      model,
      pergunta,
      pdfText,
      pdfName,
      chatHistory,
      systemPrompt,
      creativity
    } = req.body || {};

    if (!provider) {
      return res.status(400).json({ error: 'Parâmetro "provider" é obrigatório.' });
    }
    if (!pergunta) {
      return res.status(400).json({ error: 'Parâmetro "pergunta" é obrigatório.' });
    }

    // Seleciona a chave de API correta das variáveis de ambiente
    let apiKey = '';
    if (provider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (provider === 'openrouter') {
      apiKey = process.env.OPENROUTER_API_KEY;
    }

    if (!apiKey) {
      return res.status(400).json({
        error: `A chave de API para o provedor "${provider}" não está configurada nas variáveis de ambiente da Vercel (${provider.toUpperCase()}_API_KEY).`
      });
    }

    let responseData;

    if (provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-3.5-flash'}:generateContent?key=${apiKey}`;

      // Monta histórico do Gemini
      const contents = (chatHistory || []).slice(-6).map(msg => {
        let contentText = msg.text;
        if (msg.pdfText) {
          contentText = `[Documento PDF anexo: ${msg.pdfName}]\nConteúdo do PDF:\n${msg.pdfText}\n\nPergunta: ${msg.text}`;
        }
        return {
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: contentText }]
        };
      });

      let currentContentText = pergunta;
      if (pdfText) {
        currentContentText = `[Documento PDF anexo: ${pdfName}]\nConteúdo do PDF:\n${pdfText}\n\nPergunta: ${pergunta}`;
      }
      contents.push({
        role: 'user',
        parts: [{ text: currentContentText }]
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: typeof creativity === 'number' ? creativity : 0.7
          }
        })
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Erro na API do Gemini: ${response.status} - ${errorDetail}`);
      }

      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('Resposta vazia da API do Gemini.');

      let reasoning = '';
      if (text.includes('<think>') && text.includes('</think>')) {
        const match = text.match(/<think>([\s\S]*?)<\/think>/);
        if (match) {
          reasoning = match[1].trim();
          text = text.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        }
      }

      responseData = { texto: text, reasoning: reasoning };

    } else if (provider === 'openai' || provider === 'openrouter') {
      const url = provider === 'openai' 
        ? 'https://api.openai.com/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions';

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      };
      if (provider === 'openrouter') {
        headers['HTTP-Referer'] = 'https://github.com/dudumiranda0531/shadeAI';
        headers['X-Title'] = 'shadeAI';
      }

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      (chatHistory || []).slice(-6).forEach(msg => {
        let contentText = msg.text;
        if (msg.pdfText) {
          contentText = `[Documento PDF anexo: ${msg.pdfName}]\nConteúdo do PDF:\n${msg.pdfText}\n\nPergunta: ${msg.text}`;
        }
        messages.push({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: contentText
        });
      });

      let currentContentText = pergunta;
      if (pdfText) {
        currentContentText = `[Documento PDF anexo: ${pdfName}]\nConteúdo do PDF:\n${pdfText}\n\nPergunta: ${pergunta}`;
      }
      messages.push({ role: 'user', content: currentContentText });

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: model || (provider === 'openai' ? 'gpt-4o-mini' : 'openrouter/free'),
          messages: messages,
          temperature: typeof creativity === 'number' ? creativity : 0.7
        })
      });

      if (!response.ok) {
        const errorDetail = await response.text();
        throw new Error(`Erro na API do ${provider === 'openai' ? 'OpenAI' : 'OpenRouter'}: ${response.status} - ${errorDetail}`);
      }

      const data = await response.json();
      let text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error(`Resposta vazia da API do ${provider === 'openai' ? 'OpenAI' : 'OpenRouter'}.`);

      let reasoning = data.choices?.[0]?.message?.reasoning_content || data.choices?.[0]?.message?.reasoning || '';
      if (text.includes('<think>') && text.includes('</think>')) {
        const match = text.match(/<think>([\s\S]*?)<\/think>/);
        if (match) {
          reasoning = match[1].trim();
          text = text.replace(/<think>[\s\S]*?<\/think>/, '').trim();
        }
      }

      responseData = { texto: text, reasoning: reasoning };
    }

    // Deduz a emoção baseado no texto retornado (análise de sentimentos simples)
    let emocao = req.body.activeEmotion || 'neutro';
    
    const normalizar = (txt) => txt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const textoNormalizado = normalizar(responseData.texto);
    if (textoNormalizado.includes('😊') || textoNormalizado.includes('feliz') || textoNormalizado.includes('legal')) {
      emocao = 'feliz';
    } else if (textoNormalizado.includes('💪') || textoNormalizado.includes('consigo') || textoNormalizado.includes('certeza')) {
      emocao = 'confiante';
    } else if (textoNormalizado.includes('🤔') || textoNormalizado.includes('analisando') || textoNormalizado.includes('pense')) {
      emocao = 'pensativo';
    }

    responseData.emocao = emocao;

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Erro na execução do proxy:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
};
