import { useEffect, useState } from "react";
import "./Admin.css";

type AdminConversationSummary = {
  id: number;
  visitor_label: string;
  last_activity_at: string | null;
  status: string;
  booking_state: string | null;
  summary: string | null;
};

type AdminConversationDetail = AdminConversationSummary & {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    status: string;
    created_at: string | null;
  }>;
};

export default function AdminPage() {
  const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoadingList(true);
    fetch("/api/admin/conversations", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load conversations.");
        return response.json() as Promise<AdminConversationSummary[]>;
      })
      .then((items) => {
        setConversations(items);
        setSelectedId(items[0]?.id ?? null);
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load conversations.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingList(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    setLoadingDetail(true);
    setError("");

    fetch(`/api/admin/conversations/${selectedId}`, { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load conversation detail.");
        return response.json() as Promise<AdminConversationDetail>;
      })
      .then(setDetail)
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load conversation detail.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingDetail(false);
      });

    return () => controller.abort();
  }, [selectedId]);

  return (
    <main className="admin-page">
      <section className="admin-shell" aria-label="Admin conversations">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Read-only admin</p>
            <h1>Conversations</h1>
          </div>
          <p>Protected by Traefik before public deployment.</p>
        </header>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-grid">
          <aside className="admin-list" aria-label="Conversation list">
            {loadingList ? <p className="admin-muted">Loading conversations...</p> : null}
            {!loadingList && conversations.length === 0 ? <p className="admin-muted">No conversations yet.</p> : null}
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`admin-list-item${conversation.id === selectedId ? " admin-list-item--active" : ""}`}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
              >
                <span>{conversation.visitor_label}</span>
                <small>{formatDate(conversation.last_activity_at)}</small>
                <em>{conversation.summary ?? "No summary yet"}</em>
              </button>
            ))}
          </aside>

          <section className="admin-detail" aria-label="Conversation detail">
            {loadingDetail ? <p className="admin-muted">Loading detail...</p> : null}
            {!loadingDetail && !detail ? <p className="admin-muted">Select a conversation.</p> : null}
            {detail ? (
              <>
                <div className="admin-detail-head">
                  <div>
                    <p className="admin-kicker">{detail.status}</p>
                    <h2>{detail.visitor_label}</h2>
                  </div>
                  <time>{formatDate(detail.last_activity_at)}</time>
                </div>

                {detail.summary ? <p className="admin-summary">{detail.summary}</p> : null}

                <div className="admin-messages">
                  {detail.messages.map((message, index) => (
                    <article key={`${message.created_at ?? index}-${index}`} className={`admin-message admin-message--${message.role}`}>
                      <span>{message.role}</span>
                      <p>{message.content}</p>
                      <small>{message.status}</small>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}

function formatDate(value: string | null) {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
