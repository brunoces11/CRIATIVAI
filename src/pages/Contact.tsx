import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FormSuccessModal } from "../components/FormSuccessModal";
import { SiteHeader } from "../components/SiteHeader";
import { submitContact } from "../lib/forms";
import { buildMailtoHref, isSitesFrontendOnly } from "../lib/sitesRuntime";
import { isAudienceEnabled } from "../lib/audienceVisibility";

type ContactState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  started_at_ms: number;
  honeypot: string;
};

function createInitialState(): ContactState {
  return {
    name: "",
    email: "",
    subject: "",
    message: "",
    started_at_ms: Date.now(),
    honeypot: "",
  };
}

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function ContactPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<ContactState>(() => createInitialState());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const isValid = useMemo(() => {
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
    return emailOk && form.name.trim().length >= 2 && form.subject.trim().length >= 2 && form.message.trim().length >= 10;
  }, [form]);

  const onChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onReset = () => {
    setForm(createInitialState());
    setError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || submitting) return;

    if (isSitesFrontendOnly) {
      window.location.href = buildMailtoHref({
        subject: form.subject.trim() || t("contact.mailtoSubject"),
        lines: [
          `${t("contact.mailtoName")}: ${form.name.trim() || "-"}`,
          `${t("contact.mailtoEmail")}: ${form.email.trim() || "-"}`,
          "",
          form.message.trim() || t("contact.mailtoFallback"),
        ],
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitContact(form);
      setForm(createInitialState());
      setSuccessOpen(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send your message right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page contact-page" id="top">
      <SiteHeader brand={<Brand />} page="contact" />

      <section className="form-hero contact-hero" aria-labelledby="contact-page-title">
        <div className="form-hero-glow" aria-hidden="true" />
        <div className="site-container form-hero-grid contact-hero-grid">
          <div className="form-hero-copy contact-hero-copy">
            <h1 id="contact-page-title">{t("contact.title")} <span>{t("contact.titleAccent")}</span></h1>
            <p className="form-hero-lead">
              {t("contact.lead")}
            </p>
            <p className="form-hero-detail">
              {isSitesFrontendOnly
                ? t("contact.publicDetail")
                : t("contact.backendDetail")}
            </p>
          </div>

          <form className="form-panel contact-form-panel" onSubmit={onSubmit} onReset={onReset} noValidate>
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>{t("forms.name")}</span>
                <input name="name" value={form.name} onChange={onChange} placeholder={t("forms.yourName")} required />
              </label>
              <label className="form-field">
                <span>{t("forms.email")}</span>
                <input name="email" type="email" value={form.email} onChange={onChange} placeholder={t("contact.emailPlaceholder")} required />
              </label>
            </div>

            <label className="form-field">
              <span>{t("forms.subject")}</span>
              <input name="subject" value={form.subject} onChange={onChange} placeholder={t("forms.subjectPlaceholder")} required />
            </label>

            <label className="form-field">
              <span>{t("forms.message")}</span>
              <textarea name="message" value={form.message} onChange={onChange} placeholder={t("forms.messagePlaceholder")} rows={7} required />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              <span>{t("forms.leaveEmpty")}</span>
              <input name="honeypot" value={form.honeypot} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>

            <input type="hidden" name="started_at_ms" value={form.started_at_ms} />

            {isSitesFrontendOnly ? (
              <p className="form-feedback form-feedback--notice">
                {t("forms.publicNotice")}
              </p>
            ) : null}
            {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

            <div className="form-actions">
              <button type="reset" className="button button--ghost">{t("forms.clean")}</button>
              <button type="submit" className="button button--accent" disabled={!isValid || submitting}>
                {isSitesFrontendOnly ? t("forms.continueEmail") : submitting ? t("forms.sending") : t("forms.send")} <span aria-hidden="true">-&gt;</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="/" aria-label={t("header.home")}><Brand /></a>
            <p>{t("contact.footerLead")}</p>
            <span className="copyright">&copy; {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">{t("footer.navigation")}</p>
              <a href="/#services">{t("header.services")}</a>
              <a href="/#projects">{t("footer.projects")}</a>
              {isAudienceEnabled("recruiters") ? <a href="/for-recrutiers">{t("footer.recruiters")}</a> : null}
            </div>
            <div>
              <p className="micro-label">{t("contact.destination")}</p>
              <span className="footer-social-link">bruno@criativai.site</span>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>{t("contact.footerBottom")}</span><a className="footer-legal-link" href="/privacy">{t("legal.eyebrow")}</a><a href="#top">{t("header.backToTop")}</a></div>
      </footer>

      <FormSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={t("forms.successTitle")}
        message={t("forms.successMessage")}
      />
    </main>
  );
}
