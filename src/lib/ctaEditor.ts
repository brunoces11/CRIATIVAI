export const CTA_EDITOR_TOKEN_STORAGE_KEY = "cta_editor_token";
export const CTA_EDITOR_STATUS_EVENT = "criativai:cta-editor-status";

export type CtaEditorStatus = {
  enabled: boolean;
  state_path: string;
  token?: string | null;
  token_valid: boolean;
  token_expires_at?: string | null;
};

export type CtaMessages = {
  welcome_key: string;
  welcome_message: string;
  context_message: string;
};

export function getStoredCtaEditorToken() {
  const localToken = window.localStorage.getItem(CTA_EDITOR_TOKEN_STORAGE_KEY);
  if (localToken) return localToken;

  const sessionToken = window.sessionStorage.getItem(CTA_EDITOR_TOKEN_STORAGE_KEY);
  if (sessionToken) {
    window.localStorage.setItem(CTA_EDITOR_TOKEN_STORAGE_KEY, sessionToken);
    window.sessionStorage.removeItem(CTA_EDITOR_TOKEN_STORAGE_KEY);
  }
  return sessionToken;
}

export function storeCtaEditorToken(token: string) {
  window.localStorage.setItem(CTA_EDITOR_TOKEN_STORAGE_KEY, token);
  resetCtaEditorStatusCache();
  window.dispatchEvent(new Event(CTA_EDITOR_STATUS_EVENT));
}

export function clearCtaEditorToken() {
  window.localStorage.removeItem(CTA_EDITOR_TOKEN_STORAGE_KEY);
  resetCtaEditorStatusCache();
  window.dispatchEvent(new Event(CTA_EDITOR_STATUS_EVENT));
}

export function resetCtaEditorStatusCache() {
  return;
}

export async function fetchCtaEditorStatus(signal?: AbortSignal): Promise<CtaEditorStatus> {
  const token = getStoredCtaEditorToken();
  const response = await fetch("/api/admin/cta-editor", {
    signal,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(token ? { "x-cta-editor-token": token } : {}),
    },
  });
  if (!response.ok) throw new Error("Unable to load CTA editor status.");
  return response.json() as Promise<CtaEditorStatus>;
}

export function canShowCtaEditor(signal?: AbortSignal): Promise<boolean> {
  return fetchCtaEditorStatus(signal)
    .then((status) => {
      const visible = status.enabled && status.token_valid;
      if (!status.token_valid) window.localStorage.removeItem(CTA_EDITOR_TOKEN_STORAGE_KEY);
      return visible;
    })
    .catch(() => {
      return false;
    });
}

export async function loadCtaMessages(welcomeKey: string, signal?: AbortSignal): Promise<CtaMessages> {
  const token = getStoredCtaEditorToken();
  const response = await fetch(`/api/admin/cta-editor/messages/${encodeWelcomeKeyForPath(welcomeKey)}`, {
    signal,
    cache: "no-store",
    headers: {
      accept: "application/json",
      ...(token ? { "x-cta-editor-token": token } : {}),
    },
  });
  if (!response.ok) throw new Error("Unable to load CTA messages.");
  return response.json() as Promise<CtaMessages>;
}

export async function saveCtaMessages(welcomeKey: string, welcomeMessage: string, contextMessage: string): Promise<CtaMessages> {
  const token = getStoredCtaEditorToken();
  const response = await fetch(`/api/admin/cta-editor/messages/${encodeWelcomeKeyForPath(welcomeKey)}`, {
    method: "PUT",
    cache: "no-store",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(token ? { "x-cta-editor-token": token } : {}),
    },
    body: JSON.stringify({
      welcome_message: welcomeMessage,
      context_message: contextMessage,
    }),
  });
  if (!response.ok) throw new Error("Unable to save CTA messages.");
  return response.json() as Promise<CtaMessages>;
}

function encodeWelcomeKeyForPath(welcomeKey: string) {
  return welcomeKey.split("/").map(encodeURIComponent).join("/");
}
