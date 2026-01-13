import { API_BASE_URL } from "./config";

/**
 * DEV TOKEN
 * Используется ТОЛЬКО для локальной разработки.
 *
 * не использовать в production / npm-пакете
 *
 * В production авторизация осуществляется платформой.
 */
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

/* =========================
   Helpers
   ========================= */

/**
 * Универсальный builder для headers.
 *
 * В production Authorization добавляется платформой автоматически.
 * В DEV — можно прокинуть токен через .env.local.
 */
function buildHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };

  // для локальной разработки
  if (import.meta.env.DEV && DEV_TOKEN) {
    headers.Authorization = `Bearer ${DEV_TOKEN}`;
  }

  return headers;
}

/* =========================
   Text animation (UI-level)
   ========================= */

export async function* animateTextByWords(text, delayMs = 80) {
  const words = text.trim().split(/\s+/);
  let current = "";

  for (const word of words) {
    current += (current ? " " : "") + word;
    yield current;
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

/* =========================
   Chats
   ========================= */

export async function fetchChats() {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats`, {
    headers: buildHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function createChat(title = "Новый чат") {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ title }),
  });

  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function deleteChat(chatId) {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats/${chatId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete chat");
  return res.json();
}

/* =========================
   History
   ========================= */

export async function fetchChatHistory(chatId, limit = 200) {
  const url = new URL(`${API_BASE_URL}/ml/api/ai/history`);
  url.searchParams.set("chat_id", chatId);
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: buildHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch history");

  const data = await res.json();
  return data.messages;
}

/* =========================
   Send message (STREAM)
   ========================= */

export async function sendMessageStream({ chatId, message }) {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/message`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ chat_id: chatId, message }),
  });

  if (!res.body) {
    throw new Error("No stream body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  async function* stream() {
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      if (buffer.includes("[DONE]")) {
        yield buffer.replace(/\[DONE\]/g, "").trim();
        break;
      }
    }
  }

  return {
    userMessage: {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    },
    botMessage: {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
    },
    stream: stream(),
    animate: animateTextByWords, // UI-анимация, не часть API
  };
}

/* =========================
   Edit message
   ========================= */

export async function editMessage(messageId, newText) {
  const res = await fetch(
    `${API_BASE_URL}/ml/api/ai/messages/${messageId}`,
    {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify({ new_text: newText }),
    }
  );

  if (!res.ok) throw new Error("Failed to edit message");

  // backend возвращает plain text / stream
  return res.text();
}
