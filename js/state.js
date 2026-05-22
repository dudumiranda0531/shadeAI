// ==========================================
// shadeAI - Módulo de Estado e Elementos DOM
// ==========================================

// Elementos do DOM - Chat e Interface
const chatContainer = document.getElementById("chat");
const perguntaInput = document.getElementById("pergunta");
const btnEnviar = document.getElementById("btnEnviar");
const falaMascote = document.getElementById("falaMascote");
const mascoteImg = document.getElementById("mascote");
const mascoteFallback = document.getElementById("mascoteFallback");
const mascoteStatus = document.getElementById("mascoteStatus");
const typingIndicator = document.getElementById("typingIndicator");
const activeModelText = document.getElementById("activeModelText");
const activeModelBadge = document.getElementById("activeModelBadge");

// Elementos do DOM - Abas
const tabButtons = document.querySelectorAll(".nav-tab");
const tabPanels = document.querySelectorAll(".tab-panel");

// Elementos do DOM - Configurações de API
const switchOnlineMode = document.getElementById("switchOnlineMode");
const selectProvider = document.getElementById("selectProvider");
const providerSelectGroup = document.getElementById("providerSelectGroup");
const openrouterKeyInput = document.getElementById("openrouterKey");
const openrouterModelSelect = document.getElementById("openrouterModel");
const geminiKeyInput = document.getElementById("geminiKey");
const geminiModelSelect = document.getElementById("geminiModel");
const openaiKeyInput = document.getElementById("openaiKey");
const openaiModelSelect = document.getElementById("openaiModel");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const saveStatusMsg = document.getElementById("saveStatusMsg");

// Elementos do DOM - Personalidade
const personalityOptions = document.querySelectorAll(".personality-option");
const sliderCreativity = document.getElementById("sliderCreativity");
const sliderEmojiFreq = document.getElementById("sliderEmojiFreq");
const sliderLength = document.getElementById("sliderLength");
const valCreativity = document.getElementById("valCreativity");
const valEmojiFreq = document.getElementById("valEmojiFreq");
const valLength = document.getElementById("valLength");

// Elementos do DOM - Acessibilidade
const switchTTS = document.getElementById("switchTTS");
const voiceSettingsSub = document.getElementById("voiceSettingsSub");
const ttsVoiceSelect = document.getElementById("ttsVoiceSelect");
const ttsRateSlider = document.getElementById("ttsRateSlider");
const ttsPitchSlider = document.getElementById("ttsPitchSlider");
const valTtsRate = document.getElementById("valTtsRate");
const valTtsPitch = document.getElementById("valTtsPitch");
const switchContrast = document.getElementById("switchContrast");
const switchDyslexic = document.getElementById("switchDyslexic");
const switchVLibras = document.getElementById("switchVLibras");
const switchVisualFocus = document.getElementById("switchVisualFocus");
const sliderFontSize = document.getElementById("sliderFontSize");
const btnFontInc = document.getElementById("btnFontInc");
const btnFontDec = document.getElementById("btnFontDec");
const btnFontNormal = document.getElementById("btnFontNormal");
const btnVirtualKeyboardToggle = document.getElementById("btnVirtualKeyboardToggle");
const virtualKeyboard = document.getElementById("virtualKeyboard");

// Elementos do DOM - Upload de PDF
const pdfInput = document.getElementById("pdfInput");
const btnUploadPdf = document.getElementById("btnUploadPdf");
const pdfBadgeContainer = document.getElementById("pdfBadgeContainer");
const pdfName = document.getElementById("pdfName");
const btnRemovePdf = document.getElementById("btnRemovePdf");

// ESTADO GLOBAL DO APLICATIVO
let activeTab = "chat";
let activeEmotion = "neutro";
let onlineMode = false;
let activeProvider = "gemini";
let apiKeys = {
  gemini: "",
  openai: "",
  openrouter: ""
};
let apiModels = {
  gemini: "gemini-1.5-flash",
  openai: "gpt-4o-mini",
  openrouter: "openrouter/free"
};
let personalityTuning = {
  creativity: 0.7,
  emojiFreq: 1, // 0 = Pouco, 1 = Médio, 2 = Muito
  length: 1 // 0 = Curta, 1 = Moderada, 2 = Longa
};
let accessibilitySettings = {
  ttsEnabled: false,
  ttsVoice: "",
  ttsRate: 1.0,
  ttsPitch: 1.0,
  highContrast: false,
  dyslexicFont: false,
  vLibrasEnabled: true,
  visualFocus: false,
  fontScale: 1.0,
  virtualKeyboardVisible: false
};

// ESTADO DO PDF CARREGADO
let uploadedPdfText = "";
let uploadedPdfName = "";

// Histórico de Conversação (Memória de Contexto)
let chatHistory = [];

// Imagens e fallbacks das emoções do mascote
const imagensMascote = {
  feliz: "img/feliz.png",
  pensativo: "img/pensativo.png",
  confiante: "img/confiante.png",
  neutro: "img/neutro.png"
};

const fallbackEmocoes = {
  feliz: "😊",
  pensativo: "🤔",
  confiante: "💪",
  neutro: "😶"
};

const nomesEmocoes = {
  feliz: "Shade está feliz",
  pensativo: "Shade está pensando",
  confiante: "Shade está confiante",
  neutro: "Shade está neutro"
};
