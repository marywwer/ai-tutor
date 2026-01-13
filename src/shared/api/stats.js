const STAT_API_URL =
  "http://85.234.22.160:1111/api/stats/module/metrics";

let moduleToken = null;

export const setStatToken = (token) => {
  moduleToken = token;
};

export const sendStats = async (payload) => {
  if (!moduleToken) return;

  try {
    const res = await fetch(STAT_API_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEV_TOKEN}`,
        "X-Module-Token": moduleToken,
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 429) {
      console.warn("[Stats] Rate limit exceeded");
      return;
    }

    if (!res.ok) {
      console.error("[Stats] Error", await res.text());
    }
  } catch (e) {
    console.error("[Stats] Network error", e);
  }
};