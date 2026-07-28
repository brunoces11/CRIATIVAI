import { useEffect, useRef, useState, type FormEvent } from "react";
import { fetchCurrentConversation, sendChatMessage } from "../lib/chatStream";
import { MarkdownText } from "./MarkdownText";
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
  const [assistantStarted, setAssistantStarted] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [toolStatus, setToolStatus] = useState("");
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(() => window.localStorage.getItem(SESSION_STORAGE_KEY));
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
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
    window.addEventListener("criativai:open-chat", openChat);
    return () => window.removeEventListener("criativai:open-chat", openChat);
  }, []);

  function closeChat() {
    setOpen(false);
    closeTimerRef.current = window.setTimeout(() => {
      setRenderPanel(false);
      closeTimerRef.current = null;
    }, 220);
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
    return () => {
      abortRef.current?.abort();
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior });
  }, [messages, loading]);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading || restoring) return;
    const shouldRefocusInput = document.activeElement === inputRef.current;

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
      await sendChatMessage(message, sessionId, turnId, controller.signal, (streamEvent) => {
        if (streamEvent.event === "session_start") {
          setSessionId(streamEvent.session_id);
          window.localStorage.setItem(SESSION_STORAGE_KEY, streamEvent.session_id);
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
          window.localStorage.setItem(SESSION_STORAGE_KEY, streamEvent.session_id);
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

  return (
    <aside className={`chat-widget${open ? " chat-widget--open" : ""}`} aria-label="AI chat assistant">
      {renderPanel ? (
        <section className="chat-panel" aria-label="Chat conversation">
          <header className="chat-panel__header">
            <div className="chat-panel__identity">
              <img className="chat-panel__avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
              <div className="chat-panel__identity-copy">
                <p className="chat-panel__eyebrow">AI assistant</p>
                <h2>Talk with CriativAI</h2>
              </div>
            </div>
            <button className="chat-panel__collapse" type="button" aria-label="Collapse chat" title="Collapse chat" onClick={closeChat}>
              <img className="chat-panel__collapse-icon" src="/icons/chat-collapse.svg" alt="" aria-hidden="true" />
            </button>
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
            <button type="submit" disabled={!draft.trim() || loading || restoring} aria-label="Send message" title="Send message">
              <img className="chat-panel__form-icon" src="/icons/chat-send.svg" alt="" aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : (
        <button className="chat-launcher" type="button" aria-label="Open AI chat" title="Open AI chat" onClick={openChat}>
          <img className="chat-launcher__icon" src="/icons/chat-launcher.svg" alt="" aria-hidden="true" />
        </button>
      )}
    </aside>
  );
}
