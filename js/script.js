// ==========================================================================
// shadeAI - Controlador Principal e Inicialização do Aplicativo (JS Entrypoint)
// ==========================================================================

// ==========================================
// 1. COMPORTAMENTO DE ABAS
// ==========================================
function switchTab(tabId) {
  activeTab = tabId;
  
  // Atualiza botões
  tabButtons.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Atualiza painéis
  tabPanels.forEach(panel => {
    if (panel.id === `panel-${tabId}`) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const tabId = btn.getAttribute("data-tab");
    switchTab(tabId);
  });
});

// ==========================================
// 2. CONFIGURAÇÕES DE API & STORAGE
// ==========================================
function loadSettingsFromStorage() {
  // Carrega configurações gerais
  onlineMode = localStorage.getItem("onlineMode") === "true";
  switchOnlineMode.checked = onlineMode;
  providerSelectGroup.style.display = onlineMode ? "block" : "none";
  
  activeProvider = localStorage.getItem("activeProvider") || "openrouter";
  selectProvider.value = activeProvider;

  apiKeys.openrouter = localStorage.getItem("openrouterKey") || "";
  openrouterKeyInput.value = apiKeys.openrouter;

  apiKeys.gemini = localStorage.getItem("geminiKey") || "";
  geminiKeyInput.value = apiKeys.gemini;
  
  apiKeys.openai = localStorage.getItem("openaiKey") || "";
  openaiKeyInput.value = apiKeys.openai;
  
  const validOpenRouterModels = [
    "google/gemma-4-31b-it:free",
    "openrouter/owl-alpha",
    "poolside/laguna-xs.2:free",
    "nvidia/nemotron-3-super-120b-a12b:free",
    "openrouter/free"
  ];
  apiModels.openrouter = localStorage.getItem("openrouterModel") || "openrouter/free";
  if (!validOpenRouterModels.includes(apiModels.openrouter) || apiModels.openrouter === "google/gemma-4-31b-it:free") {
    apiModels.openrouter = "openrouter/free";
    localStorage.setItem("openrouterModel", apiModels.openrouter);
  }
  openrouterModelSelect.value = apiModels.openrouter;

  apiModels.gemini = localStorage.getItem("geminiModel") || "gemini-1.5-flash";
  geminiModelSelect.value = apiModels.gemini;
  
  apiModels.openai = localStorage.getItem("openaiModel") || "gpt-4o-mini";
  openaiModelSelect.value = apiModels.openai;

  // Carrega configurações de Personalidade
  activeEmotion = localStorage.getItem("activeEmotion") || "neutro";
  updatePersonalityUI(activeEmotion);
  
  personalityTuning.creativity = parseFloat(localStorage.getItem("creativity")) || 0.7;
  sliderCreativity.value = personalityTuning.creativity;
  valCreativity.textContent = personalityTuning.creativity;
  
  personalityTuning.emojiFreq = parseInt(localStorage.getItem("emojiFreq")) || 1;
  sliderEmojiFreq.value = personalityTuning.emojiFreq;
  updateSliderLabel("emojiFreq", personalityTuning.emojiFreq);

  personalityTuning.length = parseInt(localStorage.getItem("length")) || 1;
  sliderLength.value = personalityTuning.length;
  updateSliderLabel("length", personalityTuning.length);

  // Carrega configurações de Acessibilidade
  accessibilitySettings.ttsEnabled = localStorage.getItem("ttsEnabled") === "true";
  switchTTS.checked = accessibilitySettings.ttsEnabled;
  voiceSettingsSub.style.display = accessibilitySettings.ttsEnabled ? "flex" : "none";
  
  accessibilitySettings.ttsRate = parseFloat(localStorage.getItem("ttsRate")) || 1.0;
  ttsRateSlider.value = accessibilitySettings.ttsRate;
  valTtsRate.textContent = accessibilitySettings.ttsRate.toFixed(1) + "x";

  accessibilitySettings.ttsPitch = parseFloat(localStorage.getItem("ttsPitch")) || 1.0;
  ttsPitchSlider.value = accessibilitySettings.ttsPitch;
  valTtsPitch.textContent = accessibilitySettings.ttsPitch.toFixed(1);

  accessibilitySettings.highContrast = localStorage.getItem("highContrast") === "true";
  switchContrast.checked = accessibilitySettings.highContrast;
  applyContrastMode(accessibilitySettings.highContrast);

  accessibilitySettings.dyslexicFont = localStorage.getItem("dyslexicFont") === "true";
  switchDyslexic.checked = accessibilitySettings.dyslexicFont;
  applyDyslexicFont(accessibilitySettings.dyslexicFont);

  accessibilitySettings.vLibrasEnabled = localStorage.getItem("vLibrasEnabled") !== "false"; // Default true
  switchVLibras.checked = accessibilitySettings.vLibrasEnabled;
  applyVLibras(accessibilitySettings.vLibrasEnabled);

  accessibilitySettings.visualFocus = localStorage.getItem("visualFocus") === "true";
  switchVisualFocus.checked = accessibilitySettings.visualFocus;
  applyVisualFocus(accessibilitySettings.visualFocus);

  accessibilitySettings.fontScale = parseFloat(localStorage.getItem("fontScale")) || 1.0;
  sliderFontSize.value = accessibilitySettings.fontScale;
  applyFontScale(accessibilitySettings.fontScale);

  updateModelBadge();
}

