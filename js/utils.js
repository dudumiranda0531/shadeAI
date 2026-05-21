// ==========================================
// shadeAI - Módulo de Utilidades
// ==========================================

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function prepararParaBusca(texto) {
  return normalizarTexto(texto)
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function contemPalavraOuFrase(texto, palavra) {
  const textoPreparado = ` ${prepararParaBusca(texto)} `;
  const palavraPreparada = prepararParaBusca(palavra);
  if (!palavraPreparada) return false;
  return textoPreparado.includes(` ${palavraPreparada} `);
}

function escolherAleatorio(lista) {
  const indice = Math.floor(Math.random() * lista.length);
  return lista[indice];
}

// Função auxiliar para formatar tags HTML e markdown básico com segurança
function formatarMarkdownSeguro(texto) {
  if (!texto) return "";

  // 1. Escapa caracteres HTML perigosos para evitar injeção/XSS
  let html = texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Padroniza quebras de linha para \n
  html = html.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const lines = html.split("\n");
  const processedLines = lines.map(line => {
    const trimmed = line.trim();

    // 2. Formata cabeçalhos de markdown (###, ##, #) substituindo-os por divs estilizadas
    if (trimmed.startsWith("### ")) {
      const content = trimmed.substring(4).trim();
      return `<div class="chat-h3"><strong>${content}</strong></div>`;
    }
    if (trimmed.startsWith("## ")) {
      const content = trimmed.substring(3).trim();
      return `<div class="chat-h2"><strong>${content}</strong></div>`;
    }
    if (trimmed.startsWith("# ")) {
      const content = trimmed.substring(2).trim();
      return `<div class="chat-h1"><strong>${content}</strong></div>`;
    }

    // 3. Formata listas de marcadores (- ou *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2).trim();
      return `<div class="chat-li">• ${content}</div>`;
    }

    // 4. Formata listas numeradas (1., 2., etc.)
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numListMatch) {
      return `<div class="chat-li">${numListMatch[1]}. ${numListMatch[2]}</div>`;
    }

    // 5. Linhas horizontais (três ou mais traços) ---
    if (trimmed === "---") {
      return '<hr class="chat-hr">';
    }

    return line; // Retorna a linha original preservada
  });

  let result = processedLines.join("\n");

  // 6. Formata código inline `codigo`
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // 7. Negrito com asteriscos duplos **texto**
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 8. Itálico com asterisco simples *texto*
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  return result;
}
