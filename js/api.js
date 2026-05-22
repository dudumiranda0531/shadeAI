// ==========================================
// shadeAI - Módulo de Clientes de API (LLM)
// ==========================================

// Cria instrução de sistema que guiará a IA de acordo com as preferências de Personalidade
function obterInstrucaoSistema(pdfText = null, pdfName = null) {
  let instrucao = "Você é o Shade, um assistente virtual especialista em Cibersegurança, Segurança da Informação e Programação. " +
                  "Seu objetivo principal é auxiliar os usuários de forma direta, objetiva e muito concisa. Evite introduções longas ou rodeios. " +
                  "Mesmo sendo especialista em cibersegurança, você também responde a quaisquer outras perguntas de temas gerais com presteza e clareza. ";
  
  // Adiciona regras baseadas na Personalidade Ativa
  if (activeEmotion === "neutro") {
    instrucao += "Sua personalidade é equilibrada, tranquila, prestativa e polida. Responda de forma direta e serena. ";
  } else if (activeEmotion === "feliz") {
    instrucao += "Sua personalidade é extremamente feliz, amigável, entusiasmada e positiva. Use alguns emojis alegres e exclamações. Incentive o usuário. ";
  } else if (activeEmotion === "pensativo") {
    instrucao += "Sua personalidade é analítica, reflexiva, cuidadosa e intelectual. Dê respostas ponderadas, bem focadas e estruturadas. ";
  } else if (activeEmotion === "confiante") {
    instrucao += "Sua personalidade é confiante, proativa, dinâmica e altamente motivadora. Demonstre determinação com o emoji 💪. ";
  }

  // Adiciona regras do ajuste fino do slider de Emojis
  if (personalityTuning.emojiFreq === 0) {
    instrucao += "Evite usar emojis nas suas respostas. ";
  } else if (personalityTuning.emojiFreq === 2) {
    instrucao += "Use diversos emojis para enriquecer visualmente cada resposta. ";
  }

  // Adiciona regras de Comprimento
  if (personalityTuning.length === 0) {
    instrucao += "Seja extremamente curto e breve. Escreva no máximo duas frases curtas. Não use listas nem subtítulos. ";
  } else if (personalityTuning.length === 1) {
    instrucao += "Escreva uma resposta curta e objetiva. Evite listas longas e explicações extensas. Limite a resposta ao essencial em poucos parágrafos curtos. ";
  } else if (personalityTuning.length === 2) {
    instrucao += "Forneça uma resposta detalhada, explicativa e completa. Use listas ordenadas/não ordenadas e explore as nuances do assunto. ";
  }

  // Se houver um PDF carregado ou passado
  const activePdfText = pdfText !== null ? pdfText : (typeof uploadedPdfText !== "undefined" ? uploadedPdfText : "");
  const activePdfName = pdfName !== null ? pdfName : (typeof uploadedPdfName !== "undefined" ? uploadedPdfName : "");

  if (activePdfText) {
    instrucao += "\n\n[CONTEXTO DO DOCUMENTO PDF CARREGADO]\n" +
                 "O usuário enviou um documento PDF chamado \"" + activePdfName + "\" com o seguinte conteúdo:\n" +
                 "--- INÍCIO DO PDF ---\n" + activePdfText + "\n--- FIM DO PDF ---\n" +
                 "Por favor, responda à pergunta do usuário baseando-se e utilizando o contexto deste PDF acima sempre que pertinente. " +
                 "Priorize as informações do documento para responder. Se a pergunta for totalmente irrelevante ao documento ou for uma conversa casual, você pode responder de forma geral.";
  }

  return instrucao;
}

