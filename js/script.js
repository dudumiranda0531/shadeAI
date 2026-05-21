const chat = document.getElementById("chat");
const perguntaInput = document.getElementById("pergunta");
const btnEnviar = document.getElementById("btnEnviar");
const falaMascote = document.getElementById("falaMascote");
const mascoteImg = document.getElementById("mascote");
const mascoteFallback = document.getElementById("mascoteFallback");

// Memória simples da sessão
let memoria = [];

// Caminhos das imagens do mascote (corrigido para a pasta img/ real)
const imagensMascote = {
  feliz: "img/feliz.png",
  pensativo: "img/pensativo.png",
  confiante: "img/confiante.png",
  neutro: "img/neutro.png"
};

// Emojis usados enquanto as imagens ainda não existem ou falham
const fallbackEmocoes = {
  feliz: "😊",
  pensativo: "🤔",
  confiante: "💪",
  neutro: "😶"
};

// Lista de respostas baseadas em palavras-chave
const respostas = [
  {
    palavras: ["oi", "ola", "olá", "eae", "e aí", "bom dia", "boa tarde", "boa noite"],
    emocao: "feliz",
    respostas: [
      "Oi! 👋 Como vai?",
      "Olá! Como posso ajudar você hoje? 😊",
      "Eae! Pronto para conversar? 😎"
    ]
  },
  {
    palavras: ["tudo bem", "como voce esta", "como você está", "como vai"],
    emocao: "feliz",
    respostas: [
      "Estou ótimo! 😁 E com você?",
      "Tudo bem por aqui, obrigado por perguntar! E com você?",
      "Muito animado e pronto para te ajudar! E com você?"
    ]
  },
  {
    palavras: ["ajuda", "me ajuda", "preciso de ajuda", "socorro", "problema"],
    emocao: "confiante",
    respostas: [
      "Claro! Me conta mais sobre o que precisa!",
      "Vou te ajudar com certeza! 💪 O que está acontecendo?",
      "Deixa comigo, vamos resolver isso juntos!"
    ]
  },
  {
    palavras: ["tchau", "adeus", "até mais", "ate mais", "falou", "obrigado", "obrigada"],
    emocao: "feliz",
    respostas: [
      "Tchau! 👋 Qualquer coisa estarei por aqui.",
      "Até mais! Tenha um ótimo dia! 😊",
      "De nada! Nos vemos em breve!"
    ]
  },
  {
    palavras: [],
    emocao: "pensativo",
    respostas: [
      "Interessante... me conta mais sobre isso. 🤔",
      "Hmm, deixa eu pensar um pouco...",
      "Boa pergunta! Deixe-me refletir.",
      "Não sei exatamente, mas podemos pesquisar juntos!"
    ]
  }
];

// Remove acentos e deixa tudo minúsculo
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Prepara o texto para comparação
function prepararParaBusca(texto) {
  return normalizarTexto(texto)
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Verifica se a palavra ou frase existe na pergunta
function contemPalavraOuFrase(texto, palavra) {
  const textoPreparado = ` ${prepararParaBusca(texto)} `;
  const palavraPreparada = prepararParaBusca(palavra);

  if (!palavraPreparada) return false;

  return textoPreparado.includes(` ${palavraPreparada} `);
}

// Escolhe uma resposta aleatória dentro de uma lista
function escolherAleatorio(lista) {
  const indice = Math.floor(Math.random() * lista.length);
  return lista[indice];
}

// Gera resposta com base na pergunta
function gerarResposta(pergunta) {
  for (let item of respostas) {
    for (let palavra of item.palavras) {
      if (contemPalavraOuFrase(pergunta, palavra)) {
        return {
          texto: escolherAleatorio(item.respostas),
          emocao: item.emocao
        };
      }
    }
  }

  const respostaPadrao = respostas.find(item => item.palavras.length === 0);

  return {
    texto: escolherAleatorio(respostaPadrao.respostas),
    emocao: respostaPadrao.emocao
  };
}

// Adiciona mensagem no chat
function adicionarMensagem(texto, classe) {
  const div = document.createElement("div");

  div.classList.add("msg", classe);
  div.textContent = texto;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// Troca o mascote pela imagem, se existir.
// Se não existir, mostra o emoji provisório.
function trocarMascote(emocao) {
  mascoteFallback.textContent = fallbackEmocoes[emocao] || "😶";

  mascoteImg.onload = function () {
    mascoteImg.style.display = "block";
    mascoteFallback.style.display = "none";
  };

  mascoteImg.onerror = function () {
    mascoteImg.style.display = "none";
    mascoteFallback.style.display = "flex";
  };

  mascoteImg.src = imagensMascote[emocao];
}

// Envia a pergunta
function enviarPergunta() {
  const pergunta = perguntaInput.value.trim();

  if (!pergunta) return;

  adicionarMensagem(pergunta, "user");

  perguntaInput.value = "";
  perguntaInput.focus();

  falaMascote.textContent = "Pensando... 🤔";
  trocarMascote("pensativo");

  setTimeout(() => {
    const respostaGerada = gerarResposta(pergunta);

    memoria.push({
      pergunta: pergunta,
      resposta: respostaGerada.texto
    });

    adicionarMensagem(respostaGerada.texto, "bot");

    falaMascote.textContent = respostaGerada.texto;
    trocarMascote(respostaGerada.emocao);
    
    // Fala o texto se o leitor estiver ativo
    falarTexto(respostaGerada.texto);
  }, 800);
}

// Clique no botão
if (btnEnviar) {
  btnEnviar.addEventListener("click", enviarPergunta);
}

// Enter no teclado
if (perguntaInput) {
  perguntaInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      enviarPergunta();
    }
  });
}

