// ==========================================
// shadeAI - Módulo de Controle do Mascote
// ==========================================

// Respostas de Teste de Emoção
const falasDeTeste = {
  neutro: "Estou operando de forma equilibrada e aguardando suas diretrizes. 😶",
  feliz: "Olá! É maravilhoso trabalhar com você hoje! Como posso iluminar seu dia? 😊",
  pensativo: "Interessante... Estou processando as variáveis de forma lógica e profunda. 🤔",
  confiante: "Eu consigo resolver qualquer desafio! Pode confiar, vamos fazer um ótimo trabalho juntos! 💪"
};

// Falas curtas predefinidas de reação do mascote baseadas no humor e status (online/offline)
const falasDeReacao = {
  neutro: [
    "Processamento concluído. Resposta enviada ao chat. 🖥️",
    "Aqui está a informação solicitada. 📋",
    "Sua resposta está pronta no painel ao lado. 👍",
    "Resposta gerada. Espero que ajude! 🖥️"
  ],
  feliz: [
    "Eba! Resposta prontinha para você no chat! Espero que adore! 😊",
    "Consegui! Dá uma olhada no chat, ficou bem legal! 🎉",
    "Prontinho! Respondido com muita alegria e entusiasmo! 😄",
    "Aqui está! Adorei te ajudar com essa pergunta! ✨"
  ],
  pensativo: [
    "Pensei bastante e elaborei essa resposta cuidadosa para você. 🤔",
    "Concluí minha análise profunda. Veja os detalhes no chat. 🧐",
    "Refleti bem e estruturei os pontos principais sobre o tema. 📝",
    "Aqui está uma resposta estruturada de forma bem analítica. 🧐"
  ],
  confiante: [
    "Pronto! Solução no gatilho. Dê uma olhada no chat, ficou sensacional! 💪",
    "Tenho certeza absoluta de que essa resposta vai te ajudar! Resolvido! ⚡",
    "Desafio aceito e respondido! Juntos somos imbatíveis! 🚀",
    "Sem mistérios! Essa resposta é tiro e queda. Confira no chat! 💪"
  ],
  offline: [
    "⚠️ Ops, estou sem conexão online! Respondi usando meus dados locais offline.",
    "⚠️ Conexão falhou! Respondi a partir do meu banco de dados interno local.",
    "⚠️ Sem internet! Puxei minha base de dados offline para te ajudar."
  ]
};

function obterFalaReacao(emocao, isOffline) {
  if (isOffline) {
    return escolherAleatorio(falasDeReacao.offline);
  }
  const lista = falasDeReacao[emocao] || falasDeReacao.neutro;
  return escolherAleatorio(lista);
}

function testarEmocao(emocao) {
  trocarMascote(emocao);
  const msg = falasDeTeste[emocao] || "Modo de expressão atualizado.";
  falaMascote.textContent = msg;
  falaMascote.scrollTop = 0;
  
  // Fala em voz se ativado (função definida no módulo de acessibilidade)
  if (typeof falarTexto === "function") {
    falarTexto(msg);
  }
}

// Troca o mascote na interface
function trocarMascote(emocao) {
  mascoteFallback.textContent = fallbackEmocoes[emocao] || "😶";
  mascoteStatus.textContent = nomesEmocoes[emocao] || "Shade está pronto";
  
  // Modifica a cor do brilho baseado na emoção
  const glow = document.querySelector(".mascote-glow");
  if (glow) {
    if (emocao === "feliz") glow.style.background = "radial-gradient(circle, #ff5e97 0%, transparent 70%)";
    else if (emocao === "pensativo") glow.style.background = "radial-gradient(circle, #f59e0b 0%, transparent 70%)";
    else if (emocao === "confiante") glow.style.background = "radial-gradient(circle, #10b981 0%, transparent 70%)";
    else glow.style.background = "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)";
  }

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