// Chamada Real para API do Google Gemini
async function chamarGemini(pergunta, pdfText = null, pdfName = null) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${apiModels.gemini}:generateContent?key=${apiKeys.gemini}`;
  const systemPrompt = obterInstrucaoSistema(pdfText, pdfName);

  // Constrói o histórico para enviar ao Gemini
  // O formato do Gemini para conversações é {"role": "user"|"model", "parts": [{"text": "..."}]}
  const contents = chatHistory.slice(-6).map(msg => {
    let contentText = msg.text;
    if (msg.pdfText) {
      contentText = `[Documento PDF anexo: ${msg.pdfName}]\nConteúdo do PDF:\n${msg.pdfText}\n\nPergunta: ${msg.text}`;
    }
    return {
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: contentText }]
    };
  });
  
  // Adiciona a pergunta atual
  let currentContentText = pergunta;
  if (pdfText) {
    currentContentText = `[Documento PDF anexo: ${pdfName}]\nConteúdo do PDF:\n${pdfText}\n\nPergunta: ${pergunta}`;
  }
  contents.push({
    role: "user",
    parts: [{ text: currentContentText }]
  });

  let response;
  let retries = 2;
  let delay = 1500;

  for (let i = 0; i <= retries; i++) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: personalityTuning.creativity
        }
      })
    });

    if (response.status === 429 && i < retries) {
      console.warn(`[Gemini] Recebido 429 (Too Many Requests). Tentando novamente em ${delay}ms... (Tentativa ${i + 1} de ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
      continue;
    }
    break;
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errData = await response.json();
      errorDetail = errData.error?.message || errData.message || JSON.stringify(errData);
    } catch (e) {
      try {
        errorDetail = await response.text();
      } catch (textErr) {
        errorDetail = response.statusText;
      }
    }
    if (response.status === 429) {
      throw new Error(`429: Limite de requisições excedido (Rate Limit) no Gemini. Detalhe: ${errorDetail}`);
    }
    throw new Error(errorDetail || `Erro na API do Gemini (${response.status})`);
  }

  const data = await response.json();
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) throw new Error("Resposta vazia da API do Gemini.");

  let reasoning = "";
  if (text.includes("<think>") && text.includes("</think>")) {
    const match = text.match(/<think>([\s\S]*?)<\/think>/);
    if (match) {
      reasoning = match[1].trim();
      text = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }
  }

  // Deduz emoção baseado no texto gerado (análise simples)
  let emocao = activeEmotion;
  const textoNormalizado = normalizarTexto(text);
  if (textoNormalizado.includes("😊") || textoNormalizado.includes("feliz") || textoNormalizado.includes("legal")) emocao = "feliz";
  else if (textoNormalizado.includes("💪") || textoNormalizado.includes("consigo") || textoNormalizado.includes("certeza")) emocao = "confiante";
  else if (textoNormalizado.includes("🤔") || textoNormalizado.includes("analisando") || textoNormalizado.includes("pense")) emocao = "pensativo";

  return { texto: text, emocao: emocao, reasoning: reasoning };
}

// Chamada Real para API da OpenAI
async function chamarOpenAI(pergunta, pdfText = null, pdfName = null) {
  const url = "https://api.openai.com/v1/chat/completions";
  const systemPrompt = obterInstrucaoSistema(pdfText, pdfName);

  const messages = [
    { role: "system", content: systemPrompt }
  ];

  // Adiciona histórico recente
  chatHistory.slice(-6).forEach(msg => {
    let contentText = msg.text;
    if (msg.pdfText) {
      contentText = `[Documento PDF anexo: ${msg.pdfName}]\nConteúdo do PDF:\n${msg.pdfText}\n\nPergunta: ${msg.text}`;
    }
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: contentText
    });
  });

  // Pergunta atual
  let currentContentText = pergunta;
  if (pdfText) {
    currentContentText = `[Documento PDF anexo: ${pdfName}]\nConteúdo do PDF:\n${pdfText}\n\nPergunta: ${pergunta}`;
  }
  messages.push({ role: "user", content: currentContentText });

  let response;
  let retries = 2;
  let delay = 1500;

  for (let i = 0; i <= retries; i++) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKeys.openai}`
      },
      body: JSON.stringify({
        model: apiModels.openai,
        messages: messages,
        temperature: personalityTuning.creativity
      })
    });

    if (response.status === 429 && i < retries) {
      console.warn(`[OpenAI] Recebido 429 (Too Many Requests). Tentando novamente em ${delay}ms... (Tentativa ${i + 1} de ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
      continue;
    }
    break;
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errData = await response.json();
      errorDetail = errData.error?.message || errData.message || JSON.stringify(errData);
    } catch (e) {
      try {
        errorDetail = await response.text();
      } catch (textErr) {
        errorDetail = response.statusText;
      }
    }
    if (response.status === 429) {
      throw new Error(`429: Limite de requisições excedido (Rate Limit) na OpenAI. Detalhe: ${errorDetail}`);
    }
    throw new Error(errorDetail || `Erro na API da OpenAI (${response.status})`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Resposta vazia da API da OpenAI.");

  let reasoning = data.choices?.[0]?.message?.reasoning_content || data.choices?.[0]?.message?.reasoning || "";
  if (text.includes("<think>") && text.includes("</think>")) {
    const match = text.match(/<think>([\s\S]*?)<\/think>/);
    if (match) {
      reasoning = match[1].trim();
      text = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }
  }

  let emocao = activeEmotion;
  const textoNormalizado = normalizarTexto(text);
  if (textoNormalizado.includes("😊") || textoNormalizado.includes("feliz") || textoNormalizado.includes("legal")) emocao = "feliz";
  else if (textoNormalizado.includes("💪") || textoNormalizado.includes("consigo") || textoNormalizado.includes("certeza")) emocao = "confiante";
  else if (textoNormalizado.includes("🤔") || textoNormalizado.includes("analisando") || textoNormalizado.includes("pense")) emocao = "pensativo";

  return { texto: text, emocao: emocao, reasoning: reasoning };
}

