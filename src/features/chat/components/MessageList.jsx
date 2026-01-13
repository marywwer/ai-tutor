import React from "react";
import { MessageItem } from "./MessageItem";
import { TypingIndicator } from "./TypingIndicator";
import { useChatStore } from "../../../entities/chat/store";

/**
 * MessageList
 * -----------------
 * Контейнер списка сообщений.
 * Отвечает за:
 *  - отрисовку сообщений
 *  - автоскролл вниз
 *  - корректную работу при ручном скролле пользователя
 *  - отображение индикатора печати AI
 */
export const MessageList = ({ chatId }) => {
  const { chat, aiTyping } = useChatStore((s) => ({
    chat: s.chats.find((c) => c.id === chatId),
    aiTyping: s.aiTyping,
  }));

  const containerRef = React.useRef(null);
  const bottomRef = React.useRef(null);

  // Флаг: можно ли автоскроллить (false, если пользователь ушёл вверх)
  const shouldAutoScroll = React.useRef(true);

  if (!chat) return null;

  /* =========================
     Detect user scroll
     ========================= */
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const distanceToBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;

    // если пользователь почти внизу — разрешаем автоскролл
    shouldAutoScroll.current = distanceToBottom < 40;
  };

  /* =========================
     Auto scroll on new messages
     ========================= */
  React.useEffect(() => {
    if (!shouldAutoScroll.current) return;

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat.messages.length, aiTyping]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={styles.container}
      className="chat-scroll"
    >
      {chat.messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          chatId={chat.id}
          index={index}
          totalMessages={chat.messages.length}
        />
      ))}

      {aiTyping && <TypingIndicator />}

      {/* Anchor for auto-scroll */}
      <div ref={bottomRef} />
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    maxWidth: 681,
    maxHeight: 693,
    overflowY: "auto",
    padding: "16px",
    background: "#1C1C1C",

    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};