function saveSettings() {
  try {
    localStorage.setItem("onlineMode", switchOnlineMode.checked);
    localStorage.setItem("activeProvider", selectProvider.value);
    localStorage.setItem("openrouterModel", openrouterModelSelect.value);
    localStorage.setItem("geminiModel", geminiModelSelect.value);
    localStorage.setItem("openaiModel", openaiModelSelect.value);
    
    // Salva as chaves de API com segurança no localStorage do usuário
    localStorage.setItem("openrouterKey", openrouterKeyInput.value.trim());
    localStorage.setItem("geminiKey", geminiKeyInput.value.trim());
    localStorage.setItem("openaiKey", openaiKeyInput.value.trim());

    // Atualiza o estado
    onlineMode = switchOnlineMode.checked;
    activeProvider = selectProvider.value;
    apiModels.openrouter = openrouterModelSelect.value;
    apiModels.gemini = geminiModelSelect.value;
    apiModels.openai = openaiModelSelect.value;
    
    apiKeys.openrouter = openrouterKeyInput.value.trim();
    apiKeys.gemini = geminiKeyInput.value.trim();
    apiKeys.openai = openaiKeyInput.value.trim();

    updateModelBadge();
    showSaveStatus("Configurações salvas com sucesso!", "success");
    
    // Pequena reação feliz do Shade
    trocarMascote("feliz");
    falaMascote.textContent = "Configurações salvas! Agora estou mais inteligente! 😊";
    falarTexto("Configurações salvas! Agora estou mais inteligente!");
  } catch (error) {
    showSaveStatus("Erro ao salvar configurações.", "error");
  }
}

function showSaveStatus(message, type) {
  saveStatusMsg.textContent = message;
  saveStatusMsg.className = `save-status-msg ${type}`;
  setTimeout(() => {
    saveStatusMsg.textContent = "";
  }, 4000);
}

function updateModelBadge() {
  if (onlineMode) {
    if (activeProvider === "openrouter" && apiKeys.openrouter) {
      activeModelText.textContent = `OpenRouter (${apiModels.openrouter.split('/').pop()})`;
      activeModelBadge.classList.add("online");
    } else if (activeProvider === "gemini" && apiKeys.gemini) {
      activeModelText.textContent = `Gemini (${apiModels.gemini})`;
      activeModelBadge.classList.add("online");
    } else if (activeProvider === "openai" && apiKeys.openai) {
      activeModelText.textContent = `OpenAI (${apiModels.openai})`;
      activeModelBadge.classList.add("online");
    } else {
      activeModelText.textContent = "Offline (Falta Chave)";
      activeModelBadge.classList.remove("online");
    }
  } else {
    activeModelText.textContent = "Motor Offline";
    activeModelBadge.classList.remove("online");
  }
}

