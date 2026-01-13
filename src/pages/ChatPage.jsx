import React from "react";
import { useChatStore } from "../entities/chat/store";

import { ChatHeader } from "../features/chat/components/ChatHeader";
import { MessageList } from "../features/chat/components/MessageList";
import { MessageInput } from "../features/chat/components/MessageInput";
import { GetStarted } from "../features/chat/containers/GetStarted";

import { closeModule } from "../shared/ui/platform/closeModule";

import buttonCircleToSidebar from "../image/chevron-circle-left.svg";
import crossToExit from "../image/times-square.svg";

/**
 * ChatPage
 * -----------------
 * Основная страница чата внутри AI Tutor модуля.
 * Отвечает за компоновку UI и навигацию.
 */
export const ChatPage = () => {
  const { activeChatId, toggleSidebar, sidebarOpen, openSidebar, chats } = useChatStore(
    (s) => ({
      activeChatId: s.activeChatId,
      toggleSidebar: s.toggleSidebar,
      sidebarOpen: s.sidebarOpen,
      openSidebar : s.openSidebar,
      chats: s.chats,
    })
  );

  const chat = chats.find((c) => c.id === activeChatId);

  const isMobile = window.innerWidth <= 768;

  // hover-состояния для кнопок
  const [hoverSidebar, setHoverSidebar] = React.useState(false);
  const [hoverClose, setHoverClose] = React.useState(false);

  if (!chat) return null;

  const isEmpty = chat.messages.length === 0;

  return (
    <div style={styles.page}>
      <ChatHeader chatId={chat.id} />

      <div style={styles.container}>
        {/* Верхние кнопки */}
        <div style={styles.topControls}>
          {/* Sidebar toggle */}
          <button
            onClick={() => {
              if (isMobile) {
                openSidebar (); // всегда открыть
              } else {
                toggleSidebar(); // toggle только на десктопе
              }
            }}
            onMouseEnter={() => setHoverSidebar(true)}
            onMouseLeave={() => setHoverSidebar(false)}
            style={{
              ...styles.icon,
              background: hoverSidebar ? "#333333" : "transparent",
            }}
          >
            <img
              src={buttonCircleToSidebar}
              width={38}
              height={38}
              alt="To sidebar"
              style={{
                display: "block",
                transform: sidebarOpen ? "scaleX(-1)" : "scaleX(1)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {/* Close module */}
          <button
            onClick={closeModule}
            onMouseEnter={() => setHoverClose(true)}
            onMouseLeave={() => setHoverClose(false)}
            style={{
              ...styles.icon,
              background: hoverClose ? "#333333" : "transparent",
            }}
          >
            <img
              src={crossToExit}
              width={38}
              height={38}
              alt="Close module"
              style={{ display: "block" }}
            />
          </button>
        </div>

        {/* Контент */}
        {isEmpty ? <GetStarted /> : <MessageList chatId={chat.id} />}

        {/* Ввод */}
        <MessageInput chatId={chat.id} />
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },

  container: {
    height: 779,
    width: 681,
    background: "#1C1C1C",
    border: "5px solid #000000",
    borderRadius: 15,
    display: "flex",
    flexDirection: "column",
  },

  topControls: {
    display: "flex",
    justifyContent: "space-between",
    margin: "10px 10px 0 10px",
    alignItems: "center",
  },

  icon: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    lineHeight: 0,
    borderRadius: 10,
    transition: "background 0.15s ease",

    appearance: "none",
    WebkitAppearance: "none",
  },
};
