import React, { useState, useEffect } from "react";
import { useChatStore } from "../../../entities/chat/store";
import pencilToEditTitleIcon from "../../../image/pencil-to-title.svg";

/**
 * ChatHeader
 * -----------------
 * Заголовок активного чата.
 * Отображает и позволяет редактировать название чата.
 */
export const ChatHeader = ({ chatId }) => {
  const chat = useChatStore((s) =>
    s.chats.find((c) => c.id === chatId)
  );
  const updateTitle = useChatStore((s) => s.updateTitle);

  if (!chat) return null;

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(chat.title);

  // синхронизация при смене чата или обновлении названия
  useEffect(() => {
    setValue(chat.title);
  }, [chat.id, chat.title]);

  // hover state для кнопки редактирования
  const [hoverEditing, setHoverEditing] = useState(false);

  const save = () => {
    const trimmed = value.trim();

    if (trimmed) {
      updateTitle(chatId, trimmed);
    } else {
      // если пользователь стёр всё — возвращаем старое значение
      setValue(chat.title);
    }

    setEditing(false);
  };

  return (
    <div style={styles.header} className="chat-header">
      {/* title */}
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={styles.input}
        />
      ) : (
        <span style={styles.title}>{chat.title}</span>
      )}

      {/* edit button */}
      <button
        onClick={() => setEditing(true)}
        onMouseEnter={() => setHoverEditing(true)}
        onMouseLeave={() => setHoverEditing(false)}
        style={{
          ...styles.icon,
          background: hoverEditing ? "#333333" : "transparent",
        }}
      >
        <img
          src={pencilToEditTitleIcon}
          width={24}
          height={24}
          alt="Edit title"
          style={{ display: "block" }}
        />
      </button>
    </div>
  );
};

const styles = {
  header: {
    height: 44,
    width: 559,
    display: "flex",
    margin: "0 auto",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 5,
    borderBottomWidth: 0,
    borderTopLeftRadius: "9px",
    borderTopRightRadius: "9px",
    borderStyle: "solid",
    borderColor: "#000000",
    background: "#1C1C1C",
  },

  title: {
    height: 32,
    flex: 1,
    fontFamily: "Montserrat",
    fontWeight: 500,
    fontSize: 26,
    lineHeight: "100%",
    textAlign: "center",
    color: "#FFFFFF",
  },

  input: {
    fontSize: 26,
    fontFamily: "Montserrat",
    fontWeight: 500,
    background: "transparent",
    border: "none",
    color: "#FFFFFF",
    textAlign: "center",
    outline: "none",
    width: "100%",
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
    borderRadius: 5,
    transition: "background 0.15s ease",

    appearance: "none",
    WebkitAppearance: "none",
  },
};
