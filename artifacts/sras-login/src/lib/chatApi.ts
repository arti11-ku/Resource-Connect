// Calls the Gemini-backed chat endpoint exposed by the API server.
// API server is mounted at /api on the same domain via the Replit workspace proxy.

export interface GeminiMsg {
  role: "user" | "model";
  text: string;
}

export interface GeminiChatRequest {
  messages: GeminiMsg[];
  role?: string;
  username?: string;
}

const API_BASE: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export async function geminiChat(req: GeminiChatRequest): Promise<string> {
  const url = `${API_BASE}/api/chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    let detail = `Chat failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string; detail?: string };
      detail = data.detail || data.error || detail;
    } catch {}
    throw new Error(detail);
  }
  const data = (await res.json()) as { text?: string };
  return (data.text ?? "").trim();
}
