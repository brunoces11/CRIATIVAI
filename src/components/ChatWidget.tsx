import { FormEvent, useEffect, useRef, useState } from "react";
import { fetchCurrentConversation, sendChatMessage } from "../lib/chatStream";
import "./ChatWidget.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const SESSION_STORAGE_KEY = "chat_session_id";

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
  const [restoring, setRestoring] = useState(false);
  const [toolStatus, setToolStatus] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => window.localStorage.getItem(SESSION_STORAGE_KEY));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const restoredRef = useRef(false);

  function openChat() {
    setRenderPanel(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  function closeChat() {
    setOpen(false);
    window.setTimeout(() => setRenderPanel(false), 220);
  }

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open || restoredRef.current || !sessionId) return;

    const controller = new AbortController();
    restoredRef.current = true;
    setRestoring(true);
    setError("");

    fetchCurrentConversation(sessionId, controller.signal)
      .then((conversation) => {
        if (!conversation) {
          window.localStorage.removeItem(SESSION_STORAGE_KEY);
          setSessionId(null);
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
      });

    return () => controller.abort();
  }, [open, sessionId]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior });
  }, [messages, loading]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading || restoring) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    const assistantMessageId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantMessageId, role: "assistant", text: "" }]);
    setDraft("");
    setError("");
    setToolStatus("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let assistantText = "";
      await sendChatMessage(message, sessionId, controller.signal, (streamEvent) => {
        if (streamEvent.event === "session_start") {
          setSessionId(streamEvent.session_id);
          window.localStorage.setItem(SESSION_STORAGE_KEY, streamEvent.session_id);
          return;
        }

        if (streamEvent.event === "delta") {
          assistantText += streamEvent.text;
          setMessages((current) => current.map((item) => (item.id === assistantMessageId ? { ...item, text: assistantText } : item)));
          return;
        }

        if (streamEvent.event === "tool_status") {
          setToolStatus(streamEvent.status);
          return;
        }

        if (streamEvent.event === "error") {
          throw new Error(streamEvent.message);
        }

        if (streamEvent.event === "done" && streamEvent.session_id) {
          setSessionId(streamEvent.session_id);
          window.localStorage.setItem(SESSION_STORAGE_KEY, streamEvent.session_id);
        }
      });
    } catch (sendError: unknown) {
      if (!controller.signal.aborted) {
        setError(sendError instanceof Error ? sendError.message : "Unable to reach the assistant.");
        setMessages((current) => current.filter((item) => item.id !== assistantMessageId || item.text));
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setToolStatus("");
      setLoading(false);
    }
  }

  return (
    <aside className={`chat-widget${open ? " chat-widget--open" : ""}`} aria-label="AI chat assistant">
      {renderPanel ? (
        <section className="chat-panel" aria-label="Chat conversation">
          <header className="chat-panel__header">
            <div>
              <p className="chat-panel__eyebrow">AI assistant</p>
              <h2>Talk with CriativAI</h2>
            </div>
            <button className="chat-panel__collapse" type="button" aria-label="Collapse chat" title="Collapse chat" onClick={closeChat}>
              <ChevronDownIcon />
            </button>
          </header>

          <div className="chat-panel__messages" ref={transcriptRef} aria-live="polite">
            {restoring ? <p className="chat-panel__status">Restoring conversation...</p> : null}
            {messages.map((message) => (
              <article key={message.id} className={`chat-message chat-message--${message.role}`}>
                <p>{message.text}</p>
              </article>
            ))}
            {loading ? (
              <div className="chat-message chat-message--assistant chat-message--loading" aria-label="Assistant is preparing a response">
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>

          {toolStatus ? <p className="chat-panel__status">{toolStatus}</p> : null}
          {error ? <p className="chat-panel__error">{error}</p> : null}

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
            <button type="submit" disabled={!draft.trim() || loading || restoring} aria-label="Send message" title="Send message">
              <SendIcon />
            </button>
          </form>
        </section>
      ) : (
        <button className="chat-launcher" type="button" aria-label="Open AI chat" title="Open AI chat" onClick={openChat}>
          <ChatIcon />
        </button>
      )}
    </aside>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M7.8 23.1c-2.1-1.8-3.3-4.2-3.3-7C4.5 10.7 9.6 6.3 16 6.3s11.5 4.4 11.5 9.8S22.4 26 16 26c-1.5 0-3-.2-4.3-.7L6 26.6z" />
      <path d="M10.8 14.3h10.4M10.8 18.1h6.5" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m4 12 16-8-5.4 16-3.1-6.1z" />
      <path d="m11.5 13.9 8.5-9.9" />
    </svg>
  );
}
