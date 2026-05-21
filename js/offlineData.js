// ==========================================
// shadeAI - Módulo de Banco de Dados Offline
// ==========================================

// Lista de respostas baseadas em palavras-chave para o Modo Offline
const respostasOffline = [
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
    palavras: ["quem e voce", "quem é você", "o que voce faz", "o que você faz", "shade"],
    emocao: "confiante",
    respostas: [
      "Eu sou o Shade, seu mascote e assistente IA pessoal. Fui desenvolvido para te ajudar a programar, criar e muito mais!",
      "Sou o Shade! Um chatbot adaptável com suporte a acessibilidade avançada e controle de emoções."
    ]
  },
  {
    palavras: ["cybersecurity", "cibersegurança", "segurança", "seguranca", "hacker", "invasao", "invasão", "virus", "vírus", "malware", "senha", "criptografia", "phishing", "firewall", "vulnerabilidade", "ataque", "ransomware", "trojan", "antivirus"],
    emocao: "confiante",
    respostas: [
      "Como especialista em cibersegurança, recomendo sempre usar senhas fortes, autenticação de dois fatores (MFA) e manter seus sistemas atualizados! 🛡️ Como posso ajudar na sua segurança hoje?",
      "Segurança digital é prioridade! Evite clicar em links suspeitos e sempre verifique o remetente de e-mails para evitar Phishing. Quer aprender mais sobre algum conceito de segurança? 🔒",
      "No modo offline, minhas ferramentas são limitadas, mas lembre-se: nunca compartilhe suas chaves de API ou dados confidenciais! Mantenha seu firewall ativo. O que mais gostaria de saber? 💻"
    ]
  },
  {
    palavras: [], // Resposta padrão
    emocao: "pensativo",
    respostas: [
      "Interessante... me conta mais sobre isso. 🤔",
      "Hmm, deixa eu pensar um pouco...",
      "Boa pergunta! Deixe-me refletir.",
      "Como estou no modo offline, meu vocabulário é limitado. Experimente configurar uma chave de API nas Integrações! 🌐"
    ]
  }
];

// Resposta offline com alteração de tom baseada na personalidade do usuário
function obterRespostaOffline(pergunta) {
  let resultado = null;
  
  for (let item of respostasOffline) {
    for (let palavra of item.palavras) {
      if (contemPalavraOuFrase(pergunta, palavra)) {
        resultado = {
          texto: escolherAleatorio(item.respostas),
          emocao: item.emocao
        };
        break;
      }
    }
    if (resultado) break;
  }

  if (!resultado) {
    const respostaPadrao = respostasOffline.find(item => item.palavras.length === 0);
    resultado = {
      texto: escolherAleatorio(respostaPadrao.respostas),
      emocao: respostaPadrao.emocao
    };
  }

  // Modifica a resposta e a emoção com base na personalidade ativa selecionada pelo usuário
  if (activeEmotion === "feliz") {
    resultado.texto = `Eba! 😊 ${resultado.texto} 🎉`;
    resultado.emocao = "feliz";
  } else if (activeEmotion === "pensativo") {
    resultado.texto = `Hmm, refletindo... ${resultado.texto} 🤔`;
    resultado.emocao = "pensativo";
  } else if (activeEmotion === "confiante") {
    resultado.texto = `Com certeza! 💪 ${resultado.texto} Vai dar super certo!`;
    resultado.emocao = "confiante";
  }

  return resultado;
}
