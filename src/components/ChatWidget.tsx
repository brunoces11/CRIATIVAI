import { FormEvent, useEffect, useRef, useState } from "react";
import "./ChatWidget.css";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const initialMessages: Message[] = [
  {
    id: "assistant-intro",
    role: "assistant",
    text: "Hi. I can help you think through AI opportunities and next steps.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior });
  }, [messages, loading]);

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setError("");
    setLoading(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: "The assistant is almost ready. API connection comes in the next implementation step.",
        },
      ]);
      setLoading(false);
    }, 520);
  }

  return (
    <aside className={`chat-widget${open ? " chat-widget--open" : ""}`} aria-label="AI chat assistant">
      {open ? (
        <section className="chat-panel" aria-label="Chat conversation">
          <header className="chat-panel__header">
            <div>
              <p className="chat-panel__eyebrow">AI assistant</p>
              <h2>Talk with CriativAI</h2>
            </div>
            <button className="chat-panel__collapse" type="button" aria-label="Collapse chat" title="Collapse chat" onClick={() => setOpen(false)}>
              <ChevronDownIcon />
            </button>
          </header>

          <div className="chat-panel__messages" ref={transcriptRef} aria-live="polite">
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
              disabled={loading}
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
            <button type="submit" disabled={!draft.trim() || loading} aria-label="Send message" title="Send message">
              <SendIcon />
            </button>
          </form>
        </section>
      ) : (
        <button className="chat-launcher" type="button" aria-label="Open AI chat" title="Open AI chat" onClick={() => setOpen(true)}>
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