// Mostrar/Ocultar chaves de senha
document.querySelectorAll(".btn-toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "🙈";
    } else {
      input.type = "password";
      btn.textContent = "👁️";
    }
  });
});

if (btnSaveSettings) {
  btnSaveSettings.addEventListener("click", saveSettings);
}

if (switchOnlineMode) {
  switchOnlineMode.addEventListener("change", (e) => {
    providerSelectGroup.style.display = e.target.checked ? "block" : "none";
    onlineMode = e.target.checked;
    updateModelBadge();
  });
}

if (selectProvider) {
  selectProvider.addEventListener("change", (e) => {
    activeProvider = e.target.value;
    updateModelBadge();
  });
}

// ==========================================
// 3. PERSONALIDADE DO MASCOTE (CONTROLES)
// ==========================================
function updatePersonalityUI(emotion) {
  personalityOptions.forEach(opt => {
    if (opt.getAttribute("data-emotion") === emotion) {
      opt.classList.add("active");
    } else {
      opt.classList.remove("active");
    }
  });
  activeEmotion = emotion;
  localStorage.setItem("activeEmotion", emotion);
}

function updateSliderLabel(sliderId, value) {
  if (sliderId === "emojiFreq") {
    const labels = ["Pouca", "Média", "Muita"];
    valEmojiFreq.textContent = labels[value];
  } else if (sliderId === "length") {
    const labels = ["Curta", "Moderada", "Longa"];
    valLength.textContent = labels[value];
  }
}

personalityOptions.forEach(opt => {
  opt.addEventListener("click", () => {
    const emotion = opt.getAttribute("data-emotion");
    updatePersonalityUI(emotion);
    testarEmocao(emotion);
  });
});

sliderCreativity.addEventListener("input", (e) => {
  const val = parseFloat(e.target.value);
  valCreativity.textContent = val;
  personalityTuning.creativity = val;
  localStorage.setItem("creativity", val);
});

sliderEmojiFreq.addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  updateSliderLabel("emojiFreq", val);
  personalityTuning.emojiFreq = val;
  localStorage.setItem("emojiFreq", val);
});

sliderLength.addEventListener("input", (e) => {
  const val = parseInt(e.target.value);
  updateSliderLabel("length", val);
  personalityTuning.length = val;
  localStorage.setItem("length", val);
});

// ==========================================
// 4. INTERAÇÃO E ENVIO DE MENSAGENS
// ==========================================

