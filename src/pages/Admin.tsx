import { useEffect, useState } from "react";
import { MarkdownText } from "../components/MarkdownText";
import { SiteHeader } from "../components/SiteHeader";
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

type ChatTracingStatus = {
  enabled: boolean;
  log_path: string;
  state_path: string;
  log_exists: boolean;
  log_size_bytes: number;
};

type ChatMultiWindowStatus = {
  enabled: boolean;
  state_path: string;
};

type AdminPromptResponse = {
  content: string;
};

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

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
  const [tracingStatus, setTracingStatus] = useState<ChatTracingStatus | null>(null);
  const [tracingLoading, setTracingLoading] = useState(true);
  const [tracingSaving, setTracingSaving] = useState(false);
  const [tracingError, setTracingError] = useState("");
  const [multiWindowStatus, setMultiWindowStatus] = useState<ChatMultiWindowStatus | null>(null);
  const [multiWindowLoading, setMultiWindowLoading] = useState(true);
  const [multiWindowSaving, setMultiWindowSaving] = useState(false);
  const [multiWindowError, setMultiWindowError] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptDraft, setPromptDraft] = useState("");
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);
  const [promptError, setPromptError] = useState("");
  const [promptStatus, setPromptStatus] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const googleFeedbackParams = new URLSearchParams(window.location.search);
  const googleFeedback = googleFeedbackParams.get("google");
  const googleErrorReason = googleFeedbackParams.get("reason");
  const googleErrorDetail = googleFeedbackParams.get("detail");
  const tracingEnabled = tracingStatus?.enabled ?? true;
  const multiWindowEnabled = multiWindowStatus?.enabled ?? true;

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
    const controller = new AbortController();
    setTracingLoading(true);
    setTracingError("");

    fetch("/api/admin/chat-tracing", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load chat tracing status.");
        return response.json() as Promise<ChatTracingStatus>;
      })
      .then(setTracingStatus)
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setTracingError(loadError instanceof Error ? loadError.message : "Unable to load chat tracing status.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setTracingLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setMultiWindowLoading(true);
    setMultiWindowError("");

    fetch("/api/admin/chat-multi-window", { signal: controller.signal, headers: { accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load new chat button status.");
        return response.json() as Promise<ChatMultiWindowStatus>;
      })
      .then(setMultiWindowStatus)
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) return;
        setMultiWindowError(loadError instanceof Error ? loadError.message : "Unable to load new chat button status.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setMultiWindowLoading(false);
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

  async function deleteConversation(conversationId: number) {
    if (deletingId === conversationId) return;

    const confirmed = window.confirm("Delete this conversation and all its messages?");
    if (!confirmed) return;

    setDeletingId(conversationId);
    setError("");

    try {
      const response = await fetch(`/api/admin/conversations/${conversationId}`, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });
      if (!response.ok) throw new Error("Unable to delete the conversation.");

      const remaining = conversations.filter((conversation) => conversation.id !== conversationId);
      setConversations(remaining);

      if (selectedId === conversationId) {
        const nextSelected = remaining[0]?.id ?? null;
        setSelectedId(nextSelected);
        setDetail(null);
      }
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the conversation.");
    } finally {
      setDeletingId(null);
    }
  }

  async function updateTracing(enabled: boolean) {
    if (tracingSaving) return;

    setTracingSaving(true);
    setTracingError("");

    try {
      const response = await fetch("/api/admin/chat-tracing", {
        method: "PUT",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Unable to update chat tracing.");
      const payload = (await response.json()) as ChatTracingStatus;
      setTracingStatus(payload);
    } catch (saveError: unknown) {
      setTracingError(saveError instanceof Error ? saveError.message : "Unable to update chat tracing.");
    } finally {
      setTracingSaving(false);
    }
  }

  async function updateMultiWindow(enabled: boolean) {
    if (multiWindowSaving) return;

    setMultiWindowSaving(true);
    setMultiWindowError("");

    try {
      const response = await fetch("/api/admin/chat-multi-window", {
        method: "PUT",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error("Unable to update the new chat button status.");
      const payload = (await response.json()) as ChatMultiWindowStatus;
      setMultiWindowStatus(payload);
    } catch (saveError: unknown) {
      setMultiWindowError(saveError instanceof Error ? saveError.message : "Unable to update the new chat button status.");
    } finally {
      setMultiWindowSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <SiteHeader brand={<Brand />} page="adm" />
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
        {tracingError ? <p className="admin-error">{tracingError}</p> : null}
        {multiWindowError ? <p className="admin-error">{multiWindowError}</p> : null}
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

        <div className="admin-controls">
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
              {googleFeedback === "error" ? (
                <p className="admin-notice admin-notice--error">
                  Google Calendar connection could not be completed.
                  {googleErrorReason ? <span> Reason: {googleErrorReason}.</span> : null}
                  {googleErrorDetail ? <span> Detail: {googleErrorDetail}</span> : null}
                </p>
              ) : null}
            </div>
          </section>

          <section className="admin-tracing" aria-label="Chat tracing">
            <div className="admin-tracing__copy">
              <p className="admin-kicker">Chat tracing</p>
              <h2>Tool use debug log</h2>
              <p>
                {tracingLoading
                  ? "Checking chat tracing..."
                  : "When enabled, each chat turn appends a JSON line to the root-level tracing file so we can inspect prompt behavior and tool calls later."}
              </p>
              <div className="admin-tracing__meta">
                <span>Log file</span>
                <strong>{tracingStatus?.log_path ?? "chat-tracing-log.txt"}</strong>
              </div>
              <div className="admin-tracing__meta">
                <span>Toggle file</span>
                <strong>{tracingStatus?.state_path ?? "chat-tracing-enabled.txt"}</strong>
              </div>
              <div className="admin-tracing__meta">
                <span>Current size</span>
                <strong>{tracingStatus ? `${formatBytes(tracingStatus.log_size_bytes)}${tracingStatus.log_exists ? "" : " (not created yet)"}` : "0 B"}</strong>
              </div>
            </div>

            <div className="admin-tracing__actions">
              <button
                className={`admin-switch${tracingEnabled ? " admin-switch--on" : ""}`}
                type="button"
                role="switch"
                aria-checked={tracingEnabled}
                disabled={tracingLoading || tracingSaving}
                onClick={() => void updateTracing(!tracingEnabled)}
              >
                <span className="admin-switch__track" aria-hidden="true">
                  <span className="admin-switch__thumb" />
                </span>
                <span className="admin-switch__label">{tracingEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </section>

          <section className="admin-tracing" aria-label="New chat button toggle">
            <div className="admin-tracing__copy">
              <p className="admin-kicker">Chat multi-window</p>
              <h2>New chat button</h2>
              <p>
                {multiWindowLoading
                  ? "Checking the new chat button status..."
                  : "When enabled, the live chat header shows a round New Chat button that opens a fresh chat window with the standard icebreakers."}
              </p>
              <div className="admin-tracing__meta">
                <span>Toggle file</span>
                <strong>{multiWindowStatus?.state_path ?? "chat-multi-window-enabled.txt"}</strong>
              </div>
            </div>

            <div className="admin-tracing__actions">
              <button
                className={`admin-switch${multiWindowEnabled ? " admin-switch--on" : ""}`}
                type="button"
                role="switch"
                aria-checked={multiWindowEnabled}
                disabled={multiWindowLoading || multiWindowSaving}
                onClick={() => void updateMultiWindow(!multiWindowEnabled)}
              >
                <span className="admin-switch__track" aria-hidden="true">
                  <span className="admin-switch__thumb" />
                </span>
                <span className="admin-switch__label">{multiWindowEnabled ? "On" : "Off"}</span>
              </button>
            </div>
          </section>
        </div>

        <div className="admin-grid">
          <aside className="admin-list" aria-label="Conversation list">
            {loadingList ? <p className="admin-muted">Loading conversations...</p> : null}
            {!loadingList && conversations.length === 0 ? <p className="admin-muted">No conversations yet.</p> : null}
            {conversations.map((conversation) => (
              <div key={conversation.id} className={`admin-list-item${conversation.id === selectedId ? " admin-list-item--active" : ""}`}>
                <button className="admin-list-item__body" type="button" onClick={() => setSelectedId(conversation.id)}>
                  <span>{conversation.visitor_label}</span>
                  <small>{formatDate(conversation.last_activity_at)}</small>
                  <em>{conversation.summary ?? "No summary yet"}</em>
                </button>
                <button
                  className="admin-list-item__delete"
                  type="button"
                  aria-label={`Delete conversation ${conversation.visitor_label}`}
                  title="Delete conversation"
                  disabled={deletingId === conversation.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    void deleteConversation(conversation.id);
                  }}
                >
                  <TrashIcon />
                </button>
              </div>
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
                      <MarkdownText text={message.content} />
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M9 3.75h6m-8.25 3h10.5m-9 0 .5 12a1.5 1.5 0 0 0 1.5 1.5h2.75m4.75-13.5-.5 12a1.5 1.5 0 0 1-1.5 1.5H13.5m-1.5-13.5v9m-3-9v9m9-12-.8 14.25a2.25 2.25 0 0 1-2.24 2.13H8.04a2.25 2.25 0 0 1-2.24-2.13L5 6.75h14Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function formatDate(value: string | null) {
  if (!value) return "No activity";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
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
