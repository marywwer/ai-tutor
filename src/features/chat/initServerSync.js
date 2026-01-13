import { useChatStore } from "../../entities/chat/store";
import { loadChatState, saveChatState } from "../../shared/api/chatState";
import { debounce } from "../../shared/lib/debounce";

export async function initServerSync() {
  const store = useChatStore.getState();
  const info = store.widgetInfo;

  if (!info) return;

  const { userId, widgetId } = info;

  /* ---------- LOAD ---------- */
  try {
    const serverState = await loadChatState({ userId, widgetId });

    if (serverState) {
      useChatStore.setState((prev) => ({
        ...prev,
        ...serverState,
      }));
    }
  } catch (e) {
    console.warn("Server state load failed:", e);
  }

  /* ---------- SAVE (debounced) ---------- */
  const debouncedSave = debounce((state) => {
    saveChatState({
      userId,
      widgetId,
      state,
    }).catch((e) => {
      console.warn("Server save failed:", e);
    });
  }, 1500);

  /* ---------- SUBSCRIBE ---------- */
  useChatStore.subscribe((state) => {
    if (!state.widgetInfo) return;

    debouncedSave({
      chats: state.chats,
      activeChatId: state.activeChatId,
      sidebarOpen: state.sidebarOpen,
      materialsOpen: state.materialsOpen,
    });
  });
}
