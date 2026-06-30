const site = window.DYNA_SITE;
const languageButtons = Array.from(document.querySelectorAll("[data-lang]"));
const agentName = document.getElementById("agentName");
const agentIntro = document.getElementById("agentIntro");
const agentHeaderSubtitle = document.getElementById("agentHeaderSubtitle");
const statusLabel = document.getElementById("statusLabel");
const apiStatus = document.getElementById("apiStatus");
const conversationTitle = document.getElementById("conversationTitle");
const agentIdBadge = document.getElementById("agentIdBadge");
const messageList = document.getElementById("messageList");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const inputLabel = document.getElementById("inputLabel");
const sendButton = document.getElementById("sendButton");
const voiceButton = document.getElementById("voiceButton");
const backLink = document.getElementById("backLink");

const pathAgentId = window.location.pathname.split("/").filter(Boolean).pop();
let currentLanguage = getInitialLanguage();
let currentAgent = site.agents.find((agent) => agent.id === pathAgentId);
let messages = [];
let currentConversationId = "";
let currentUsername = getOrCreateUsername();
let startupRequest = null;
let recognition = null;
let voiceModeActive = false;
let voiceRequestInFlight = false;
let voiceSpeaking = false;
let voiceRestartTimer = null;

function getInitialLanguage() {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang");
  const storedLanguage = window.localStorage.getItem("dyna-language");
  if (site.languages.includes(urlLanguage)) return urlLanguage;
  if (site.languages.includes(storedLanguage)) return storedLanguage;
  return site.defaultLanguage;
}

function setLanguage(language) {
  currentLanguage = language;
  window.localStorage.setItem("dyna-language", language);
  document.documentElement.lang = language === "ja" ? "ja" : "zh";
  if (messages.length <= 1) {
    messages = [];
    currentConversationId = "";
    startupRequest = null;
  }
  renderPage();
}

function textFor(item) {
  return item[currentLanguage] || item.zh;
}

function pageText(key) {
  return site.agentPage[currentLanguage][key] || "";
}