// ==========================================
// RECURSOS DE ACESSIBILIDADE
// ==========================================

// 1. Controle de Tamanho de Fonte (A+, A-, A)
let fontScale = parseFloat(localStorage.getItem('fontScale')) || 1.0;

function applyFontScale() {
  document.documentElement.style.setProperty('--font-scale', fontScale);
  localStorage.setItem('fontScale', fontScale);
}

document.getElementById('btn-font-inc').addEventListener('click', () => {
  if (fontScale < 1.6) {
    fontScale += 0.1;
    applyFontScale();
  }
});

document.getElementById('btn-font-dec').addEventListener('click', () => {
  if (fontScale > 0.8) {
    fontScale -= 0.1;
    applyFontScale();
  }
});

document.getElementById('btn-font-normal').addEventListener('click', () => {
  fontScale = 1.0;
  applyFontScale();
});

// 2. Alto Contraste (Contrast Toggle)
let highContrast = localStorage.getItem('highContrast') === 'true';
const btnContrast = document.getElementById('btn-contrast');

function applyContrast() {
  if (highContrast) {
    document.body.classList.add('high-contrast');
    btnContrast.classList.add('active');
  } else {
    document.body.classList.remove('high-contrast');
    btnContrast.classList.remove('active');
  }
  localStorage.setItem('highContrast', highContrast);
}

if (btnContrast) {
  btnContrast.addEventListener('click', () => {
    highContrast = !highContrast;
    applyContrast();
  });
}

// 3. Leitor de Texto por Voz (Text-to-Speech)
let ttsActive = localStorage.getItem('ttsActive') === 'true';
const btnTts = document.getElementById('btn-tts');

function applyTtsState() {
  if (ttsActive) {
    btnTts.classList.add('active');
  } else {
    btnTts.classList.remove('active');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
  localStorage.setItem('ttsActive', ttsActive);
}

function falarTexto(texto) {
  if (!ttsActive || !('speechSynthesis' in window)) return;
  
  window.speechSynthesis.cancel();
  
  // Limpa o texto de qualquer prefixo antes de falar
  const cleanText = texto.replace(/^Shade:\s*/i, '').replace(/^Você:\s*/i, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'pt-BR';
  
  const voices = window.speechSynthesis.getVoices();
  const ptVoice = voices.find(voice => voice.lang.includes('pt-BR') || voice.lang.includes('pt_BR'));
  if (ptVoice) {
    utterance.voice = ptVoice;
  }
  
  window.speechSynthesis.speak(utterance);
}

if (btnTts) {
  btnTts.addEventListener('click', () => {
    ttsActive = !ttsActive;
    applyTtsState();
  });
}

// Carrega as vozes para garantir compatibilidade
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// 4. Teste de Emoções (Botões de Teste)
const mensagensTeste = {
  feliz: "Estou feliz em te ajudar!",
  pensativo: "Hmm... deixa eu pensar um pouco.",
  confiante: "Pode deixar comigo. Eu consigo ajudar!",
  neutro: "Estou te ouvindo."
};

function testarEmocao(emocao) {
  trocarMascote(emocao);
  const msg = mensagensTeste[emocao] || "Estou pronto.";
  falaMascote.textContent = msg;
  falarTexto(msg);
}

// Torna global para uso com onclick dos botões HTML
window.testarEmocao = testarEmocao;

// Inicialização do Estado
trocarMascote("neutro");
applyFontScale();
applyContrast();
applyTtsState();