// Adiciona mensagens à interface gráfica do chat com suporte a PDF e raciocínio
function adicionarMensagemChat(texto, remetente, pdfName = null, reasoning = null) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${remetente}`;

  const metaDiv = document.createElement("div");
  metaDiv.className = "msg-meta";
  const agora = new Date();
  const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  metaDiv.textContent = remetente === "user" ? `Você • ${hora}` : `Shade • ${hora}`;

  const contentDiv = document.createElement("div");
  contentDiv.className = "msg-content";

  // 1. Renderiza o raciocínio se houver (acima da resposta final)
  if (reasoning) {
    const details = document.createElement("details");
    details.className = "reasoning-details";
    
    const summary = document.createElement("summary");
    summary.className = "reasoning-summary";
    summary.textContent = "Raciocínio do Shade";
    
    const content = document.createElement("div");
    content.className = "reasoning-content";
    content.textContent = reasoning;
    
    details.appendChild(summary);
    details.appendChild(content);
    contentDiv.appendChild(details);
  }

  // 2. Renderiza o corpo principal do texto
  const textDiv = document.createElement("div");
  textDiv.className = "chat-text-body";
  
  if (texto.includes("```")) {
    const parts = texto.split("```");
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 1) {
        // Bloco de código
        const codeBlock = document.createElement("pre");
        const code = document.createElement("code");
        
        // Remove a primeira linha identificando a linguagem se houver
        const lines = parts[i].split("\n");
        if (lines[0].match(/^[a-zA-Z0-9_-]+$/)) {
          lines.shift();
        }
        
        code.textContent = lines.join("\n").trim();
        codeBlock.appendChild(code);
        textDiv.appendChild(codeBlock);
      } else {
        // Texto normal
        if (parts[i].trim()) {
          const textSpan = document.createElement("div");
          textSpan.className = "chat-text-paragraph";
          textSpan.innerHTML = formatarMarkdownSeguro(parts[i]);
          textDiv.appendChild(textSpan);
        }
      }
    }
  } else {
    textDiv.innerHTML = formatarMarkdownSeguro(texto);
  }
  contentDiv.appendChild(textDiv);

  // 3. Renderiza o anexo de PDF se houver
  if (pdfName) {
    const attDiv = document.createElement("div");
    attDiv.className = "chat-pdf-attachment";
    attDiv.innerHTML = `
      <svg class="chat-pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      <span class="chat-pdf-name">${pdfName}</span>
    `;
    contentDiv.appendChild(attDiv);
  }

  msgDiv.appendChild(metaDiv);
  msgDiv.appendChild(contentDiv);
  chatContainer.appendChild(msgDiv);

  // Scroll automático suave para o final
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });
}

