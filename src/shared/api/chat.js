import { API_BASE_URL } from "./config";
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY4MzA3NjgyLCJpYXQiOjE3NjgzMDY3ODIsImp0aSI6IjgwZTFhZTJhNzQzYTRlMzJiNTg5OGNjOTE1NWM0YjhkIiwidXNlcl9pZCI6Ijc0YTdhZjUyLWJkZjQtNDRhOS1hMDQyLWYxNWRiZWM1NjE1MiJ9.iADVB5lwbeuBO917LVYibHBPHpVeFNQEMV9oB1GwtFE";

/* =========================
   Chats
   ========================= */

 export async function* animateTextByWords(text, delayMs = 80) {
  const words = text.split(/\s+/);
  let current = "";

  for (const word of words) {
    current += (current ? " " : "") + word;
    yield current;
    await new Promise((r) => setTimeout(r, delayMs));
  }
}

export async function fetchChats() {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats`);
  if (!res.ok) throw new Error("Failed to fetch chats");
  return res.json();
}

export async function createChat(title = "Новый чат") {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEV_TOKEN}`, },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) throw new Error("Failed to create chat");
  return res.json();
}

export async function deleteChat(chatId) {
  const res = await fetch(`${API_BASE_URL}/ml/api/ai/chats/${chatId}`, {
    method: "DELETE",
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

  const res = await fetch(url.toString());
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
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${DEV_TOKEN}`, // временно для локалки
    },
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
        yield buffer.replace(/\[DONE\]/g, "");
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
    animate: animateTextByWords,
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
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEV_TOKEN}`, },
      body: JSON.stringify({ new_text: newText }),
    }
  );

  if (!res.ok) throw new Error("Failed to edit message");
  return res.text(); // бек возвращает plain text
}