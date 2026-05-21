// ==========================================
// shadeAI - Módulo de Acessibilidade (PCD)
// ==========================================

// --- Controles de Fonte ---
function applyFontScale(scale) {
  document.documentElement.style.setProperty("--font-scale", scale);
  sliderFontSize.value = scale;
  localStorage.setItem("fontScale", scale);
}

if (btnFontInc) {
  btnFontInc.addEventListener("click", () => {
    let scale = parseFloat(sliderFontSize.value);
    if (scale < 1.6) {
      scale = Math.min(1.6, scale + 0.1);
      applyFontScale(scale);
    }
  });
}

if (btnFontDec) {
  btnFontDec.addEventListener("click", () => {
    let scale = parseFloat(sliderFontSize.value);
    if (scale > 0.8) {
      scale = Math.max(0.8, scale - 0.1);
      applyFontScale(scale);
    }
  });
}

if (btnFontNormal) {
  btnFontNormal.addEventListener("click", () => {
    applyFontScale(1.0);
  });
}

if (sliderFontSize) {
  sliderFontSize.addEventListener("input", (e) => {
    applyFontScale(parseFloat(e.target.value));
  });
}

// --- Alto Contraste ---
function applyContrastMode(active) {
  if (active) {
    document.body.classList.add("high-contrast");
  } else {
    document.body.classList.remove("high-contrast");
  }
  localStorage.setItem("highContrast", active);
}

if (switchContrast) {
  switchContrast.addEventListener("change", (e) => {
    applyContrastMode(e.target.checked);
  });
}

// --- Fonte Dislexia ---
function applyDyslexicFont(active) {
  if (active) {
    document.body.classList.add("dyslexic-font");
  } else {
    document.body.classList.remove("dyslexic-font");
  }
  localStorage.setItem("dyslexicFont", active);
}

if (switchDyslexic) {
  switchDyslexic.addEventListener("change", (e) => {
    applyDyslexicFont(e.target.checked);
  });
}

// --- VLibras ---
function applyVLibras(active) {
  const container = document.getElementById("vlibrasContainer");
  if (container) {
    container.style.display = active ? "block" : "none";
  }
  localStorage.setItem("vLibrasEnabled", active);
}

if (switchVLibras) {
  switchVLibras.addEventListener("change", (e) => {
    applyVLibras(e.target.checked);
  });
}

// --- Destaque de Foco Visual ---
function applyVisualFocus(active) {
  if (active) {
    document.body.classList.add("visual-focus-highlight");
  } else {
    document.body.classList.remove("visual-focus-highlight");
  }
  localStorage.setItem("visualFocus", active);
}

if (switchVisualFocus) {
  switchVisualFocus.addEventListener("change", (e) => {
    applyVisualFocus(e.target.checked);
  });
}

// --- Leitor de Tela & TTS (Text-to-Speech) ---
function loadVoices() {
  if (!("speechSynthesis" in window)) return;
  
  const voices = window.speechSynthesis.getVoices();
  ttsVoiceSelect.innerHTML = "";
  
  // Filtra vozes em português
  const ptVoices = voices.filter(voice => voice.lang.includes("pt"));
  const otherVoices = voices.filter(voice => !voice.lang.includes("pt"));
  
  const allSortedVoices = [...ptVoices, ...otherVoices];
  
  allSortedVoices.forEach(voice => {
    const option = document.createElement("option");
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    
    // Tenta selecionar português automaticamente se não houver voz salva
    const savedVoice = localStorage.getItem("ttsVoice");
    if (savedVoice === voice.name) {
      option.selected = true;
    } else if (!savedVoice && voice.lang.includes("pt-BR")) {
      option.selected = true;
    }
    
    ttsVoiceSelect.appendChild(option);
  });
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
  // Dispara carregamento imediato
  setTimeout(loadVoices, 500);
}

if (switchTTS) {
  switchTTS.addEventListener("change", (e) => {
    const active = e.target.checked;
    accessibilitySettings.ttsEnabled = active;
    voiceSettingsSub.style.display = active ? "flex" : "none";
    localStorage.setItem("ttsEnabled", active);
    
    if (!active && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  });
}

if (ttsRateSlider) {
  ttsRateSlider.addEventListener("input", (e) => {
    const rate = parseFloat(e.target.value);
    valTtsRate.textContent = rate.toFixed(1) + "x";
    localStorage.setItem("ttsRate", rate);
  });
}

if (ttsPitchSlider) {
  ttsPitchSlider.addEventListener("input", (e) => {
    const pitch = parseFloat(e.target.value);
    valTtsPitch.textContent = pitch.toFixed(1);
    localStorage.setItem("ttsPitch", pitch);
  });
}

if (ttsVoiceSelect) {
  ttsVoiceSelect.addEventListener("change", (e) => {
    localStorage.setItem("ttsVoice", e.target.value);
  });
}

function falarTexto(texto) {
  if (!accessibilitySettings.ttsEnabled || !("speechSynthesis" in window)) return;
  
  window.speechSynthesis.cancel();
  
  let cleanText = texto.replace(/^Shade:\s*/i, '').replace(/^Você:\s*/i, '');
  // Limpa marcações de formatação markdown para que a síntese de voz não as leia de forma truncada
  cleanText = cleanText
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/---/g, " ");
    
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "pt-BR";
  
  // Carrega configurações
  const rate = parseFloat(ttsRateSlider.value);
  const pitch = parseFloat(ttsPitchSlider.value);
  utterance.rate = rate;
  utterance.pitch = pitch;
  
  const voices = window.speechSynthesis.getVoices();
  const selectedVoiceName = ttsVoiceSelect.value;
  if (selectedVoiceName) {
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) utterance.voice = voice;
  }
  
  window.speechSynthesis.speak(utterance);
}

// --- Teclado Virtual Acessível ---
const layoutTeclado = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç"],
  ["Z", "X", "C", "V", "B", "N", "M", ",", ".", "?"],
  ["Backsp", "Espaço", "Limpar"]
];

function generateVirtualKeyboard() {
  virtualKeyboard.innerHTML = "";
  layoutTeclado.forEach(row => {
    row.forEach(key => {
      const btn = document.createElement("button");
      btn.className = "keyboard-key";
      btn.textContent = key;
      btn.type = "button";
      
      if (key === "Backsp") {
        btn.classList.add("wide");
        btn.innerHTML = "⌫";
      } else if (key === "Limpar") {
        btn.classList.add("wide");
        btn.innerHTML = "Limpar";
      } else if (key === "Espaço") {
        btn.classList.add("space");
        btn.innerHTML = "Espaço";
      }
      
      btn.addEventListener("click", () => handleVirtualKeyPress(key));
      virtualKeyboard.appendChild(btn);
    });
  });
}

function handleVirtualKeyPress(key) {
  if (key === "Backsp") {
    perguntaInput.value = perguntaInput.value.slice(0, -1);
  } else if (key === "Limpar") {
    perguntaInput.value = "";
  } else if (key === "Espaço") {
    perguntaInput.value += " ";
  } else {
    perguntaInput.value += key;
  }
  perguntaInput.focus();
}

function toggleVirtualKeyboard() {
  const visible = virtualKeyboard.style.display === "grid";
  if (visible) {
    virtualKeyboard.style.display = "none";
    btnVirtualKeyboardToggle.classList.remove("active");
  } else {
    virtualKeyboard.style.display = "grid";
    btnVirtualKeyboardToggle.classList.add("active");
    generateVirtualKeyboard();
  }
}

if (btnVirtualKeyboardToggle) {
  btnVirtualKeyboardToggle.addEventListener("click", toggleVirtualKeyboard);
}