// Envia a pergunta principal do input
async function enviarPergunta() {
  const pergunta = perguntaInput.value.trim();
  if (!pergunta) return;

  // Captura o PDF atual antes de resetar o input
  const tempPdfText = uploadedPdfText;
  const tempPdfName = uploadedPdfName;

  // 1. Renderiza no chat do usuário com o anexo se existir
  adicionarMensagemChat(pergunta, "user", tempPdfName);
  perguntaInput.value = "";
  
  // Limpa o estado visual do PDF imediatamente
  resetarPdfState();
  
  // 2. Coloca o mascote em modo pensativo enquanto processa
  trocarMascote("pensativo");
  falaMascote.textContent = "Pensando em uma resposta apropriada... 🤔";
  
  // Configura indicador de digitação com etapas dinâmicas de raciocínio
  const stages = tempPdfText ? [
    "📄 Lendo documento anexo...",
    "🔍 Cruzando dados do PDF...",
    "💡 Sintetizando resposta..."
  ] : [
    "🧠 Processando histórico...",
    "🔍 Estruturando o raciocínio...",
    "✍️ Escrevendo resposta final..."
  ];

  let currentStageIndex = 0;
  function updateTypingIndicator() {
    typingIndicator.innerHTML = `
      <div class="typing-spinner"></div>
      <span class="typing-indicator-text">${stages[currentStageIndex]}</span>
    `;
    currentStageIndex = (currentStageIndex + 1) % stages.length;
  }

  updateTypingIndicator();
  typingIndicator.style.display = "flex";
  
  const typingTimer = setInterval(updateTypingIndicator, 1500);
  
  // Auto scroll para o indicador de digitação
  chatContainer.scrollTo({
    top: chatContainer.scrollHeight,
    behavior: "smooth"
  });

  let respostaFinal = null;

  try {
    // 3. Verifica o fluxo de inteligência (Online vs Offline)
    if (onlineMode) {
      if (activeProvider === "openrouter" && apiKeys.openrouter) {
        respostaFinal = await chamarOpenRouter(pergunta, tempPdfText, tempPdfName);
      } else if (activeProvider === "gemini" && apiKeys.gemini) {
        respostaFinal = await chamarGemini(pergunta, tempPdfText, tempPdfName);
      } else if (activeProvider === "openai" && apiKeys.openai) {
        respostaFinal = await chamarOpenAI(pergunta, tempPdfText, tempPdfName);
      } else {
        // Fallback se estiver online mas sem a chave correspondente
        await new Promise(resolve => setTimeout(resolve, 800));
        respostaFinal = obterRespostaOffline(pergunta);
        respostaFinal.isOffline = true;
      }
    } else {
      // Execução Offline
      await new Promise(resolve => setTimeout(resolve, 800)); // Simula latência natural
      respostaFinal = obterRespostaOffline(pergunta);
      respostaFinal.isOffline = true;
    }
  } catch (error) {
    console.error(error); // Mantém o erro técnico apenas no console do desenvolvedor para depuração
    
    let offlineResp = obterRespostaOffline(pergunta);
    
    let textoResposta = `⚠️ **Conexão Offline (Serviço temporariamente indisponível)**\n\n` +
                        `Não foi possível obter uma resposta do provedor de IA online. Estou respondendo temporariamente a partir do meu banco de dados offline local.\n\n` +
                        `💡 *Dica: Verifique se suas chaves de API estão salvas corretamente na aba de Configurações (⚙️), aguarde alguns segundos ou mude o modelo/provedor.*\n\n` +
                        `--- \n\n` +
                        `${offlineResp.texto}`;

    respostaFinal = {
      texto: textoResposta,
      textoFalar: `Não foi possível conectar ao servidor. Respondendo offline: ${offlineResp.texto}`,
      emocao: "pensativo",
      isOffline: true
    };
  } finally {
    // 4. Remove indicador de digitação e limpa o timer
    clearInterval(typingTimer);
    typingIndicator.style.display = "none";
    typingIndicator.innerHTML = `
      <span></span>
      <span></span>
      <span></span>
    `;
  }

  // 5. Exibe a resposta do Shade com raciocínio se disponível
  adicionarMensagemChat(respostaFinal.texto, "bot", null, respostaFinal.reasoning);
  
  // Define uma reação curta predefinida para o balão do mascote
  const reacaoMascote = obterFalaReacao(respostaFinal.emocao, respostaFinal.isOffline);
  falaMascote.innerHTML = formatarMarkdownSeguro(reacaoMascote);
  falaMascote.scrollTop = 0;
  
  // 6. Atualiza o mascote e fala a resposta
  trocarMascote(respostaFinal.emocao);
  falarTexto(respostaFinal.textoFalar || respostaFinal.texto);

  // 7. Salva no histórico local
  chatHistory.push({ sender: "user", text: pergunta, pdfText: tempPdfText, pdfName: tempPdfName });
  chatHistory.push({ sender: "bot", text: respostaFinal.texto, reasoning: respostaFinal.reasoning });
}

// Event Listeners de Envio
if (btnEnviar) {
  btnEnviar.addEventListener("click", enviarPergunta);
}

if (perguntaInput) {
  perguntaInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      enviarPergunta();
    }
  });
}

// ==========================================
// TRATAMENTO DE UPLOAD E LEITURA DE PDF
// ==========================================

// Aciona o input de arquivo oculto ao clicar no botão de clipe de papel
if (btnUploadPdf && pdfInput) {
  btnUploadPdf.addEventListener("click", () => {
    pdfInput.click();
  });
}

// Reseta o estado do PDF carregado e limpa a UI
function resetarPdfState() {
  if (pdfInput) pdfInput.value = "";
  uploadedPdfText = "";
  uploadedPdfName = "";
  if (pdfBadgeContainer) pdfBadgeContainer.style.display = "none";
  if (btnUploadPdf) btnUploadPdf.classList.remove("active");
}

// Ao clicar no botão de fechar (x) do badge do PDF
if (btnRemovePdf) {
  btnRemovePdf.addEventListener("click", () => {
    resetarPdfState();
    trocarMascote("feliz");
    falaMascote.textContent = "Documento PDF removido. De volta à conversa geral! 😊";
    falarTexto("Documento removido.");
  });
}

