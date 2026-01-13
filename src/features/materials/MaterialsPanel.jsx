import React, { useEffect, useState } from "react";
import { useChatStore } from "../../entities/chat/store";
import { fetchMaterials } from "../../shared/api/materials";

import crossToExit from "../../image/times-square.svg";
import buttonToLink from "../../image/link.svg";

/**
 * Панель с учебными материалами
 */
export const MaterialsPanel = () => {
  const closeMaterials = useChatStore((s) => s.closeMaterials);

  /* =========================
     UI state
     ========================= */
  const [hoverClose, setHoverClose] = useState(false);
  const [hoveredLinkId, setHoveredLinkId] = useState(null);

  /* =========================
     Data state
     ========================= */
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     Fetch materials
     ========================= */
  useEffect(() => {
    const controller = new AbortController();

    fetchMaterials({ signal: controller.signal })
      .then((data) => {
        setMaterials(data.materials);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError("Не удалось загрузить материалы");
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  /* =========================
     Handlers
     ========================= */
  const openLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={styles.wrapper} className="chat-scroll materials-panel">
      {/* HEADER */}
      <div style={styles.header}>
        <span style={styles.title}>Материалы</span>

        <button
          onClick={closeMaterials}
          onMouseEnter={() => setHoverClose(true)}
          onMouseLeave={() => setHoverClose(false)}
          style={{
            ...styles.icon,
            background: hoverClose ? "#333333" : "transparent",
          }}
        >
          <img src={crossToExit} width={38} height={38} alt="Close" />
        </button>
      </div>

      {/* CONTENT */}
      <div style={styles.list}>
        {loading && <span>Загрузка...</span>}
        {error && <span>{error}</span>}

        {!loading &&
          !error &&
          materials.map((m) => (
            <div key={m.id} style={styles.item}>
              <span style={styles.materialTitle}>{m.title}</span>

              <button
                onClick={() => openLink(m.url)}
                onMouseEnter={() => setHoveredLinkId(m.id)}
                onMouseLeave={() => setHoveredLinkId(null)}
                style={{
                  ...styles.icon,
                  background:
                    hoveredLinkId === m.id ? "#333333" : "transparent",
                }}
              >
                <img
                  src={buttonToLink}
                  width={24}
                  height={24}
                  alt="Open link"
                />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    color: "#FFFFFF",
    background: "#1C1C1C",
    border: "5px solid #000000",
    borderRadius: 15,
    display: "flex",
    flexDirection: "column",
    height: 779,
    width: 681,
    marginTop: 50,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottom: "1px solid #222",
  },

  title: {
    fontSize: 22,
    fontWeight: 600,
    opacity: 0.9,
  },

  list: {
    padding: 10,
    display: "flex",
    flexDirection: "column",
    gap: 43,
    overflowY: "auto",
    marginTop: 20,
    flex: 1, 
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 43,
    marginRight: 15,
    fontSize: 26,
    fontWeight: 500,
  },

  materialTitle: {
    width: 571,
    borderBottom: "1px solid #FFFFFF",
    paddingBottom: 6,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
