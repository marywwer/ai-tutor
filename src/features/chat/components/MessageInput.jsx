import React from "react";
import { sendMessageStream } from "../../../shared/api/chat";
import { useChatStore } from "../../../entities/chat/store";
import { handleApiError } from "../../../shared/api/error-handler";
import { animateTextByWords } from "../../../shared/api/chat";
import buttonToFiles from "../../../image/Paperclip.svg";
import buttonToSend from "../../../image/paper-airplane.svg";
import imageFileBlack from "../../../image/fileblack.svg";

/**
 * MessageInput
 * -----------------
 * Контроллер ввода сообщения:
 *  - текст
 *  - файлы
 *  - drag & drop
 *  - отправка сообщения
 */
export const MessageInput = ({ chatId }) => {
  const { addMessage, updateMessage, setAiTyping } = useChatStore();

  const [value, setValue] = React.useState("");
  const [files, setFiles] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);

  const dragCounter = React.useRef(0);
  const fileInputRef = React.useRef(null);
  const dropRef = React.useRef(null);

  // hover states
  const [hoveredFileIndex, setHoveredFileIndex] = React.useState(null);
  const [hoverAttach, setHoverAttach] = React.useState(false);
  const [hoverSend, setHoverSend] = React.useState(false);

  if (!chatId) return null;

  /* =========================
     FILE ATTACH
     ========================= */
  const attachFiles = React.useCallback((fileList) => {
    const newFiles = Array.from(fileList);
    setFiles((prev) => [...prev, ...newFiles]);

    // позволяет выбрать тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const onAttach = (e) => attachFiles(e.target.files);

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================
     DRAG & DROP
     ========================= */
  React.useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current += 1;
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current -= 1;
      if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      dragCounter.current = 0;
      attachFiles(e.dataTransfer.files);
    };

    el.addEventListener("dragenter", handleDragEnter);
    el.addEventListener("dragleave", handleDragLeave);
    el.addEventListener("dragover", handleDragOver);
    el.addEventListener("drop", handleDrop);

    return () => {
      el.removeEventListener("dragenter", handleDragEnter);
      el.removeEventListener("dragleave", handleDragLeave);
      el.removeEventListener("dragover", handleDragOver);
      el.removeEventListener("drop", handleDrop);
    };
  }, [attachFiles]);

  /* =========================
     SEND MESSAGE
     ========================= */
  const onSend = async () => {
    if (!value.trim() && files.length === 0) return;

    // если пользователь прикрепил файлы без текста — подставляем prompt
    const finalMessage =
      !value.trim() && files.length > 0 ? "Исследуй этот файл" : value;

    try {
      setAiTyping(true);

      const { userMessage, botMessage, stream } = await sendMessageStream({
        chatId,
        message: finalMessage,
        files,
      });

      if (userMessage) addMessage(chatId, userMessage);
      addMessage(chatId, botMessage);

      setValue("");
      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      let fullText = "";

      for await (const chunk of stream) {
        if (chunk.includes("[DONE]")) break;
        fullText += chunk;
      }

      fullText = fullText
        .replace(/\[DONE\]/g, "")
        .replace(/^data:\s*/gm, "")
        .replace(/(\\n|\n)+$/g, "")
        .trim();

      for await (const partial of animateTextByWords(fullText, 80)) {
        updateMessage(chatId, botMessage.id, partial);
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setAiTyping(false);
    }
  };

  return (
    <div ref={dropRef} style={styles.root} className="message-input">
      {isDragging && (
        <div style={styles.dropOverlay}>
          <div style={styles.dropText}>Перетащите файлы сюда</div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={onAttach}
      />

      {files.length > 0 && (
        <div style={styles.files}>
          {files.map((f, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFileIndex(index)}
              onMouseLeave={() => setHoveredFileIndex(null)}
              style={{
                ...styles.fileItem,
                background:
                  hoveredFileIndex === index ? "#BBBBBBFF" : "#F3F3F3",
              }}
            >
              <img src={imageFileBlack} width={12} height={12} alt="" />
              {f.name} ({Math.round(f.size / 1024)}kb)
              <button style={styles.remove} onClick={() => removeFile(index)}>
                ✖
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.inputRow}>
        <button
          onClick={() => fileInputRef.current?.click()}
          onMouseEnter={() => setHoverAttach(true)}
          onMouseLeave={() => setHoverAttach(false)}
          style={{
            ...styles.icon,
            transform: hoverAttach ? "translateY(-4px)" : "translateY(0)",
          }}
        >
          <img src={buttonToFiles} width={33} height={33} alt="Attach" />
        </button>

        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={
            files.length > 0 && !value.trim()
              ? "Исследуй этот файл"
              : "Отправьте сообщение или сбросьте файлы"
          }
          style={styles.input}
        />

        <button
          onClick={onSend}
          onMouseEnter={() => setHoverSend(true)}
          onMouseLeave={() => setHoverSend(false)}
          style={{
            ...styles.icon,
            transform: hoverSend
              ? "translateX(4px) scale(0.96)"
              : "translateX(0) scale(1)",
          }}
        >
          <img src={buttonToSend} width={25} height={24} alt="Send" />
        </button>
      </div>
    </div>
  );
};

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backgroundColor: "#FFFFFF",
    border: "1.35px solid #02040F",
    outline: "2px solid #E0E0E0",
    outlineOffset: 1,
    borderRadius: 8.09,
    margin: "16px 24px",
    marginTop: 0,
    padding: 17,
    position: "relative",
  },

  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  icon: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: 0,
    transition: "transform 0.15s ease",
  },

  input: {
    fontSize: 16,
    fontFamily: "Montserrat",
    fontWeight: 500,
    background: "transparent",
    border: "none",
    color: "#2b2929ff",
    outline: "none",
    width: "100%",
  },

  files: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  dropOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255, 255, 255, 0.95)",
    border: "2px dashed #BDBDBD",
    borderRadius: 8.09,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  dropText: {
    fontSize: 16,
    fontWeight: 600,
    color: "#424242",
  },

  fileItem: {
    background: "#F3F3F3",
    borderRadius: 16,
    padding: "6px 10px",
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#000000",
    transition: "background 0.15s ease",
  },

  remove: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    padding: 0,
  },
};
