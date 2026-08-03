const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-repo`;

export type Msg = { role: "user" | "assistant"; content: string };

export async function streamAI({
  messages,
  repoUrl,
  readme,
  repoInfo,
  action,
  onDelta,
  onDone,
  onError,
}: {
  messages?: Msg[];
  repoUrl?: string;
  readme?: string;
  repoInfo?: Record<string, unknown>;
  action: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, repoUrl, readme, repoInfo, action }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) { onError?.("Rate limit exceeded. Please wait and try again."); return; }
    if (resp.status === 402) { onError?.("Credits exhausted. Please add funds."); return; }
    onError?.("Failed to connect to AI service."); return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}