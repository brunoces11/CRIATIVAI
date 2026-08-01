export const CHAT_OPEN_EVENT = "criativai:open-chat";

export type ChatContext = {
  page: string;
  section?: string;
  section_title?: string;
  card_type?: string;
  card?: string;
  step?: string;
  button?: string;
};

type OpenChatEventDetail = {
  contextTag?: string;
};

const CONTEXT_TAG_NAME = "CTA_CONTEXT";

export function openAssistantChat(context?: ChatContext) {
  window.dispatchEvent(
    new CustomEvent<OpenChatEventDetail>(CHAT_OPEN_EVENT, {
      detail: context ? { contextTag: buildChatContextTag(context) } : undefined,
    }),
  );
}

export function buildChatContextTag(context: ChatContext) {
  const entries = Object.entries(context)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
    .map(([key, value]) => `${key}="${escapeTagValue(value)}"`);

  return `[${CONTEXT_TAG_NAME} ${entries.join(" ")}]`;
}

export function getChatContextTag(event: Event) {
  if (!(event instanceof CustomEvent)) return null;

  const detail: unknown = event.detail;
  if (!detail || typeof detail !== "object") return null;

  const contextTag = (detail as OpenChatEventDetail).contextTag;
  return typeof contextTag === "string" && contextTag.trim().length > 0 ? contextTag : null;
}

export function attachChatContextTag(draft: string, contextTag: string) {
  const cleanDraft = draft
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith(`[${CONTEXT_TAG_NAME}`))
    .join("\n")
    .trim();
  return cleanDraft ? `${cleanDraft}\n${contextTag}` : contextTag;
}

function escapeTagValue(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\]/g, ")");
}
