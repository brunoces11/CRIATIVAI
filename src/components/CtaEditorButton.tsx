import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import {
  CTA_EDITOR_STATUS_EVENT,
  canShowCtaEditor,
  loadCtaMessages,
  resetCtaEditorStatusCache,
  saveCtaMessages,
} from "../lib/ctaEditor";
import "./CtaEditorButton.css";

type EditableCtaProps = {
  welcomeKey: string;
  children: ReactNode;
};

type CtaEditorButtonProps = {
  welcomeKey: string;
};

export function EditableCta({ welcomeKey, children }: EditableCtaProps) {
  return (
    <span className="cta-editor-anchor">
      {children}
      <CtaEditorButton welcomeKey={welcomeKey} />
    </span>
  );
}

export function CtaEditorButton({ welcomeKey }: CtaEditorButtonProps) {
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    function refresh() {
      void canShowCtaEditor(controller.signal).then(setVisible);
    }

    function refreshFromStorage() {
      resetCtaEditorStatusCache();
      refresh();
    }

    refresh();
    window.addEventListener(CTA_EDITOR_STATUS_EVENT, refresh);
    window.addEventListener("storage", refreshFromStorage);

    return () => {
      controller.abort();
      window.removeEventListener(CTA_EDITOR_STATUS_EVENT, refresh);
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <button
        className="cta-editor-button"
        type="button"
        aria-label="Edit CTA messages"
        title="Edit CTA messages"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <span aria-hidden="true">!</span>
      </button>
      {open ? createPortal(<CtaEditorModal welcomeKey={welcomeKey} onClose={() => setOpen(false)} />, document.body) : null}
    </>
  );
}

function CtaEditorModal({ welcomeKey, onClose }: { welcomeKey: string; onClose: () => void }) {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [contextMessage, setContextMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setStatus("");

    loadCtaMessages(welcomeKey, controller.signal)
      .then((messages) => {
        setWelcomeMessage(messages.welcome_message);
        setContextMessage(messages.context_message);
      })
      .catch(async (loadError: unknown) => {
        const errorMessage = loadError instanceof Error ? loadError.message : "Unable to load CTA messages.";
        if (controller.signal.aborted || isAbortErrorMessage(errorMessage)) {
          if (await canShowDebugAlert()) setError(errorMessage);
          return;
        }
        setError(errorMessage);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [welcomeKey]);

  async function save() {
    if (saving) return;

    setSaving(true);
    setError("");
    setStatus("");

    try {
      const messages = await saveCtaMessages(welcomeKey, welcomeMessage, contextMessage);
      setWelcomeMessage(messages.welcome_message);
      setContextMessage(messages.context_message);
      setStatus("Saved.");
      resetCtaEditorStatusCache();
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save CTA messages.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cta-editor-modal" role="dialog" aria-modal="true" aria-labelledby="cta-editor-title">
      <div className="cta-editor-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <section className="cta-editor-modal__panel">
        <header className="cta-editor-modal__head">
          <div>
            <p>CTA editor</p>
            <h2 id="cta-editor-title">Edit mapped messages</h2>
          </div>
          <button type="button" className="cta-editor-modal__close" onClick={onClose} aria-label="Close">
            x
          </button>
        </header>

        <code className="cta-editor-modal__key">{welcomeKey}</code>
        {error ? <p className="cta-editor-modal__notice cta-editor-modal__notice--error">{error}</p> : null}
        {status ? <p className="cta-editor-modal__notice cta-editor-modal__notice--success">{status}</p> : null}

        <label>
          <span>Welcome Message</span>
          <textarea
            value={welcomeMessage}
            disabled={loading || saving}
            placeholder={loading ? "Loading..." : ""}
            onChange={(event) => {
              setWelcomeMessage(event.target.value);
              if (status) setStatus("");
            }}
          />
        </label>

        <label>
          <span>Context Message</span>
          <textarea
            value={contextMessage}
            disabled={loading || saving}
            placeholder={loading ? "Loading..." : ""}
            onChange={(event) => {
              setContextMessage(event.target.value);
              if (status) setStatus("");
            }}
          />
        </label>

        <footer className="cta-editor-modal__actions">
          <button type="button" className="button button--ghost" disabled={saving} onClick={onClose}>
            Close
          </button>
          <button type="button" className="button button--light" disabled={loading || saving} onClick={() => void save()}>
            {saving ? "Saving..." : "Save"}
          </button>
        </footer>
      </section>
    </div>
  );
}

function isAbortErrorMessage(message: string) {
  return message.toLowerCase().includes("aborted");
}

async function canShowDebugAlert() {
  try {
    const response = await fetch("/api/admin/chat-tracing", {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return false;
    const status = (await response.json()) as { enabled?: boolean };
    return status.enabled === true;
  } catch {
    return false;
  }
}
