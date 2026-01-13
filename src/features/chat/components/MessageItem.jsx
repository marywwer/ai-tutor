import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { animateTextByWords } from "../../../shared/api/chat";
import { useChatStore } from "../../../entities/chat/store";
import { sendMessageStream } from "../../../shared/api/chat";
import buttonToCopy from "../../../image/CopySimple.svg";
import buttonToEdit from "../../../image/pencil-03.svg";
import buttonCancel from "../../../image/x.svg";
import buttonConfirm from "../../../image/check2.svg";
import imageFile from "../../../image/file.svg";

export const MessageItem = ({ message, chatId, index, totalMessages }) => {
  const {
    editMessage,
    replaceBotAnswerAfterUserMessage,
    updateMessage,
    setAiTyping,
  } = useChatStore();

  // hover states
  const [hoverConfirm, setHoverConfirm] = React.useState(false);
  const [hoverToEdit, setHoverToEdit] = React.useState(false);
  const [hoverCancel, setHoverCancel] = React.useState(false);
  const [hoverConfirm2, setHoverConfirm2] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(message.text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(message.text);
  const originalValue = React.useRef(message.text);
  const [copied, setCopied] = React.useState(false);

  const messagesAfter = totalMessages - index - 1;
  const canEdit = message.role === "user" && messagesAfter <= 1;

  const cancelEdit = () => {
    setValue(originalValue.current);
    setEditing(false);
  };

  const textareaRef = React.useRef(null);

  React.useEffect(() => {
    if (!editing || !textareaRef.current) return;

    const el = textareaRef.current;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [value, editing]);

  const confirmEdit = async () => {
    if (!value.trim()) {
      cancelEdit();
      return;
    }

    try {
      setAiTyping(true);

      editMessage(chatId, message.id, value.trim());

      const { botMessage, stream } = await sendMessageStream({
        chatId,
        message: value.trim(),
        mode: "edit",
        files: message.attachments || [],
        editedMessageId: message.id,
      });

      replaceBotAnswerAfterUserMessage(chatId, message.id, botMessage);

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
    } finally {
      setAiTyping(false);
      setEditing(false);
    }
  };

  const markdownComponents = {
    p: ({ children }) => <p style={styles.p}>{children}</p>,

    strong: ({ children }) => <strong style={styles.strong}>{children}</strong>,

    ul: ({ children }) => <ul style={styles.ul}>{children}</ul>,
    ol: ({ children }) => <ol style={styles.ol}>{children}</ol>,
    li: ({ children }) => <li style={styles.li}>{children}</li>,
    em: ({ children }) => <em style={styles.em}>{children}</em>,

    table: ({ children }) => <table style={styles.table}>{children}</table>,

    th: ({ children }) => <th style={styles.th}>{children}</th>,
    td: ({ children }) => <td style={styles.td}>{children}</td>,

    code({ inline, className, children }) {
      const match = /language-(\w+)/.exec(className || "");

      return !inline && match ? (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={styles.codeBlock}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code style={styles.inlineCode}>{children}</code>
      );
    },
  };

  return (
    <div
      style={{
        alignSelf: message.role === "user" ? "flex-end" : "flex-start",
        display: "flex",
        flexDirection: "column",
        maxWidth: 410,
        position: "relative",
      }}
    >
      {/* bubble */}
      <div style={styles.bubble} className="message-bubble">
        {editing ? (
          <textarea
            ref={textareaRef}
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            style={styles.textarea}
          />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={markdownComponents}
          >
            {message.text}
          </ReactMarkdown>
        )}
      </div>

      {message.attachments?.length > 0 && (
        <div style={styles.attachments}>
          {message.attachments.map((file) => (
            <div key={file.id} style={styles.file}>
              <img src={imageFile} width={12} height={12} style={styles.icon} />{" "}
              {file.name} ({Math.round(file.size / 1024)}kb)
            </div>
          ))}
        </div>
      )}

      {/* actions */}
      <div style={styles.actions}>
        {/* copy — всегда */}
        <button
          onClick={copy}
          onMouseEnter={() => setHoverConfirm(true)}
          onMouseLeave={() => setHoverConfirm(false)}
          style={{
            ...styles.icon,
            background: hoverConfirm ? "#333333" : "transparent",
          }}
        >
          {copied ? (
            <img
              src={buttonConfirm}
              width={24}
              height={24}
              alt="Check copy"
              style={{ display: "block" }}
            />
          ) : (
            <img
              src={buttonToCopy}
              width={24}
              height={24}
              alt="To copy"
              style={{ display: "block" }}
            />
          )}
        </button>

        {/* edit / confirm / cancel */}
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            onMouseEnter={() => setHoverToEdit(true)}
            onMouseLeave={() => setHoverToEdit(false)}
            style={{
              ...styles.icon,
              background: hoverToEdit ? "#333333" : "transparent",
            }}
          >
            <img src={buttonToEdit} width={22} height={22} alt="Edit" />
          </button>
        )}

        {editing && (
          <>
            <button
              onClick={cancelEdit}
              onMouseEnter={() => setHoverCancel(true)}
              onMouseLeave={() => setHoverCancel(false)}
              style={{
                ...styles.icon,
                background: hoverCancel ? "#333333" : "transparent",
              }}
            >
              <img
                src={buttonCancel}
                width={15}
                height={15}
                alt="Cancel"
                style={{ display: "block", padding: 2 }}
              />
            </button>
            <button
              onClick={confirmEdit}
              onMouseEnter={() => setHoverConfirm2(true)}
              onMouseLeave={() => setHoverConfirm2(false)}
              style={{
                ...styles.icon,
                background: hoverConfirm2 ? "#333333" : "transparent",
              }}
            >
              <img
                src={buttonConfirm}
                width={20}
                height={20}
                alt="Confirm"
                style={{ display: "block" }}
              />
            </button>
          </>
        )}
      </div>

      {/* hint when locked */}
      {!canEdit && message.role === "user" && (
        <div style={styles.lockedHint}>Редактирование больше недоступно</div>
      )}
    </div>
  );
};

