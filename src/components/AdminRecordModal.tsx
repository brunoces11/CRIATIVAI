import { MarkdownText } from "./MarkdownText";

export type AdminRecordDetail = {
  id: number;
  user_from: string;
  source_label: string;
  source_record_id: number;
  name: string | null;
  email: string | null;
  company: string | null;
  timezone: string | null;
  created_at: string | null;
  payload: Record<string, unknown>;
};

type AdminRecordModalProps = {
  open: boolean;
  loading: boolean;
  error: string;
  record: AdminRecordDetail | null;
  onClose: () => void;
};

export function AdminRecordModal({ open, loading, error, record, onClose }: AdminRecordModalProps) {
  if (!open) return null;

  return (
    <div className="form-modal admin-record-modal" role="dialog" aria-modal="true" aria-labelledby="admin-record-modal-title">
      <div className="form-modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div className="form-modal__panel admin-record-modal__panel">
        <div className="admin-record-modal__head">
          <div>
            <p className="eyebrow">Admin record</p>
            <h2 id="admin-record-modal-title">{record?.source_label ?? "Record details"}</h2>
            {record ? <p className="admin-record-modal__meta">Created {formatDateTime(record.created_at)}</p> : null}
          </div>
          <button type="button" className="admin-record-modal__close" onClick={onClose}>
            Close
          </button>
        </div>

        {loading ? <p className="admin-record-modal__notice">Loading record...</p> : null}
        {error ? <p className="admin-record-modal__notice admin-record-modal__notice--error">{error}</p> : null}

        {record && !loading && !error ? (
          <div className="admin-record-modal__content">
            <dl className="admin-record-modal__summary">
              <div>
                <dt>Name</dt>
                <dd>{record.name ?? "Not informed"}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{record.email ?? "Not informed"}</dd>
              </div>
              <div>
                <dt>Company</dt>
                <dd>{record.company ?? "Not informed"}</dd>
              </div>
              <div>
                <dt>Timezone</dt>
                <dd>{record.timezone ?? "Not informed"}</dd>
              </div>
            </dl>

            {renderSourceBody(record)}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function renderSourceBody(record: AdminRecordDetail) {
  if (record.user_from === "briefing") {
    return (
      <section className="admin-record-modal__section">
        <h3>Briefing</h3>
        <dl className="admin-record-modal__details">
          <div>
            <dt>Briefing title</dt>
            <dd>{String(record.payload.briefing_title ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Sent status</dt>
            <dd>{String(record.payload.briefing_status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Owner e-mail</dt>
            <dd>{String(record.payload.owner_email_status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Client e-mail</dt>
            <dd>{String(record.payload.client_email_status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Created at</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.briefing_created_at))}</dd>
          </div>
          <div>
            <dt>Sent at</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.briefing_sent_at))}</dd>
          </div>
        </dl>
        <div className="admin-record-modal__markdown">
          <MarkdownText text={String(record.payload.briefing_markdown ?? "")} />
        </div>
      </section>
    );
  }

  if (record.user_from === "contact_form") {
    return (
      <section className="admin-record-modal__section">
        <h3>Contact form</h3>
        <dl className="admin-record-modal__details">
          <div>
            <dt>Subject</dt>
            <dd>{String(record.payload.subject ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Created at</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.created_at))}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{String(record.payload.status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>E-mail status</dt>
            <dd>{String(record.payload.notification_email_status ?? "Not informed")}</dd>
          </div>
        </dl>
        <div className="admin-record-modal__text-block">
          <p>{String(record.payload.message ?? "")}</p>
        </div>
      </section>
    );
  }

  if (record.user_from === "talent_preview") {
    return (
      <section className="admin-record-modal__section">
        <h3>Talent Preview</h3>
        <dl className="admin-record-modal__details">
          <div>
            <dt>Job title</dt>
            <dd>{String(record.payload.job_title ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Created at</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.created_at))}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{String(record.payload.status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Notification e-mail</dt>
            <dd>{String(record.payload.notification_email_status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Confirmation e-mail</dt>
            <dd>{String(record.payload.confirmation_email_status ?? "Not informed")}</dd>
          </div>
        </dl>
        <div className="admin-record-modal__list-block">
          <Item label="Search criteria 1" value={record.payload.search_criteria_1} />
          <Item label="Search criteria 2" value={record.payload.search_criteria_2} />
          <Item label="Search criteria 3" value={record.payload.search_criteria_3} />
          <Item label="Search criteria 4" value={record.payload.search_criteria_4} />
          <Item label="Exclusion criteria" value={record.payload.exclusion_criteria} />
          <Item label="Differentiator" value={record.payload.differentiator} />
        </div>
      </section>
    );
  }

  if (record.user_from === "booking") {
    return (
      <section className="admin-record-modal__section">
        <h3>Booking</h3>
        <dl className="admin-record-modal__details">
          <div>
            <dt>Created at</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.created_at))}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{String(record.payload.status ?? "Not informed")}</dd>
          </div>
          <div>
            <dt>Start</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.starts_at_utc))}</dd>
          </div>
          <div>
            <dt>End</dt>
            <dd>{formatDateTime(stringifyDate(record.payload.ends_at_utc))}</dd>
          </div>
          <div>
            <dt>Timezone</dt>
            <dd>{String(record.payload.timezone ?? "Not informed")}</dd>
          </div>
        </dl>
        {record.payload.conversation_summary ? (
          <div className="admin-record-modal__text-block">
            <p>{String(record.payload.conversation_summary)}</p>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="admin-record-modal__section">
      <h3>Record</h3>
      <pre className="admin-record-modal__raw">{JSON.stringify(record.payload, null, 2)}</pre>
    </section>
  );
}

function Item({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="admin-record-modal__item">
      <span>{label}</span>
      <p>{String(value)}</p>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Not informed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not informed";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function stringifyDate(value: unknown) {
  return typeof value === "string" ? value : null;
}
