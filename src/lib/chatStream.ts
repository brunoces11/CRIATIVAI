export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatStreamEvent =
  | { event: "session_start"; session_id: string }
  | { event: "delta"; text: string }
  | { event: "tool_status"; status: string }
  | { event: "done"; session_id?: string }
  | { event: "error"; message: string };

export type ConversationResponse = {
  session_id: string;
  messages: ChatMessage[];
};

export async function* parseNdjsonStream(stream: ReadableStream<Uint8Array>): AsyncGenerator<ChatStreamEvent> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const event = parseEventLine(line);
        if (event) yield event;
      }
    }

    buffer += decoder.decode();
    const event = parseEventLine(buffer);
    if (event) yield event;
  } finally {
    reader.releaseLock();
  }
}

export async function fetchCurrentConversation(sessionId: string, signal: AbortSignal): Promise<ConversationResponse | null> {
  const response = await fetch(`/api/conversations/current?session_id=${encodeURIComponent(sessionId)}`, {
    signal,
    headers: { accept: "application/json" },
  });

  if (response.status === 404 || response.status === 422) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Unable to restore the conversation.");
  }

  return response.json() as Promise<ConversationResponse>;
}

export async function sendChatMessage(
  message: string,
  sessionId: string | null,
  turnId: string,
  signal: AbortSignal,
  onEvent: (event: ChatStreamEvent) => void,
): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    signal,
    headers: {
      accept: "application/x-ndjson",
      "content-type": "application/json",
    },
    body: JSON.stringify({ message, session_id: sessionId, turn_id: turnId }),
  });

  if (!response.ok || !response.body) {
    throw new Error("Unable to reach the assistant.");
  }

  for await (const event of parseNdjsonStream(response.body)) {
    onEvent(event);
  }
}

function parseEventLine(line: string): ChatStreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const value: unknown = JSON.parse(trimmed);
  if (!value || typeof value !== "object") {
    throw new Error("Invalid stream event.");
  }

  const event = value as Record<string, unknown>;
  if (event.event === "session_start" && typeof event.session_id === "string") {
    return { event: "session_start", session_id: event.session_id };
  }
  if (event.event === "delta" && typeof event.text === "string") {
    return { event: "delta", text: event.text };
  }
  if (event.event === "tool_status" && typeof event.status === "string") {
    return { event: "tool_status", status: event.status };
  }
  if (event.event === "done") {
    return typeof event.session_id === "string" ? { event: "done", session_id: event.session_id } : { event: "done" };
  }
  if (event.event === "error" && typeof event.message === "string") {
    return { event: "error", message: event.message };
  }

  throw new Error("Unsupported stream event.");
}
