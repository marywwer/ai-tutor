import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createChat} from "../../shared/api/chat.js";

/* ============================
   helpers
   ============================ */

const createStorageKey = (state) => {
  const info = state?.widgetInfo;

  if (!info?.userId || !info?.widgetId) {
    return "ai-tutor:temp";
  }

  return `ai-tutor:${info.userId}:${info.widgetId}`;
};

/* ============================
   store
   ============================ */

export const useChatStore = create(
  persist(
    (set, get) => ({
      /* ---------- Meta ---------- */
      widgetInfo: null,
      setWidgetInfo: (info) => set({ widgetInfo: info }),

      /* ---------- Core state ---------- */
      chats: [],
      activeChatId: null,
      aiTyping: false,

      /* ---------- Desktop UI ---------- */
      sidebarOpen: false,
      materialsOpen: false,

      /* ---------- Mobile UI ---------- */
      /* 
      uiView используется ТОЛЬКО для mobile UX.
      sidebarOpen — desktop layout.
      */

      uiView: "chat", // "chat" | "sidebar" | "materials"

      /* ---------- Navigation ---------- */
      openChat: () =>
        set({
          uiView: "chat",
          materialsOpen: false,
        }),

      openSidebar: () =>
        set({
          uiView: "sidebar",
        }),

      openMaterials: () =>
        set({
          uiView: "materials",
          materialsOpen: true,
        }),

      closeMaterials: () =>
        set({
          uiView: "chat",
          materialsOpen: false,
        }),

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      /* ---------- Chat lifecycle ---------- */
      createChat: async () => {
        const serverChat = await createChat("Новый чат");

        set((state) => ({
          chats: [
            ...state.chats,
            {
              id: serverChat.id,
              title: serverChat.title,
              pinned: false,
              messages: [],
            },
          ],
          activeChatId: serverChat.id,
          uiView: "chat",
        }));
      },

      deleteChat: () => {
        const { chats, activeChatId } = get();
        if (!activeChatId) return;

        const index = chats.findIndex((c) => c.id === activeChatId);
        if (index === -1) return;

        const newChats = chats.filter((c) => c.id !== activeChatId);
        const newActiveChatId =
          newChats[index - 1]?.id || newChats[0]?.id || null;

        set({
          chats: newChats,
          activeChatId: newActiveChatId,
          uiView: "chat",
        });
      },

      setActiveChat: (id) =>
        set({
          activeChatId: id,
          materialsOpen: false,
          uiView: "chat",
        }),

      togglePin: (id) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === id ? { ...c, pinned: !c.pinned } : c
          ),
        })),

      updateTitle: (id, title) =>
        set((state) => ({
          chats: state.chats.map((c) => (c.id === id ? { ...c, title } : c)),
        })),

      /* ---------- Messages ---------- */
      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId ? { ...c, messages: [...c.messages, message] } : c
          ),
        })),

      updateMessage: (chatId, messageId, text) =>
        set((state) => ({
          chats: state.chats.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, text } : m
                  ),
                }
              : c
          ),
        })),

      editMessage: (chatId, messageId, newText) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((m) =>
                    m.id === messageId ? { ...m, text: newText } : m
                  ),
                }
              : chat
          ),
        })),

      replaceBotAnswerAfterUserMessage: (
        chatId,
        userMessageId,
        newBotMessage
      ) =>
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id !== chatId) return chat;

            const messages = [...chat.messages];
            const userIndex = messages.findIndex((m) => m.id === userMessageId);

            if (userIndex === -1) return chat;

            const botIndex = messages.findIndex(
              (m, i) => i > userIndex && m.role === "bot"
            );

            if (botIndex !== -1) {
              messages[botIndex] = newBotMessage;
            } else {
              messages.push(newBotMessage);
            }

            return { ...chat, messages };
          }),
        })),

      /* ---------- Flags ---------- */
      setAiTyping: (value) => set({ aiTyping: value }),
    }),
    {
      name: "ai-tutor",
      partialize: (state) => ({
        widgetInfo: state.widgetInfo,
        chats: state.chats,
        activeChatId: state.activeChatId,
        uiView: state.uiView,
      }),
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;

          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        },

        setItem: (_, value) => {
          const key = createStorageKey(value.state);
          localStorage.setItem(key, JSON.stringify(value));
        },

        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);
