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

type GoogleCalendarStatus = {
  status: "connected" | "disconnected" | "error" | string;
  calendar_id: string | null;
  scopes: string[];
};

type AdminPromptResponse = {
  content: string;
};

export default function AdminPage() {
  const [conversations, setConversations] = useState<AdminConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminConversationDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleError, setGoogleError] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [promptStatus, setPromptStatus] = useState("");
  const googleFeedback = new URLSearchParams(window.location.search).get("google");

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
    const controller = new AbortController();
    setGoogleLoading(true);
    setGoogleError("");

    fetch("/api/admin/google/status", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load Google Calendar status.");
        return response.json() as Promise<GoogleCalendarStatus>;
      })
      .then(setGoogleStatus)
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setGoogleError(loadError instanceof Error ? loadError.message : "Unable to load Google Calendar status.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setGoogleLoading(false);
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

  async function openPromptEditor() {
    setPromptOpen(true);
    setPromptLoading(true);
    setPromptError("");
    setPromptStatus("");

    try {
      const response = await fetch("/api/admin/prompt", { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error("Unable to load the current prompt.");
      const payload = (await response.json()) as AdminPromptResponse;
      setPromptDraft(payload.content);
    } catch (loadError: unknown) {
      setPromptError(loadError instanceof Error ? loadError.message : "Unable to load the current prompt.");
    } finally {
      setPromptLoading(false);
    }
  }

  async function savePrompt() {
    const content = promptDraft.trim();
    if (!content || promptSaving) return;

    setPromptSaving(true);
    setPromptError("");
    setPromptStatus("");

    try {
      const response = await fetch("/api/admin/prompt", {
        method: "PUT",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error("Unable to save the prompt.");
      const payload = (await response.json()) as AdminPromptResponse;
      setPromptDraft(payload.content);
      setPromptStatus("Prompt updated successfully.");
    } catch (saveError: unknown) {
      setPromptError(saveError instanceof Error ? saveError.message : "Unable to save the prompt.");
    } finally {
      setPromptSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-shell" aria-label="Admin conversations">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Admin console</p>
            <h1>Conversations</h1>
          </div>
          <div className="admin-header__actions">
            <p>Browse previous chats, manage the Google Calendar connection, and update the live chat agent prompt.</p>
            <button className="button button--ghost admin-header__button" type="button" onClick={openPromptEditor}>
              Configure prompt
            </button>
          </div>
        </header>

        {error ? <p className="admin-error">{error}</p> : null}
        {googleError ? <p className="admin-error">{googleError}</p> : null}
        {promptError ? <p className="admin-error">{promptError}</p> : null}

        {promptOpen ? (
          <section className="admin-prompt" aria-label="Agent prompt editor">
            <div className="admin-prompt__head">
              <div>
                <p className="admin-kicker">Chat agent prompt</p>
                <h2>Configure the live prompt</h2>
              </div>
              <button
                className="admin-prompt__close"
                type="button"
                onClick={() => {
                  setPromptOpen(false);
                  setPromptError("");
                  setPromptStatus("");
                }}
              >
                Close
              </button>
            </div>

            <p className="admin-prompt__intro">
              Changes saved here affect the prompt file currently used by the assistant in the chat runtime.
            </p>

            {promptStatus ? <p className="admin-notice admin-notice--success">{promptStatus}</p> : null}

            <label className="sr-only" htmlFor="admin-agent-prompt">
              Agent prompt
            </label>
            <textarea
              id="admin-agent-prompt"
              value={promptDraft}
              placeholder={promptLoading ? "Loading current prompt..." : "Write the prompt used by the chat agent"}
              disabled={promptLoading || promptSaving}
              onChange={(event) => {
                setPromptDraft(event.target.value);
                if (promptStatus) setPromptStatus("");
              }}
            />

            <div className="admin-prompt__actions">
              <button
                className="button button--ghost"
                type="button"
                disabled={promptLoading || promptSaving}
                onClick={openPromptEditor}
              >
                Reload prompt
              </button>
              <button className="button button--light" type="button" disabled={!promptDraft.trim() || promptLoading || promptSaving} onClick={savePrompt}>
                {promptSaving ? "Saving..." : "Save prompt"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="admin-google" aria-label="Google Calendar admin">
          <div className="admin-google__copy">
            <p className="admin-kicker">Google Calendar</p>
            <h2>Connection status</h2>
            <p>{googleLoading ? "Checking the current calendar connection..." : describeGoogleStatus(googleStatus)}</p>
            <div className="admin-google__meta">
              <span>Calendar</span>
              <strong>{googleStatus?.calendar_id ?? "Not configured"}</strong>
            </div>
            {googleStatus?.scopes?.length ? (
              <div className="admin-google__meta">
                <span>Scopes</span>
                <strong>{googleStatus.scopes.length} permission(s) configured</strong>
              </div>
            ) : null}
          </div>

          <div className="admin-google__actions">
            <span className={`admin-badge admin-badge--${normalizeGoogleStatus(googleStatus?.status)}`}>
              {labelGoogleStatus(googleStatus?.status, googleLoading)}
            </span>

            <a className="button button--ghost admin-google__button" href="/api/admin/google/connect">
              {googleStatus?.status === "connected" ? "Reconnect Google" : "Connect Google"}
            </a>

            {googleFeedback === "connected" ? <p className="admin-notice admin-notice--success">Google Calendar connected successfully.</p> : null}
            {googleFeedback === "error" ? <p className="admin-notice admin-notice--error">Google Calendar connection could not be completed.</p> : null}
          </div>
        </section>

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
                <div className="admin-chat-head">
                  <div className="admin-chat-identity">
                    <img className="admin-chat-avatar" src="/bruno-portrait.png" alt="" aria-hidden="true" />
                    <div>
                      <p className="admin-kicker">{detail.status}</p>
                      <h2>Talk with CriativAI</h2>
                    </div>
                  </div>

                  <div className="admin-chat-select-wrap">
                    <label className="sr-only" htmlFor="admin-conversation-select">
                      Select conversation
                    </label>
                    <select
                      id="admin-conversation-select"
                      value={selectedId ?? ""}
                      onChange={(event) => setSelectedId(Number(event.target.value))}
                    >
                      {conversations.map((conversation) => (
                        <option key={conversation.id} value={conversation.id}>
                          {conversation.visitor_label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-detail-head">
                  <div>
                    <p className="admin-kicker">Selected conversation</p>
                    <h2>{detail.visitor_label}</h2>
                  </div>
                  <time>{formatDate(detail.last_activity_at)}</time>
                </div>

                <div className="admin-conversation-meta">
                  <div>
                    <span>Status</span>
                    <strong>{detail.status}</strong>
                  </div>
                  <div>
                    <span>Booking</span>
                    <strong>{detail.booking_state ?? "No booking yet"}</strong>
                  </div>
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

function normalizeGoogleStatus(status: string | undefined) {
  if (status === "connected" || status === "error" || status === "disconnected") return status;
  return "disconnected";
}

function labelGoogleStatus(status: string | undefined, loading: boolean) {
  if (loading) return "Checking";
  if (status === "connected") return "Connected";
  if (status === "error") return "Needs attention";
  return "Disconnected";
}

function describeGoogleStatus(status: GoogleCalendarStatus | null) {
  if (!status) return "Google Calendar is not connected yet.";
  if (status.status === "connected") return "The assistant can use the configured Google Calendar account.";
  if (status.status === "error") return "The saved Google credentials need to be refreshed or reconnected.";
  return "Connect the owner Google account here so availability, booking, rescheduling, and cancellation can run in the app.";
}
