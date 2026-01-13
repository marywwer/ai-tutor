import { Handle, Position } from "@xyflow/react";
import { ErrorBoundary } from "./shared/ui/ErrorBoundary";
import { ChatPage } from "./pages/ChatPage";
import { MaterialsPanel } from "./features/materials/MaterialsPanel";
import { ChatSidebar } from "./features/chat/components/ChatSidebar";
import { useChatStore } from "./entities/chat/store";
import { IS_DEV } from "./config/env";

import "./shared/styles/theme.css";
import "katex/dist/katex.min.css";

import { useEffect } from "react";
import { initStatsSync } from "./features/chat/initStatsSync";

import { useSwipeSidebar } from "./shared/lib/useSwipeSidebar";

/**
 * AiTutorModule
 * -----------------
 * Главная точка входа AI Tutor модуля.
 * Используется платформой как iframe / npm-module.
 *
 * ⚠️ Папка /dev используется ТОЛЬКО для локальной разработки.
 */
const AiTutorModule = () => {
  const closeSidebar = useChatStore((s) => s.closeSidebar);
  const sidebarOpen = useChatStore((s) => s.sidebarOpen);

  const materialsOpen = useChatStore((s) => s.materialsOpen);

  const uiView = useChatStore((s) => s.uiView);
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  useEffect(() => {
    const unsubscribe = initStatsSync();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const openSidebar = useChatStore((s) => s.openSidebar);
  const openChat = useChatStore((s) => s.openChat);

  const swipeHandlers = useSwipeSidebar({
    onOpen: () => {
      if (!isMobile) return;
      // открываем список чатов
      if (uiView !== "sidebar") openSidebar?.();
    },
    onClose: () => {
      if (!isMobile) return;
      // закрываем сайдбар => возвращаемся в чат
      if (uiView === "sidebar") openChat?.();
    },
  });

  return (
    <ErrorBoundary>
      <div className="ai-tutor-root" {...swipeHandlers}>
        {!IS_DEV && (
          <>
            <Handle type="target" position={Position.Left} />
            <Handle type="source" position={Position.Right} />
          </>
        )}

        {/* =========================
            MOBILE: 1 экран за раз
           ========================= */}
        {isMobile ? (
          <>
            {uiView === "chat" && <ChatPage />}
            {uiView === "sidebar" && <ChatSidebar />}
            {uiView === "materials" && <MaterialsPanel />}
          </>
        ) : (
          /* =========================
             DESKTOP: как было (overlay/sidebar + materials)
             ========================= */
          <div style={styles.centerContainer}>
            <div style={styles.sidebarWrapper}>
              {sidebarOpen && (
                <>
                  <div className="sidebar-backdrop" onClick={closeSidebar} />
                  <ChatSidebar />
                </>
              )}
            </div>

            {materialsOpen ? <MaterialsPanel /> : <ChatPage />}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AiTutorModule;

const styles = {
  centerContainer: {
    position: "relative",
    display: "flex",
    alignItems: "flex-start",
  },

  sidebarWrapper: {
    right: "100%",
    top: 0,
  },
};
