export function closeModule() {
  /** 
  // DEV — просто логируем
  if (import.meta.env.DEV) {
    console.log(" Close module requested (DEV)");
    return;
  }*/

  // PROD — отправляем событие хосту
  window.parent?.postMessage(
    {
      type: "AI_TUTOR_MODULE_CLOSE",
      payload: {
        source: "ai-tutor",
        timestamp: Date.now(),
      },
    },
    "*"
  );
}
