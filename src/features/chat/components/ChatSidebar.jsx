import { useChatStore } from "../../../entities/chat/store";
import { useState, useMemo } from "react";

import buttonNewChat from "../../../image/IconsAddChat.svg";
import buttonToDelete from "../../../image/trash-Bold.svg";
import buttonToMaterials from "../../../image/database_1.svg";
import buttonToFix from "../../../image/thumbtack.svg";

/**
 * Sidebar со списком чатов и действиями
 */
export const ChatSidebar = () => {
  const {
    chats,
    activeChatId,
    setActiveChat,
    createChat,
    deleteChat,
    togglePin,
    openMaterials,
  } = useChatStore();

  /* =========================
     Derived state
     ========================= */

  // Закреплённые чаты всегда сверху
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [chats]);

  /* =========================
     Local UI state
     ========================= */

  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [pinAnimatingId, setPinAnimatingId] = useState(null);

  const [hoverNew, setHoverNew] = useState(false);
  const [hoverDelete, setHoverDelete] = useState(false);
  const [hoverMaterials, setHoverMaterials] = useState(false);

  /* =========================
     Handlers
     ========================= */

  const handleTogglePin = (e, chatId) => {
    e.stopPropagation();

    setPinAnimatingId(chatId);
    togglePin(chatId);

    setTimeout(() => setPinAnimatingId(null), 300);
  };

  return (
    <div
      style={styles.sidebar}
      className="chat-scroll chat-sidebar"
    >
      {/* animation */}
      <style>
        {`
          @keyframes pinPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>Чаты</span>
      </div>

      {/* CHAT LIST */}
      <div style={styles.chatList}>
        {sortedChats.map((chat) => {
          const isActive = chat.id === activeChatId;
          const isHovered = hoveredChatId === chat.id;

          return (
            <div
              key={chat.id}
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
              onClick={() => setActiveChat(chat.id)}
              style={{
                ...styles.chatItem,
                ...(chat.pinned ? styles.chatItemPinned : {}),
                ...(isHovered && !chat.pinned ? styles.chatItemHover : {}),
                ...(isActive ? styles.chatItemActive : {}),
                ...(pinAnimatingId === chat.id ? styles.pinAnimating : {}),
              }}
            >
              <span style={styles.chatTitle}>{chat.title}</span>

              {/* PIN */}
              <button
                style={{
                  ...styles.pinButton,
                  opacity: isHovered ? 1 : 0.6,
                }}
                onClick={(e) => handleTogglePin(e, chat.id)}
              >
                <img
                  src={buttonToFix}
                  width={24}
                  height={24}
                  alt="Pin chat"
                  style={{
                    display: "block",
                    transform: chat.pinned ? "none" : "rotate(45deg)",
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* FOOTER ACTIONS */}
      <div style={styles.footer}>
        <button
          onClick={createChat}
          onMouseEnter={() => setHoverNew(true)}
          onMouseLeave={() => setHoverNew(false)}
          style={{
            ...styles.actionButton,
            background: hoverNew ? "#2A2A2A" : "#181818",
          }}
        >
          <img src={buttonNewChat} width={25} height={25} alt="" />
          Новый чат
        </button>

        <button
          onClick={deleteChat}
          onMouseEnter={() => setHoverDelete(true)}
          onMouseLeave={() => setHoverDelete(false)}
          style={{
            ...styles.actionButton,
            ...styles.dangerButton,
            background: hoverDelete ? "#402020" : "#201010",
          }}
        >
          <img src={buttonToDelete} width={24} height={24} alt="" />
          Удалить чат
        </button>

        <button
          onClick={openMaterials}
          onMouseEnter={() => setHoverMaterials(true)}
          onMouseLeave={() => setHoverMaterials(false)}
          style={{
            ...styles.actionButton,
            background: hoverMaterials ? "#2A2A2A" : "#181818",
          }}
        >
          <img src={buttonToMaterials} width={25} height={25} alt="" />
          Материалы
        </button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: 243,
    height: 665,
    background: "#1C1C1C",
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: 20,
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    border: "5px solid #000000",
    borderRadius: 15,
    marginRight: 39,
    marginTop: 50,
  },

  /* ---------- Header ---------- */

  header: {
    padding: "14px 16px",
    borderBottom: "1px solid #222",
    fontSize: 22,
    fontWeight: 600,
  },

  headerTitle: {
    opacity: 0.9,
  },

  /* ---------- Chat list ---------- */

  chatList: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  chatItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    background: "transparent",
    transition: "background 0.15s ease, color 0.15s ease",
  },

  chatItemActive: {
    background: "#454545",
  },

  chatTitle: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  pinButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },

  /* ---------- Footer ---------- */

  footer: {
    padding: 12,
    borderTop: "1px solid #222",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  actionButton: {
    width: "100%",
    display: "flex",
    padding: "8px 10px",
    alignItems: "center",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#181818",
    color: "#fff",
    cursor: "pointer",
    textAlign: "left",
    gap: 14,
    margin: 0,
    fontSize: 18,
    fontFamily: "Montserrat",
    fontWeight: 500,
    transition: "background 0.15s",
  },

  dangerButton: {
    borderColor: "#402020",
    background: "#201010",
  },

  chatItemHover: {
    background: "#2D2D2D",
  },

  chatItemPinned: {
    background: "#454545",
  },

  pinAnimating: {
    animation: "pinPop 0.3s ease",
  },
};