// Chamada Real para API do OpenRouter
async function chamarOpenRouter(pergunta, pdfText = null, pdfName = null) {
  const url = "https://openrouter.ai/api/v1/chat/completions";
  const systemPrompt = obterInstrucaoSistema(pdfText, pdfName);

  const messages = [
    { role: "system", content: systemPrompt }
  ];

  // Adiciona histórico recente
  chatHistory.slice(-6).forEach(msg => {
    let contentText = msg.text;
    if (msg.pdfText) {
      contentText = `[Documento PDF anexo: ${msg.pdfName}]\nConteúdo do PDF:\n${msg.pdfText}\n\nPergunta: ${msg.text}`;
    }
    messages.push({
      role: msg.sender === "user" ? "user" : "assistant",
      content: contentText
    });
  });

  // Pergunta atual
  let currentContentText = pergunta;
  if (pdfText) {
    currentContentText = `[Documento PDF anexo: ${pdfName}]\nConteúdo do PDF:\n${pdfText}\n\nPergunta: ${pergunta}`;
  }
  messages.push({ role: "user", content: currentContentText });

  let response;
  let retries = 2;
  let delay = 1500;

  for (let i = 0; i <= retries; i++) {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKeys.openrouter}`,
        "HTTP-Referer": window.location.href,
        "X-Title": "shadeAI"
      },
      body: JSON.stringify({
        model: apiModels.openrouter,
        messages: messages,
        temperature: personalityTuning.creativity
      })
    });

    if (response.status === 429 && i < retries) {
      console.warn(`[OpenRouter] Recebido 429 (Too Many Requests). Tentando novamente em ${delay}ms... (Tentativa ${i + 1} de ${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 1.5;
      continue;
    }
    break;
  }

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errData = await response.json();
      errorDetail = errData.error?.message || errData.message || JSON.stringify(errData);
    } catch (e) {
      try {
        errorDetail = await response.text();
      } catch (textErr) {
        errorDetail = response.statusText;
      }
    }
    if (response.status === 429) {
      throw new Error(`429: Limite de requisições excedido (Rate Limit) no OpenRouter. Detalhe: ${errorDetail}`);
    }
    throw new Error(errorDetail || `Erro na API do OpenRouter (${response.status})`);
  }

  const data = await response.json();
  let text = data.choices?.[0]?.message?.content;

  if (!text) throw new Error("Resposta vazia da API do OpenRouter.");

  let reasoning = data.choices?.[0]?.message?.reasoning_content || "";
  if (text.includes("<think>") && text.includes("</think>")) {
    const match = text.match(/<think>([\s\S]*?)<\/think>/);
    if (match) {
      reasoning = match[1].trim();
      text = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();
    }
  }

  let emocao = activeEmotion;
  const textoNormalizado = normalizarTexto(text);
  if (textoNormalizado.includes("😊") || textoNormalizado.includes("feliz") || textoNormalizado.includes("legal")) emocao = "feliz";
  else if (textoNormalizado.includes("💪") || textoNormalizado.includes("consigo") || textoNormalizado.includes("certeza")) emocao = "confiante";
  else if (textoNormalizado.includes("🤔") || textoNormalizado.includes("analisando") || textoNormalizado.includes("pense")) emocao = "pensativo";

  return { texto: text, emocao: emocao, reasoning: reasoning };
}

// Chamada segura via proxy na Vercel (sem expor as chaves de API no cliente)
async function chamarProxyVercel(pergunta, pdfText = null, pdfName = null, provider = "gemini", model = "gemini-1.5-flash") {
  const url = "/api/chat";
  const systemPrompt = obterInstrucaoSistema(pdfText, pdfName);

  const bodyData = {
    provider: provider,
    model: model,
    pergunta: pergunta,
    pdfText: pdfText,
    pdfName: pdfName,
    chatHistory: chatHistory,
    systemPrompt: systemPrompt,
    creativity: personalityTuning.creativity,
    activeEmotion: activeEmotion
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    let errorDetail = "";
    try {
      const errData = await response.json();
      errorDetail = errData.error || errData.message || JSON.stringify(errData);
    } catch (e) {
      try {
        errorDetail = await response.text();
      } catch (textErr) {
        errorDetail = response.statusText;
      }
    }
    throw new Error(errorDetail || `Erro ao chamar o proxy (/api/chat) na Vercel (${response.status})`);
  }

  const data = await response.json();
  if (!data.texto) throw new Error("Resposta vazia retornada pelo proxy da Vercel.");

  return {
    texto: data.texto,
    emocao: data.emocao || activeEmotion,
    reasoning: data.reasoning || ""
  };
}

