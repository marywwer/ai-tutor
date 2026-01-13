import { sendStats } from "../../shared/api/stats";
import { debounce } from "../../shared/lib/debounce";
import { useChatStore } from "../../entities/chat/store";

export const initStatsSync = () => {
  const debouncedSend = debounce((stateSnapshot) => {
    //  не шлём статистику без привязки к виджету
    if (!stateSnapshot.widgetInfo?.widgetId) return;

    const totalMessages = stateSnapshot.chats.reduce(
      (acc, c) => acc + c.messages.length,
      0
    );

    sendStats({
      meta: {
        module: "ai-tutor",
        widgetId: stateSnapshot.widgetInfo.widgetId,
        userId: stateSnapshot.widgetInfo.userId,
        updatedAt: new Date().toISOString(),
      },
      usage: {
        totalChats: stateSnapshot.chats.length,
        totalMessages,
      },
      state: {
        activeChatId: stateSnapshot.activeChatId,
        materialsOpened: stateSnapshot.materialsOpen,
      },
    });
  }, 10_000);

  //  подписываемся только на значимые поля
  const unsubscribe = useChatStore.subscribe(
    (state) => ({
      chats: state.chats,
      activeChatId: state.activeChatId,
      materialsOpen: state.materialsOpen,
      widgetInfo: state.widgetInfo,
    }),
    (current, prev) => {
      if (JSON.stringify(current) !== JSON.stringify(prev)) {
        debouncedSend(current);
      }
    }
  );

  return unsubscribe;
};
