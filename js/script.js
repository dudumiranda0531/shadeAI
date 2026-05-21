const chat = document.getElementById("chat");
const perguntaInput = document.getElementById("pergunta");
const btnEnviar = document.getElementById("btnEnviar");
const falaMascote = document.getElementById("falaMascote");
const mascoteImg = document.getElementById("mascote");
const mascoteFallback = document.getElementById("mascoteFallback");

// Memória simples da sessão
let memoria = [];

// Caminhos das imagens do mascote
// Pode deixar sem imagem por enquanto.
// Amanhã, coloque os arquivos dentro da pasta assets/img.
const imagensMascote = {
  feliz: "./assets/img/feliz.png",
  pensativo: "./assets/img/pensativo.png",
  confiante: "./assets/img/confiante.png",
  neutro: "./assets/img/neutro.png"
};

// Emojis usados enquanto as imagens ainda não existem
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
      "Oi! 👋",
      "Olá! Como vai?",
      "Eae! 😎"
    ]
  },
  {
    palavras: ["tudo bem", "como voce esta", "como você está", "como vai"],
    emocao: "feliz",
    respostas: [
      "Estou ótimo! 😁",
      "Tudo bem por aqui!",
      "Animado para te ajudar!"
    ]
  },
  {
    palavras: ["ajuda", "me ajuda", "preciso de ajuda", "socorro"],
    emocao: "confiante",
    respostas: [
      "Claro! Me conta mais!",
      "Vou te ajudar! 💪",
      "Deixa comigo!"
    ]
  },
  {
    palavras: ["tchau", "adeus", "até mais", "ate mais", "falou"],
    emocao: "neutro",
    respostas: [
      "Tchau! 👋",
      "Até mais!",
      "Nos vemos em breve!"
    ]
  },
  {
    palavras: [],
    emocao: "pensativo",
    respostas: [
      "Interessante... 🤔",
      "Hmm, deixa eu pensar...",
      "Boa pergunta! 😎",
      "Não sei exatamente, mas podemos descobrir juntos!"
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
  }, 800);
}

// Clique no botão
btnEnviar.addEventListener("click", enviarPergunta);

// Enter no teclado
perguntaInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    enviarPergunta();
  }
});

// Estado inicial
trocarMascote("feliz");