export const styles = {
  p: {
    margin: "6px 0",
    lineHeight: 1.6,
  },

  strong: {
    fontWeight: 600,
  },

  em: {
    fontStyle: "italic",
  },

  ul: {
    paddingLeft: 20,
    margin: "6px 0",
  },

  ol: {
    paddingLeft: 20,
    margin: "6px 0",
  },

  li: {
    marginBottom: 4,
  },

  table: {
    borderCollapse: "collapse",
    marginTop: 8,
    marginBottom: 8,
    width: "100%",
    fontSize: 14,
  },

  th: {
    border: "1px solid #DDD",
    padding: "6px 8px",
    background: "#F5F5F5",
    fontWeight: 600,
    textAlign: "left",
  },

  td: {
    border: "1px solid #DDD",
    padding: "6px 8px",
  },

  inlineCode: {
    background: "#2D2D2D",
    color: "#E6E6E6",
    padding: "2px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },

  codeBlock: {
    borderRadius: 8,
    fontSize: 13,
    marginTop: 8,
  },

  bubble: {
    background: "#FFFFFF",
    padding: 16,
    borderRadius: 7,
    color: "#000000",
    maxWidth: 410,

    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
  },
  attachments: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  file: {
    fontSize: 12,
    opacity: 0.8,
  },

  textarea: {
    width: "100%",
    minHeight: 19.2,
    background: "transparent",
    border: "none",
    outline: "none",
    overflowY: "none",
    padding: 0,
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: 1.4,
    resize: "none",
    overflow: "hidden",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  actions: {
    display: "flex",
    alignSelf: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 7,
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

  lockedHint: {
    position: "absolute",
    right: 0,
    bottom: -16,
    fontSize: 11,
    opacity: 0.45,
    whiteSpace: "nowrap",
  },
};
