export async function fetchMaterialsMock() {
  // имитация задержки сети
  await new Promise((r) => setTimeout(r, 400));

  return {
    materials: [
      {
        id: 1,
        title: "Что такое AI-bot?",
        url: "https://merlin-staging.vercel.app/ru/blogs/ai-chatbot/ai-chatbot-how-does-chatbot-work",
      },
      {
        id: 2,
        title: "Интегралы — Шпаргалка",
        url: "https://in.lit.msu.ru/media/Ulysses/irina.nemirovskaya/2018/шпаргалка_интеграл.pdf",
      },
      {
        id: 3,
        title: "Простое объяснение рядов",
        url: "https://mathprofi.ru/ryady_dlya_chajnikov.html",
      },
    ],
  };
}