function phoneIconSvg() {
  return `
    <svg class="voice-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22 16.92v2.2a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 3.4 2 2 0 0 1 4.11 1.2h2.2a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L7.6 8.75a16 16 0 0 0 7.65 7.65l.92-.92a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z"></path>
    </svg>
  `;
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function detectSpeechLanguage(text) {
  if (/[\u3040-\u30ff]/.test(text)) return "ja-JP";
  if (/[\u4e00-\u9fff]/.test(text)) return currentLanguage === "ja" ? "ja-JP" : "zh-CN";
  return currentLanguage === "ja" ? "ja-JP" : "zh-CN";
}

function updateVoiceButton(stateText) {
  const label = voiceModeActive ? pageText("voiceStop") : pageText("voice");
  voiceButton.innerHTML = `${phoneIconSvg()}<span>${label}</span>`;
  voiceButton.title = voiceModeActive ? pageText("voiceStop") : pageText("voiceStart");
  voiceButton.setAttribute("aria-label", voiceButton.title);
  voiceButton.classList.toggle("is-listening", voiceModeActive && !voiceSpeaking && !voiceRequestInFlight);
  voiceButton.classList.toggle("is-speaking", voiceSpeaking);
  voiceButton.classList.toggle("is-active", voiceModeActive);

  const statusText = stateText || (voiceModeActive ? pageText("voiceListening") : site.home[currentLanguage].apiReady);
  if (apiStatus) {
    apiStatus.textContent = statusText;
  }
}

function appendMessage(role, text) {
  messages.push({ role, text });
  renderMessages();
}

function getOrCreateUsername() {
  const storageKey = "dyna-agent-demo-username";
  const stored = window.localStorage.getItem(storageKey);
  if (stored) return stored;

  const id =
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const username = `web-demo-${id}`;
  window.localStorage.setItem(storageKey, username);
  return username;
}

function createConversationId() {
  const id =
    window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${currentAgent.id}-${id}`;
}

function ensureConversationId() {
  if (!currentConversationId) {
    currentConversationId = createConversationId();
  }
  return currentConversationId;
}

function shouldAutoStartAgent() {
  return currentAgent && currentAgent.id === "policy-service";
}

function renderMessages() {
  messageList.innerHTML = "";
  if (!messages.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = pageText("empty");
    messageList.appendChild(empty);
    return;
  }
  messages.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className = `message-bubble ${message.role}`;
    bubble.textContent = message.text;
    messageList.appendChild(bubble);
  });
  messageList.scrollTop = messageList.scrollHeight;
}

function renderPage() {
  languageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === currentLanguage);
  });

  if (!currentAgent) {
    document.title = pageText("notFoundTitle");
    agentName.textContent = pageText("notFoundTitle");
    agentIntro.textContent = pageText("notFoundBody");
    chatForm.hidden = true;
    return;
  }

  const agentText = textFor(currentAgent);
  const homeLanguage = site.home[currentLanguage];

  document.title = `${agentText.name} | ${pageText("titleSuffix")}`;
  agentHeaderSubtitle.textContent = homeLanguage.brandSubtitle;
  agentName.textContent = agentText.name;
  agentIntro.textContent = agentText.intro;
  statusLabel.textContent = pageText("statusLabel");
  apiStatus.textContent = homeLanguage.apiReady;
  conversationTitle.textContent = pageText("conversation");
  agentIdBadge.textContent = currentAgent.id;
  inputLabel.textContent = pageText("inputLabel");
  messageInput.placeholder = agentText.placeholder;
  sendButton.textContent = pageText("send");
  updateVoiceButton();
  backLink.textContent = pageText("back");
  backLink.href = `/?lang=${currentLanguage}`;

  if (!messages.length && shouldAutoStartAgent()) {
    renderMessages();
    startAgentConversation();
    return;
  }

  if (!messages.length) {
    messages = [{ role: "agent", text: agentText.opening }];
  }
  renderMessages();
}

async function requestAgentReply(message, options = {}) {
  const agentText = textFor(currentAgent);
  sendButton.disabled = true;
  messageInput.disabled = true;

  if (options.appendUser !== false && message) {
    appendMessage("user", message);
  }

  try {
    const response = await fetch("/api/agent-chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agentId: currentAgent.id,
        language: currentLanguage,
        message,
        username: currentUsername,
        conversationId: ensureConversationId(),
        messages: messages.map((item) => ({ role: item.role, content: item.text })),
      }),
    });
    const result = await response.json();

    if (result.conversationId) {
      currentConversationId = result.conversationId;
    }

    if (!response.ok || result.mode === "error" || result.mode === "unconfigured") {
      const errorMessage = result.mode === "unconfigured" ? pageText("apiNotConfigured") : pageText("unavailable");
      appendMessage("agent", errorMessage);
      apiStatus.textContent = site.home[currentLanguage].apiError;
      return errorMessage;
    }

    const reply = typeof result.reply === "string" ? result.reply.trim() : "";
    const replyText = reply || pageText("unavailable");
    appendMessage("agent", replyText);
    apiStatus.textContent = result.mode === "mock" ? site.home[currentLanguage].mockMode : site.home[currentLanguage].apiReady;
    return replyText;
  } catch (error) {
    const errorMessage = pageText("unavailable");
    appendMessage("agent", errorMessage);
    apiStatus.textContent = site.home[currentLanguage].apiError;
    return errorMessage;
  } finally {
    sendButton.disabled = false;
    messageInput.disabled = false;
    messageInput.focus();
    if (voiceModeActive) updateVoiceButton();
  }
}

function startAgentConversation() {
  if (startupRequest || !currentAgent || messages.length) return;
  ensureConversationId();
  startupRequest = requestAgentReply("", { appendUser: false }).finally(() => {
    startupRequest = null;
  });
}

async function sendMessage(message) {
  await requestAgentReply(message);
}

function stopRecognitionOnly() {
  clearTimeout(voiceRestartTimer);
  voiceRestartTimer = null;
  if (recognition) {
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;
    try {
      recognition.stop();
    } catch {
      try {
        recognition.abort();
      } catch {}
    }
  }
  recognition = null;
}

function stopVoiceMode() {
  voiceModeActive = false;
  voiceRequestInFlight = false;
  voiceSpeaking = false;
  stopRecognitionOnly();
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  updateVoiceButton(site.home[currentLanguage].apiReady);
}

function scheduleVoiceRestart() {
  clearTimeout(voiceRestartTimer);
  if (!voiceModeActive || voiceRequestInFlight || voiceSpeaking) return;

  voiceRestartTimer = setTimeout(() => {
    startVoiceRecognition();
  }, 350);
}

function speakAgentReply(text) {
  if (!window.speechSynthesis || !text) return Promise.resolve();

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = detectSpeechLanguage(text);
    utterance.rate = 0.98;
    utterance.onend = resolve;
    utterance.onerror = resolve;
    voiceSpeaking = true;
    updateVoiceButton(pageText("voiceSpeaking"));
    window.speechSynthesis.speak(utterance);
  }).finally(() => {
    voiceSpeaking = false;
    updateVoiceButton();
  });
}

async function sendVoiceMessage(text) {
  if (!voiceModeActive || !text) return;

  voiceRequestInFlight = true;
  updateVoiceButton(site.home[currentLanguage].apiReady);
  const reply = await requestAgentReply(text);
  voiceRequestInFlight = false;

  if (voiceModeActive && reply) {
    await speakAgentReply(reply);
  }

  scheduleVoiceRestart();
}

function startVoiceRecognition() {
  const SpeechRecognitionCtor = getSpeechRecognitionCtor();
  if (!SpeechRecognitionCtor) {
    appendMessage("agent", pageText("voiceUnsupported"));
    stopVoiceMode();
    return;
  }

  stopRecognitionOnly();
  recognition = new SpeechRecognitionCtor();
  recognition.lang = currentLanguage === "ja" ? "ja-JP" : "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript.trim();
      if (event.results[index].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) {
      messageInput.value = interimTranscript;
    }

    if (finalTranscript.trim()) {
      const spokenText = finalTranscript.trim();
      messageInput.value = "";
      voiceRequestInFlight = true;
      try {
        recognition.stop();
      } catch {}
      sendVoiceMessage(spokenText);
    }
  };

  recognition.onerror = (event) => {
    const error = event && event.error ? event.error : "";
    if (error === "not-allowed" || error === "service-not-allowed") {
      appendMessage("agent", pageText("voicePermission"));
      stopVoiceMode();
    }
  };

  recognition.onend = () => {
    recognition = null;
    if (voiceModeActive && !voiceRequestInFlight && !voiceSpeaking) {
      scheduleVoiceRestart();
    }
  };

  try {
    recognition.start();
    updateVoiceButton(pageText("voiceListening"));
  } catch {
    scheduleVoiceRestart();
  }
}

function startVoiceMode() {
  if (!getSpeechRecognitionCtor()) {
    appendMessage("agent", pageText("voiceUnsupported"));
    return;
  }

  voiceModeActive = true;
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  updateVoiceButton(pageText("voiceListening"));
  startVoiceRecognition();
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

voiceButton.addEventListener("click", () => {
  if (voiceModeActive) {
    stopVoiceMode();
    return;
  }

  startVoiceMode();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  if (!message || !currentAgent) return;
  messageInput.value = "";
  sendMessage(message);
});

renderPage();
