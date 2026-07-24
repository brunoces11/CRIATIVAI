import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
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

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: message,
    };

    const assistantMessageId = crypto.randomUUID();
    const turnId = crypto.randomUUID();
    setMessages((current) => [...current, userMessage, { id: assistantMessageId, role: "assistant", text: "" }]);
    setDraft("");
    setError("");
    setToolStatus("");
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
          setMessages((current) => current.map((item) => (item.id === assistantMessageId ? { ...item, text: assistantText } : item)));
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
            {loading ? (
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

function MarkdownText({ text }: { text: string }) {
  const blocks = parseMarkdownBlocks(text);
  if (!blocks.length) return <p />;

  return (
    <div className="chat-markdown">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = `h${Math.min(block.level, 3)}` as "h1" | "h2" | "h3";
          return <Heading key={index}>{renderInlineMarkdown(block.text)}</Heading>;
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </List>
          );
        }
        if (block.type === "code") {
          return (
            <pre key={index}>
              <code>{block.text}</code>
            </pre>
          );
        }
        return <p key={index}>{renderInlineMarkdown(block.text)}</p>;
      })}
    </div>
  );
}

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; text: string };

function parseMarkdownBlocks(text: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let code: string[] | null = null;

  function flushParagraph() {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  }

  function flushList() {
    if (!list) return;
    blocks.push({ type: "list", ordered: list.ordered, items: list.items });
    list = null;
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (code) {
        blocks.push({ type: "code", text: code.join("\n") });
        code = null;
      } else {
        flushParagraph();
        flushList();
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    const orderedMatch = /^\d+[.)]\s+(.+)$/.exec(trimmed);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      const ordered = Boolean(orderedMatch);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((unorderedMatch ?? orderedMatch)?.[1] ?? "");
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  if (code) blocks.push({ type: "code", text: code.join("\n") });
  flushParagraph();
  flushList();
  return blocks;
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;
  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${match.index}-${token}`;

    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/.exec(token);
      if (linkMatch) {
        nodes.push(
          <a key={key} href={linkMatch[2]} target="_blank" rel="noreferrer noopener">
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes.map((node, index) => <Fragment key={index}>{node}</Fragment>);
}
