import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { CHAT_OPEN_EVENT, getChatWelcomeKey } from "../lib/chatContext";
import { createWelcomeConversation, fetchCurrentConversation, sendChatMessage, type PendingWelcomeContext } from "../lib/chatStream";
import { MarkdownText } from "./MarkdownText";
import "./ChatWidget.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SESSION_STORAGE_KEY = "chat_session_id";
const CHAT_QUERY_PARAM = "chat";
const CHAT_QUERY_NEW_VALUE = "new";

type ChatMultiWindowStatus = {
  enabled: boolean;
  state_path: string;
};

type IceBreaker = {
  message: string;
  icon: "idea" | "growth" | "automation" | "calendar" | "support" | "training";
};

type ChatPanelSize = {
  width: number;
  height: number;
};

type ResizeDirection = "left" | "top" | "top-left";

const iceBreakers: IceBreaker[] = [
  { message: "I want to discuss my project idea.", icon: "idea" },
  { message: "I want to increase my lead capture and conversion.", icon: "growth" },
  { message: "I want to automate my business operations.", icon: "automation" },
  { message: "I want to book a call with Bruno.", icon: "calendar" },
  { message: "I want to build a customer support agent.", icon: "support" },
  { message: "I want to hire consulting or personalized training.", icon: "training" },
];

const CHAT_PANEL_DEFAULT_SIZE: ChatPanelSize = { width: 840, height: 540 };
const CHAT_PANEL_MIN_SIZE: ChatPanelSize = { width: 300, height: 300 };
const CHAT_PANEL_MAX_SIZE: ChatPanelSize = { width: 950, height: 650 };
const WELCOME_LOADING_DURATION_MS = 2000;
const WELCOME_STREAM_INTERVAL_MS = 18;
const WELCOME_STREAM_CHUNK_SIZE = 4;

