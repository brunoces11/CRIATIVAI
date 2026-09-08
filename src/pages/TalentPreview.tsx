import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { FormSuccessModal } from "../components/FormSuccessModal";
import { SiteHeader } from "../components/SiteHeader";
import { submitTalentPreview } from "../lib/forms";
import { buildMailtoHref, isSitesFrontendOnly } from "../lib/sitesRuntime";
import { isAudienceEnabled } from "../lib/audienceVisibility";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

type TalentPreviewState = {
  requester_name: string;
  requester_email: string;
  job_title: string;
  search_criteria_1: string;
  exclusion_criteria: string;
  differentiator: string;
  started_at_ms: number;
  honeypot: string;
};

function createInitialState(): TalentPreviewState {
  return {
    requester_name: "",
    requester_email: "",
    job_title: "",
    search_criteria_1: "",
    exclusion_criteria: "",
    differentiator: "",
    started_at_ms: Date.now(),
    honeypot: "",
  };
}

const benefitIds = ["01", "02", "03"] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function TalentPreviewPage() {
  const { t } = useTranslation();
  const localizedPath = (path: string) => getLocalizedPath(path, getCurrentLanguage());
  const [form, setForm] = useState<TalentPreviewState>(() => createInitialState());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const isValid = useMemo(() => {
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.requester_email);
    return (
      emailOk &&
      form.requester_name.trim().length >= 2 &&
      form.job_title.trim().length >= 2 &&
      form.search_criteria_1.trim().length >= 2
    );
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
        subject: `${t("talent.mailtoSubject")}${form.job_title.trim() ? ` - ${form.job_title.trim()}` : ""}`,
        lines: [
          `${t("talent.mailtoRequester")}: ${form.requester_name.trim() || "-"}`,
          `${t("forms.email")}: ${form.requester_email.trim() || "-"}`,
          `${t("talent.mailtoRole")}: ${form.job_title.trim() || "-"}`,
          "",
          `${t("talent.mailtoPrimaryCriterion")}:`,
          form.search_criteria_1.trim() || "-",
          "",
          `${t("talent.exclusion")}: ${form.exclusion_criteria.trim() || "-"}`,
          `${t("talent.differentiator")}: ${form.differentiator.trim() || "-"}`,
        ],
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await submitTalentPreview(form);
      setForm(createInitialState());
      setSuccessOpen(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : t("talent.sendError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="form-page intake-page" id="top">
      <SiteHeader brand={<Brand />} page="talent-preview" />

      <section className="form-hero intake-hero" aria-labelledby="talent-preview-title">
        <div className="form-hero-glow" aria-hidden="true" />
        <div className="site-container form-hero-grid">
          <div className="form-hero-copy">
            <p className="eyebrow"><span /> {t("talent.complimentary")}</p>
            <h1 id="talent-preview-title">{t("talent.title")} <span>{t("talent.titleAccent")}</span></h1>
            <p className="form-hero-lead">
              {t("talent.lead")}
            </p>
            <p className="form-hero-detail">
              {t("talent.detail")}
            </p>
            <div className="hero-actions">
              <a className="button button--accent" href="#talent-preview-form">
                {t("talent.startRequest")} <span aria-hidden="true">-&gt;</span>
              </a>
            </div>
          </div>

          <div className="form-visual-card" aria-label={t("talent.visualAria")}>
            <div className="form-visual-card__head"><span>{t("talent.visualPreview")}</span><i>{t("talent.free")}</i></div>
            <div className="form-visual-card__metric"><strong>24h</strong><span>{t("talent.turnaround")}</span></div>
            <ul className="form-visual-card__list">
              <li><span>01</span><strong>{t("talent.visualRole")}</strong></li>
              <li><span>02</span><strong>{t("talent.visualBrief")}</strong></li>
              <li><span>03</span><strong>{t("talent.visualSignals")}</strong></li>
            </ul>
            <div className="form-visual-card__footer"><span>{t("talent.output")}</span><strong>{t("talent.visualOutput")}</strong></div>
          </div>
        </div>
      </section>

      <section className="section form-benefits-section" aria-labelledby="talent-preview-benefits-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("talent.whatGives")}</p>
              <h2 id="talent-preview-benefits-title">{t("talent.benefitsTitle")}</h2>
            </div>
            <p className="section-intro">
              {t("talent.benefitsLead")}
            </p>
          </div>

          <div className="form-benefits-grid">
            {benefitIds.map((benefitId) => (
              <article className="form-benefit-card" key={benefitId}>
                <h3>{t(`talent.benefits.${benefitId}.title`)}</h3>
                <p>{t(`talent.benefits.${benefitId}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section form-section-shell" id="talent-preview-form" aria-labelledby="talent-preview-form-title">
        <div className="site-container form-shell-grid">
          <div className="form-shell-copy">
            <p className="eyebrow">{t("talent.formEyebrow")}</p>
            <h2 id="talent-preview-form-title">{t("talent.formTitle")}</h2>
            <p>
              {t("talent.formLead")}
            </p>
            <strong>
              {isSitesFrontendOnly
                ? t("talent.publicNotice")
                : t("talent.backendNotice")}
            </strong>
          </div>

          <form className="form-panel" onSubmit={onSubmit} onReset={onReset} noValidate>
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>{t("forms.name")}</span>
                <input name="requester_name" value={form.requester_name} onChange={onChange} placeholder={t("forms.yourName")} required />
              </label>
              <label className="form-field">
                <span>{t("forms.email")}</span>
                <input name="requester_email" type="email" value={form.requester_email} onChange={onChange} placeholder={t("contact.emailPlaceholder")} required />
              </label>
            </div>

            <label className="form-field">
              <span>{t("talent.roleTitle")}</span>
              <input name="job_title" value={form.job_title} onChange={onChange} placeholder={t("talent.rolePlaceholder")} required />
            </label>

            <label className="form-field">
              <span>{t("talent.searchCriterion")}</span>
              <textarea
                name="search_criteria_1"
                value={form.search_criteria_1}
                onChange={onChange}
                placeholder={t("talent.searchPlaceholder")}
                rows={6}
                required
              />
            </label>

            <label className="form-field">
              <span>{t("talent.exclusion")}</span>
              <input name="exclusion_criteria" value={form.exclusion_criteria} onChange={onChange} placeholder={t("talent.exclusionPlaceholder")} />
            </label>

            <label className="form-field">
              <span>{t("talent.differentiator")}</span>
              <input name="differentiator" value={form.differentiator} onChange={onChange} placeholder={t("talent.differentiatorPlaceholder")} />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              <span>{t("forms.leaveEmpty")}</span>
              <input name="honeypot" value={form.honeypot} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>

            <input type="hidden" name="started_at_ms" value={form.started_at_ms} />

            {isSitesFrontendOnly ? (
              <p className="form-feedback form-feedback--notice">
                {t("talent.formPublicNotice")}
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
            <a href={localizedPath("/")} aria-label={t("header.home")}><Brand /></a>
            <p>{t("talent.footerLead")}</p>
            <span className="copyright">&copy; {new Date().getFullYear()} CriativAI. {t("footer.rights")}</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">{t("header.navigation")}</p>
              <a href={localizedPath("/#services")}>{t("header.services")}</a>
              <a href={localizedPath("/#projects")}>{t("footer.projects")}</a>
              {isAudienceEnabled("recruiters") ? <a href={localizedPath("/for-recrutiers")}>{t("footer.recruiters")}</a> : null}
              <a href={localizedPath("/contact")}>{t("header.contact")}</a>
            </div>
            <div>
              <p className="micro-label">{t("talent.quickLinks")}</p>
              <a href="#talent-preview-form">{t("talent.requestForm")}</a>
              <a href="/style">{t("header.style")}</a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>{t("talent.footerBottom")}</span><a className="footer-legal-link" href={localizedPath("/privacy")}>{t("legal.eyebrow")}</a><a href="#top">{t("header.backToTop")}</a></div>
      </footer>

      <FormSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title={t("talent.successTitle")}
        message={t("talent.successMessage")}
        detail={t("talent.successDetail")}
      />
    </main>
  );
}
