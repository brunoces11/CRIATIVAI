export const CHAT_OPEN_EVENT = "criativai:open-chat";

type OpenChatEventDetail = {
  welcomeKey?: string;
};

export function openAssistantChat(options?: OpenChatEventDetail) {
  window.dispatchEvent(
    new CustomEvent<OpenChatEventDetail>(CHAT_OPEN_EVENT, {
      detail: options?.welcomeKey ? { welcomeKey: options.welcomeKey } : undefined,
    }),
  );
}

export function getChatWelcomeKey(event: Event) {
  if (!(event instanceof CustomEvent)) return null;

  const detail: unknown = event.detail;
  if (!detail || typeof detail !== "object") return null;

  const welcomeKey = (detail as OpenChatEventDetail).welcomeKey;
  return typeof welcomeKey === "string" && welcomeKey.trim().length > 0 ? welcomeKey : null;
}
