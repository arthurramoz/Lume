import { getIsAuthenticated, localStorageKeys } from "../hooks/useAuth.js";

const BOT_NAME = "Assistente de Livros";

const API_URL = window.API_URL;

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ICONS = {
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
};

let conversationHistory = [];

function buildFAB() {
  const btn = document.createElement("button");
  btn.className = "chatbot-fab";
  btn.id = "chatbot-fab";
  btn.setAttribute("aria-label", "Abrir recomendações");
  btn.innerHTML = `
    <span class="chatbot-fab__icon">${ICONS.chat}</span>
    <span>Recomendações</span>
  `;
  return btn;
}

function buildWindow() {
  const win = document.createElement("div");
  win.className = "chatbot-window";
  win.id = "chatbot-window";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-label", BOT_NAME);

  win.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-header__avatar">${ICONS.bot}</div>
      <span class="chatbot-header__title">${BOT_NAME}</span>
      <button class="chatbot-header__close" id="chatbot-close" aria-label="Fechar chat">
        ${ICONS.close}
      </button>
    </div>

    <div class="chatbot-messages" id="chatbot-messages"></div>

    <div class="chatbot-input-area">
      <div class="input-wrapper">
        <input
          type="text"
          id="chatbot-input"
          placeholder="Digite sua pergunta sobre livros"
          autocomplete="off"
        />
      </div>
      <button class="chatbot-send-btn" id="chatbot-send" aria-label="Enviar mensagem">
        ${ICONS.send}
      </button>
    </div>
  `;

  return win;
}

function appendMessage(container, text, type = "bot") {
  const wrapper = document.createElement("div");
  wrapper.className = `chatbot-msg chatbot-msg--${type}`;

  const avatarHTML =
    type === "bot"
      ? `<div class="chatbot-msg__avatar">${ICONS.bot}</div>`
      : "";

  wrapper.innerHTML = `
    ${avatarHTML}
    <div class="chatbot-msg__bubble">
      ${text}
      <span class="chatbot-msg__time">${now()}</span>
    </div>
  `;

  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function showTyping(container) {
  const typing = document.createElement("div");
  typing.className = "chatbot-typing";
  typing.id = "chatbot-typing";
  typing.innerHTML = `
    <span class="chatbot-typing__dot"></span>
    <span class="chatbot-typing__dot"></span>
    <span class="chatbot-typing__dot"></span>
  `;
  container.appendChild(typing);
  container.scrollTop = container.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById("chatbot-typing");
  if (el) el.remove();
}

function getToken() {
  return localStorage.getItem(localStorageKeys.accessToken)
    || sessionStorage.getItem(localStorageKeys.accessToken);
}

async function sendToAPI(message) {
  const token = getToken();

  const response = await fetch(`${API_URL}/api/chatbot`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message,
      history: conversationHistory,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Erro na API");
  }

  return data.reply;
}

export const initChatbot = () => {
  const isHomePage = document.querySelector("main.landing");
  if (!isHomePage) return;

  const fab = buildFAB();
  const chatWindow = buildWindow();
  document.body.appendChild(fab);
  document.body.appendChild(chatWindow);

  const messagesEl = document.getElementById("chatbot-messages");
  const inputEl = document.getElementById("chatbot-input");
  const sendBtn = document.getElementById("chatbot-send");
  const closeBtn = document.getElementById("chatbot-close");

  let isSending = false;

  const isLoggedIn = getIsAuthenticated();
  if (isLoggedIn) {
    appendMessage(messagesEl, "Olá! Sou o Lume, seu assistente de livros. Como posso te ajudar hoje? 📚", "bot");
  } else {
    appendMessage(messagesEl, "Olá! Para receber recomendações personalizadas, faça login na sua conta. 📚", "bot");
  }

  function openChat() {
    chatWindow.classList.add("chatbot-window--open");
    fab.classList.add("chatbot-fab--hidden");
    inputEl.focus();
  }

  function closeChat() {
    chatWindow.classList.remove("chatbot-window--open");
    fab.classList.remove("chatbot-fab--hidden");
  }

  fab.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && chatWindow.classList.contains("chatbot-window--open")) {
      closeChat();
    }
  });

  async function handleSend() {
    const text = inputEl.value.trim();
    if (!text || isSending) return;

    if (!getIsAuthenticated()) {
      appendMessage(messagesEl, text, "user");
      inputEl.value = "";
      appendMessage(
        messagesEl,
        'Para usar o assistente, faça <a href="/pages/login.html" style="color: var(--color-primaria100); text-decoration: underline;">login</a> na sua conta.',
        "bot"
      );
      return;
    }

    appendMessage(messagesEl, text, "user");
    inputEl.value = "";
    isSending = true;
    sendBtn.disabled = true;

    showTyping(messagesEl);

    try {
      const reply = await sendToAPI(text);

      conversationHistory.push({ role: "user", content: text });
      conversationHistory.push({ role: "model", content: reply });

      if (conversationHistory.length > 20) {
        conversationHistory = conversationHistory.slice(-20);
      }

      removeTyping();
      appendMessage(messagesEl, reply, "bot");
    } catch (error) {
      console.error("Erro no chatbot:", error);
      removeTyping();
      appendMessage(
        messagesEl,
        "Desculpe, estou com dificuldades no momento. Tente novamente mais tarde! 📚",
        "bot"
      );
    } finally {
      isSending = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });
};