const initialMessages: Message[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    text: "Hi. I can help you think through AI opportunities and next steps.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [renderPanel, setRenderPanel] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcomeRequesting, setWelcomeRequesting] = useState(false);
  const [welcomeLoading, setWelcomeLoading] = useState(false);
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [toolStatus, setToolStatus] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => readStoredSessionId());
  const [pendingWelcome, setPendingWelcome] = useState<PendingWelcomeContext | null>(null);
  const [panelSize, setPanelSize] = useState(() => clampChatPanelSize(CHAT_PANEL_DEFAULT_SIZE));
  const [newChatEnabled, setNewChatEnabled] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const restoreAbortRef = useRef<AbortController | null>(null);
  const welcomeAbortRef = useRef<AbortController | null>(null);
  const welcomeTimerRef = useRef<number | null>(null);
  const welcomeRunRef = useRef(0);
  const closeTimerRef = useRef<number | null>(null);
  const restoredRef = useRef(false);

  function openChat() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setRenderPanel(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  useEffect(() => {
    function handleOpenChat(event: Event) {
      const welcomeKey = getChatWelcomeKey(event);
      openChat();
      if (welcomeKey) {
        void startWelcomeConversation(welcomeKey);
      }
    }

    window.addEventListener(CHAT_OPEN_EVENT, handleOpenChat);
    return () => window.removeEventListener(CHAT_OPEN_EVENT, handleOpenChat);
  }, []);

  function closeChat() {
    setOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setRenderPanel(false);
      closeTimerRef.current = null;
    }, 220);
  }

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/admin/chat-multi-window", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load chat multi-window status.");
        return response.json() as Promise<ChatMultiWindowStatus>;
      })
      .then((payload) => setNewChatEnabled(payload.enabled))
      .catch(() => {
        setNewChatEnabled(true);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!shouldStartFreshChatWindow()) return;

    resetConversationState();
    openChat();
    clearFreshChatWindowQuery();
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || restoredRef.current || !sessionId) return;

    const controller = new AbortController();
    restoreAbortRef.current = controller;
    restoredRef.current = true;
    setRestoring(true);
    setError("");

    fetchCurrentConversation(sessionId, controller.signal)
      .then((conversation) => {
        if (!conversation) {
          clearStoredSessionId();
          setSessionId(null);
          setPendingWelcome(null);
          setMessages(initialMessages);
          return;
        }

        setMessages(
          conversation.messages.map((message, index) => ({
            id: `${message.role}-${index}-${message.content.length}`,
            role: message.role,
            text: message.content,
          })),
        );
      })
      .catch((restoreError: unknown) => {
        if (controller.signal.aborted) return;
        setError(restoreError instanceof Error ? restoreError.message : "Unable to restore the conversation.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setRestoring(false);
        if (restoreAbortRef.current === controller) restoreAbortRef.current = null;
      });

    return () => {
      controller.abort();
      if (restoreAbortRef.current === controller) restoreAbortRef.current = null;
    };
  }, [open, sessionId]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      restoreAbortRef.current?.abort();
      welcomeAbortRef.current?.abort();
      stopWelcomeStream();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    function clampCurrentPanelSize() {
      setPanelSize((current) => clampChatPanelSize(current));
    }

    window.addEventListener("resize", clampCurrentPanelSize);
    return () => window.removeEventListener("resize", clampCurrentPanelSize);
  }, []);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior });
  }, [messages, loading, welcomeRequesting, welcomeLoading]);

  async function startWelcomeConversation(welcomeKey: string) {
    const runId = welcomeRunRef.current + 1;
    welcomeRunRef.current = runId;
    abortRef.current?.abort();
    restoreAbortRef.current?.abort();
    welcomeAbortRef.current?.abort();
    stopWelcomeStream();

    const controller = new AbortController();
    welcomeAbortRef.current = controller;
    restoredRef.current = true;
    clearStoredSessionId();
    setSessionId(null);
    setMessages([]);
    setDraft("");
    setError("");
    setToolStatus("");
    setLoading(false);
    setAssistantStarted(false);
    setRestoring(false);
    setWelcomeRequesting(true);
    setWelcomeLoading(true);
    setPendingWelcome(null);

    try {
      const startedAt = Date.now();
      const welcome = await createWelcomeConversation(welcomeKey, controller.signal);
      if (welcomeRunRef.current !== runId) return;

      const elapsed = Date.now() - startedAt;
      const remainingDelay = Math.max(0, WELCOME_LOADING_DURATION_MS - elapsed);
      if (remainingDelay > 0) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, remainingDelay);
        });
      }

      if (controller.signal.aborted || welcomeRunRef.current !== runId) return;

      setWelcomeLoading(false);
      setPendingWelcome({ key: welcomeKey, message: welcome.message });
      streamWelcomeMessage(welcome.message, runId);
    } catch (welcomeError: unknown) {
      if (controller.signal.aborted || welcomeRunRef.current !== runId) return;
      setError(welcomeError instanceof Error ? welcomeError.message : "Unable to prepare the chat welcome message.");
      setMessages(initialMessages);
      setWelcomeLoading(false);
      setWelcomeRequesting(false);
    } finally {
      if (welcomeAbortRef.current === controller) welcomeAbortRef.current = null;
    }
  }

  function streamWelcomeMessage(fullText: string, runId: number) {
    const messageId = crypto.randomUUID();
    setMessages([{ id: messageId, role: "assistant", text: "" }]);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMessages([{ id: messageId, role: "assistant", text: fullText }]);
      if (welcomeRunRef.current === runId) setWelcomeRequesting(false);
      return;
    }

    let nextLength = 0;
    welcomeTimerRef.current = window.setInterval(() => {
      if (welcomeRunRef.current !== runId) {
        stopWelcomeStream();
        return;
      }

      nextLength = Math.min(fullText.length, nextLength + WELCOME_STREAM_CHUNK_SIZE);
      const visibleText = fullText.slice(0, nextLength);
      setMessages((current) =>
        current.map((message) => (message.id === messageId ? { ...message, text: visibleText } : message)),
      );

      if (nextLength >= fullText.length) {
        stopWelcomeStream();
        if (welcomeRunRef.current === runId) setWelcomeRequesting(false);
      }
    }, WELCOME_STREAM_INTERVAL_MS);
  }

  function stopWelcomeStream() {
    if (welcomeTimerRef.current !== null) {
      window.clearInterval(welcomeTimerRef.current);
      welcomeTimerRef.current = null;
    }
  }

  async function sendMessage(message: string, shouldRefocusInput: boolean) {
    if (!message || loading || restoring || welcomeRequesting) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    const assistantMessageId = crypto.randomUUID();
    const turnId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError("");
    setToolStatus("");
    setAssistantStarted(false);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let assistantText = "";
      await sendChatMessage(message, sessionId, turnId, controller.signal, pendingWelcome, (streamEvent) => {
        if (streamEvent.event === "session_start") {
          setSessionId(streamEvent.session_id);
          storeSessionId(streamEvent.session_id);
          setPendingWelcome(null);
          return;
        }

        if (streamEvent.event === "delta") {
          assistantText += streamEvent.text;
          setAssistantStarted(true);
          setMessages((current) => {
            const assistantMessage: Message = { id: assistantMessageId, role: "assistant", text: assistantText };
            const exists = current.some((item) => item.id === assistantMessageId);
            return exists
              ? current.map((item) => (item.id === assistantMessageId ? assistantMessage : item))
              : [...current, assistantMessage];
          });
          return;
        }

        if (streamEvent.event === "tool_status") {
          setToolStatus(streamEvent.message);
          return;
        }

        if (streamEvent.event === "error") {
          throw new Error(streamEvent.message);
        }

        if (streamEvent.event === "done" && streamEvent.session_id) {
          setSessionId(streamEvent.session_id);
          storeSessionId(streamEvent.session_id);
        }
      });
    } catch (sendError: unknown) {
      if (!controller.signal.aborted) {
        setError(sendError instanceof Error ? sendError.message : "Unable to reach the assistant.");
        setMessages((current) => current.filter((item) => item.id !== assistantMessageId));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setToolStatus("");
      setLoading(false);
      setAssistantStarted(false);
      if (shouldRefocusInput) {
        window.requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    }
  }

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    const shouldRefocusInput = document.activeElement === inputRef.current;
    await sendMessage(message, shouldRefocusInput);
  }

  function startWithIceBreaker(message: string) {
    void sendMessage(message, false);
  }

  function openNewChatWindow() {
    const url = new URL(window.location.href);
    url.searchParams.set(CHAT_QUERY_PARAM, CHAT_QUERY_NEW_VALUE);
    const features = "popup=yes,width=460,height=760,noopener,noreferrer";
    const openedWindow = window.open(url.toString(), "_blank", features);

    if (openedWindow) {
      return;
    }

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }

  function resetConversationState() {
    welcomeRunRef.current += 1;
    abortRef.current?.abort();
    restoreAbortRef.current?.abort();
    welcomeAbortRef.current?.abort();
    stopWelcomeStream();
    clearStoredSessionId();
    restoredRef.current = false;
    setSessionId(null);
    setPendingWelcome(null);
    setMessages(initialMessages);
    setDraft("");
    setError("");
    setToolStatus("");
    setLoading(false);
    setWelcomeRequesting(false);
    setWelcomeLoading(false);
    setAssistantStarted(false);
    setRestoring(false);
  }

  function startPanelResize(event: ReactPointerEvent<HTMLDivElement>, direction: ResizeDirection) {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const startSize = panelSize;
    const originalCursor = document.body.style.cursor;
    const originalUserSelect = document.body.style.userSelect;

    document.body.style.cursor = direction === "left" ? "ew-resize" : direction === "top" ? "ns-resize" : "nwse-resize";
    document.body.style.userSelect = "none";

    function handlePointerMove(moveEvent: PointerEvent) {
      const nextSize = { ...startSize };

      if (direction.includes("left")) {
        nextSize.width = startSize.width + startX - moveEvent.clientX;
      }

      if (direction.includes("top")) {
        nextSize.height = startSize.height + startY - moveEvent.clientY;
      }

      setPanelSize(clampChatPanelSize(nextSize));
    }

    function stopPanelResize() {
      document.body.style.cursor = originalCursor;
      document.body.style.userSelect = originalUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopPanelResize);
      window.removeEventListener("pointercancel", stopPanelResize);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopPanelResize);
    window.addEventListener("pointercancel", stopPanelResize);
  }

  const showIceBreakers =
    !sessionId &&
    !loading &&
    !restoring &&
    messages.length === initialMessages.length &&
    messages.every((message, index) => message.id === initialMessages[index]?.id);
  const panelStyle = {
    "--chat-panel-width": `${panelSize.width}px`,
    "--chat-panel-height": `${panelSize.height}px`,
  } as CSSProperties;

  return (
    <aside className={`chat-widget${open ? " chat-widget--open" : ""}`} aria-label="AI chat assistant">
      {renderPanel ? (
        <section className="chat-panel" style={panelStyle} aria-label="Chat conversation">
          <div className="chat-panel__resize-handle chat-panel__resize-handle--left" aria-hidden="true" onPointerDown={(event) => startPanelResize(event, "left")} />
          <div className="chat-panel__resize-handle chat-panel__resize-handle--top" aria-hidden="true" onPointerDown={(event) => startPanelResize(event, "top")} />
          <div className="chat-panel__resize-handle chat-panel__resize-handle--top-left" aria-hidden="true" onPointerDown={(event) => startPanelResize(event, "top-left")} />
          <header className="chat-panel__header">
            <div className="chat-panel__identity">
              <img className="chat-panel__avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
              <div className="chat-panel__identity-copy">
                <p className="chat-panel__eyebrow">BRUNO CESAR AI ASSISTANT</p>
                <h2>Ask your questions and book a call</h2>
              </div>
            </div>
            <div className="chat-panel__header-actions">
              {newChatEnabled ? (
                <button
                  className="chat-panel__new-chat"
                  type="button"
                  aria-label="Open a new chat window"
                  title="Open a new chat window"
                  onClick={openNewChatWindow}
                >
                  <NewChatIcon />
                </button>
              ) : null}
              <button className="chat-panel__collapse" type="button" aria-label="Collapse chat" title="Collapse chat" onClick={closeChat}>
                <img className="chat-panel__collapse-icon" src="/icons/chat-collapse.svg" alt="" aria-hidden="true" />
              </button>
            </div>
          </header>

          <div className="chat-panel__messages" ref={transcriptRef} aria-live="polite">
            {restoring ? <p className="chat-panel__status">Restoring conversation...</p> : null}
            {messages.map((message) => (
              <article key={message.id} className={`chat-message chat-message--${message.role}`}>
                {message.role === "assistant" ? (
                  <>
                    <img className="chat-message__avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
                    <MarkdownText text={message.text} />
                  </>
                ) : (
                  <p>{message.text}</p>
                )}
              </article>
            ))}
            {showIceBreakers ? (
              <div className="chat-panel__ice-breakers" aria-label="Conversation starters">
                {iceBreakers.map((iceBreaker) => (
                  <button key={iceBreaker.message} type="button" onClick={() => startWithIceBreaker(iceBreaker.message)}>
                    <IceBreakerIcon type={iceBreaker.icon} />
                    <span className="chat-panel__ice-breaker-label">{iceBreaker.message}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {welcomeLoading ? (
              <div className="chat-message chat-message--assistant chat-message--welcome-loading" aria-label="Contacting Agent...">
                <img className="chat-message__avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
                <div className="chat-message__welcome-loader">
                  <span className="chat-message__spinner" aria-hidden="true" />
                  <p>Contacting Agent...</p>
                </div>
              </div>
            ) : null}
            {loading && !assistantStarted ? (
              <div className="chat-message chat-message--assistant chat-message--loading" aria-label="Assistant is preparing a response">
                <img className="chat-message__avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
                <div className="chat-message__loading-dots">
                <span />
                <span />
                <span />
                </div>
              </div>
            ) : null}
          </div>

          {toolStatus || error ? (
            <div className="chat-panel__feedback">
              {toolStatus ? <p className="chat-panel__status">{toolStatus}</p> : null}
              {error ? <p className="chat-panel__error">{error}</p> : null}
            </div>
          ) : null}

          <form className="chat-panel__form" onSubmit={submitMessage}>
            <label className="sr-only" htmlFor="chat-message">Message</label>
            <textarea
              id="chat-message"
              ref={inputRef}
              value={draft}
              rows={2}
              maxLength={2000}
              placeholder="Type your message"
              disabled={loading || restoring}
              onChange={(event) => {
                setDraft(event.target.value);
                if (error) setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <button type="submit" disabled={!draft.trim() || loading || restoring || welcomeRequesting} aria-label="Send message" title="Send message">
              <img className="chat-panel__form-icon" src="/icons/chat-send.svg" alt="" aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : (
        <button className="chat-launcher" type="button" aria-label="Open AI chat" title="Open AI chat" onClick={() => openChat()}>
          <img className="chat-launcher__icon" src="/icons/chat-launcher.svg" alt="" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}

function readStoredSessionId() {
  const sessionValue = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (sessionValue) {
    return sessionValue;
  }

  const legacyValue = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!legacyValue) {
    return null;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, legacyValue);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  return legacyValue;
}

function storeSessionId(sessionId: string) {
  window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function clearStoredSessionId() {
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

function shouldStartFreshChatWindow() {
  return new URLSearchParams(window.location.search).get(CHAT_QUERY_PARAM) === CHAT_QUERY_NEW_VALUE;
}

function clearFreshChatWindowQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete(CHAT_QUERY_PARAM);
  window.history.replaceState({}, "", url.toString());
}

function clampChatPanelSize(size: ChatPanelSize): ChatPanelSize {
  const viewportWidth = Math.max(CHAT_PANEL_MIN_SIZE.width, window.innerWidth - 32);
  const viewportHeightGap = window.innerWidth <= 560 ? 112 : 136;
  const viewportHeight = Math.max(CHAT_PANEL_MIN_SIZE.height, window.innerHeight - viewportHeightGap);
  const maxWidth = Math.min(CHAT_PANEL_MAX_SIZE.width, viewportWidth);
  const maxHeight = Math.min(CHAT_PANEL_MAX_SIZE.height, viewportHeight);

  return {
    width: clamp(size.width, CHAT_PANEL_MIN_SIZE.width, maxWidth),
    height: clamp(size.height, CHAT_PANEL_MIN_SIZE.height, maxHeight),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function NewChatIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 5v14M5 12h14M5 6.75h2.25M16.25 6.75H19M5 17.25h5.25M14.75 17.25H19"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function IceBreakerIcon({ type }: { type: IceBreaker["icon"] }) {
  const iconPaths: Record<IceBreaker["icon"], ReactNode> = {
    idea: (
      <>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8 11a4 4 0 1 1 8 0c0 1.7-1 2.6-1.8 3.4-.5.5-.9 1-.9 1.6h-2.6c0-.6-.4-1.1-.9-1.6C9 13.6 8 12.7 8 11Z" />
        <path d="M12 3V1.8" />
        <path d="m18.4 5.6.9-.9" />
        <path d="m5.6 5.6-.9-.9" />
      </>
    ),
    growth: (
      <>
        <path d="M4 18V6" />
        <path d="M4 18h16" />
        <path d="m7 15 4-4 3 3 5-7" />
        <path d="M15 7h4v4" />
      </>
    ),
    automation: (
      <>
        <path d="M6 12a6 6 0 0 1 10.2-4.3" />
        <path d="M16 4v4h-4" />
        <path d="M18 12a6 6 0 0 1-10.2 4.3" />
        <path d="M8 20v-4h4" />
      </>
    ),
    calendar: (
      <>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M4 10h16" />
        <path d="m9 15 2 2 4-4" />
      </>
    ),
    support: (
      <>
        <path d="M5 12a7 7 0 0 1 14 0v3a3 3 0 0 1-3 3h-2" />
        <path d="M5 12v3a2 2 0 0 0 2 2h1v-6H7a2 2 0 0 0-2 1Z" />
        <path d="M19 12v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 1Z" />
      </>
    ),
    training: (
      <>
        <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
        <path d="M7 10v4.5c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V10" />
        <path d="M20 8v5" />
      </>
    ),
  };

  return (
    <span className="chat-panel__ice-breaker-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        {iconPaths[type]}
      </svg>
    </span>
  );
}