// Escuta a seleção de arquivo PDF no input
if (pdfInput) {
  pdfInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      trocarMascote("pensativo");
      falaMascote.textContent = "Por favor, selecione apenas arquivos em formato PDF! ⚠️";
      falarTexto("Por favor, selecione apenas arquivos em formato PDF!");
      resetarPdfState();
      return;
    }

    // Define estado visual de carregamento
    trocarMascote("pensativo");
    falaMascote.textContent = "Lendo o PDF... Extraindo o texto 📄";
    falarTexto("Lendo o PDF... Extraindo o texto");

    const reader = new FileReader();
    reader.onload = async function () {
      try {
        const arrayBuffer = this.result;

        // Configura o worker do PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let textTemp = "";
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          textTemp += `[Página ${pageNum}]\n${pageText}\n\n`;
        }

        if (!textTemp.trim()) {
          throw new Error("Não foi possível extrair nenhum texto legível. O arquivo pode ser composto apenas por imagens digitalizadas ou estar protegido.");
        }

        // Salva nos estados globais
        uploadedPdfText = textTemp;
        uploadedPdfName = file.name;

        // Atualiza a UI
        if (pdfName) pdfName.textContent = file.name;
        if (pdfBadgeContainer) pdfBadgeContainer.style.display = "flex";
        if (btnUploadPdf) btnUploadPdf.classList.add("active");

        // Mascote reage positivamente
        trocarMascote("feliz");
        falaMascote.textContent = `PDF "${file.name}" carregado com sucesso! Agora você pode fazer perguntas sobre ele. 😊`;
        falarTexto("PDF carregado com sucesso! Agora você pode fazer perguntas sobre ele.");
      } catch (error) {
        console.error("Erro ao ler o PDF:", error);
        trocarMascote("pensativo");
        falaMascote.textContent = `Erro ao ler PDF: ${error.message || error} ⚠️`;
        falarTexto("Erro ao ler PDF.");
        resetarPdfState();
      }
    };

    reader.onerror = function () {
      trocarMascote("pensativo");
      falaMascote.textContent = "Erro de leitura do arquivo local. Tente novamente! ⚠️";
      falarTexto("Erro de leitura do arquivo.");
      resetarPdfState();
    };

    reader.readAsArrayBuffer(file);
  });
}

// Carrega as chaves de API a partir de env.json caso estejam disponíveis e acessíveis
async function carregarChavesDoEnv() {
  // Nota: Não lemos .env no lado do cliente pois servidores web estáticos bloqueiam arquivos dotfile por padrão,
  // resultando em erros 404 (Not Found) no console. Em vez disso, usamos env.json.
  try {
    const jsonResponse = await fetch("env.json");
    if (jsonResponse.ok) {
      const data = await jsonResponse.json();
      let keyFound = false;
      if (data.OPENROUTER_API_KEY) {
        apiKeys.openrouter = data.OPENROUTER_API_KEY.trim();
        if (openrouterKeyInput) openrouterKeyInput.value = apiKeys.openrouter;
        keyFound = true;
      }
      if (data.GEMINI_API_KEY) {
        apiKeys.gemini = data.GEMINI_API_KEY.trim();
        if (geminiKeyInput) geminiKeyInput.value = apiKeys.gemini;
        keyFound = true;
      }
      if (data.OPENAI_API_KEY) {
        apiKeys.openai = data.OPENAI_API_KEY.trim();
        if (openaiKeyInput) openaiKeyInput.value = apiKeys.openai;
        keyFound = true;
      }
      if (keyFound) {
        updateModelBadge();
      }
    }
  } catch (err) {
    console.log("Não foi possível carregar env.json (CORS ou inexistente).");
  }
}

// ==========================================
// 5. INICIALIZAÇÃO GERAL DO APP
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  loadSettingsFromStorage();
  await carregarChavesDoEnv();
  
  // Reações iniciais do mascote
  setTimeout(() => {
    trocarMascote(activeEmotion);
  }, 100);
});