import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { FormSuccessModal } from "../components/FormSuccessModal";
import { SiteHeader } from "../components/SiteHeader";
import { submitTalentPreview } from "../lib/forms";

type TalentPreviewState = {
  requester_name: string;
  requester_email: string;
  job_title: string;
  search_criteria_1: string;
  search_criteria_2: string;
  search_criteria_3: string;
  search_criteria_4: string;
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
    search_criteria_2: "",
    search_criteria_3: "",
    search_criteria_4: "",
    exclusion_criteria: "",
    differentiator: "",
    started_at_ms: Date.now(),
    honeypot: "",
  };
}

const benefits = [
  ["Up to 20 aligned profiles", "A shortlist that helps you evaluate search quality quickly before committing to a broader rollout."],
  ["Delivered within 24 hours", "A fast first signal for live roles that need structured research, prioritization, and initial fit analysis."],
  ["Built around your criteria", "We translate your brief into search requirements, exclusion rules, and one differentiating signal."],
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <span className="brand-monogram" aria-hidden="true">CA</span>
      <span className="brand-name">CRIATIVAI</span>
    </span>
  );
}

export default function TalentPreviewPage() {
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
      form.search_criteria_1.trim().length >= 2 &&
      form.search_criteria_2.trim().length >= 2 &&
      form.search_criteria_3.trim().length >= 2 &&
      form.search_criteria_4.trim().length >= 2 &&
      form.exclusion_criteria.trim().length >= 2 &&
      form.differentiator.trim().length >= 2
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

    setSubmitting(true);
    setError("");

    try {
      await submitTalentPreview(form);
      setForm(createInitialState());
      setSuccessOpen(true);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to send your request right now.");
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
            <p className="eyebrow"><span /> Complimentary shortlist request</p>
            <h1 id="talent-preview-title">Talent <span>Preview.</span></h1>
            <p className="form-hero-lead">
              Share one open role and receive a curated shortlist of up to 20 relevant professionals within 24 hours.
            </p>
            <p className="form-hero-detail">
              A no-cost diagnostic for specialized recruitment teams that want to test the quality and speed of an AI-supported search before expanding the workflow.
            </p>
            <div className="hero-actions">
              <a className="button button--accent" href="#talent-preview-form">
                Start the Request <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>

          <div className="form-visual-card" aria-label="Preview of a curated candidate shortlist">
            <div className="form-visual-card__head"><span>PREVIEW / LIVE ROLE</span><i>FREE</i></div>
            <div className="form-visual-card__metric"><strong>24h</strong><span>turnaround target</span></div>
            <ul className="form-visual-card__list">
              <li><span>01</span><strong>Role title and search intent</strong></li>
              <li><span>02</span><strong>Four decisive qualification criteria</strong></li>
              <li><span>03</span><strong>One exclusion rule and one differentiator</strong></li>
            </ul>
            <div className="form-visual-card__footer"><span>OUTPUT</span><strong>Up to 20 aligned candidate profiles</strong></div>
          </div>
        </div>
      </section>

      <section className="section form-benefits-section" aria-labelledby="talent-preview-benefits-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">What this gives you</p>
              <h2 id="talent-preview-benefits-title">A fast, evidence-led sample of your search.</h2>
            </div>
            <p className="section-intro">
              Useful for executive search firms, boutique consultancies, independent recruiters, and specialist talent teams.
            </p>
          </div>

          <div className="form-benefits-grid">
            {benefits.map(([title, text]) => (
              <article className="form-benefit-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section form-section-shell" id="talent-preview-form" aria-labelledby="talent-preview-form-title">
        <div className="site-container form-shell-grid">
          <div className="form-shell-copy">
            <p className="eyebrow">Free request form</p>
            <h2 id="talent-preview-form-title">Describe the role. We structure the search.</h2>
            <p>
              Give us the live vacancy, the most important signals to search for, what should disqualify a candidate,
              and one differentiator that would make the shortlist stronger.
            </p>
            <strong>We review the brief and respond to the requester by email within 24 hours.</strong>
          </div>

          <form className="form-panel" onSubmit={onSubmit} onReset={onReset} noValidate>
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Name</span>
                <input name="requester_name" value={form.requester_name} onChange={onChange} placeholder="Your name" required />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input name="requester_email" type="email" value={form.requester_email} onChange={onChange} placeholder="name@company.com" required />
              </label>
            </div>

            <label className="form-field">
              <span>Open role title</span>
              <input name="job_title" value={form.job_title} onChange={onChange} placeholder="Example: VP of AI Product" required />
            </label>

            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Relevant search criterion 01</span>
                <input name="search_criteria_1" value={form.search_criteria_1} onChange={onChange} placeholder="Must-have leadership scope" required />
              </label>
              <label className="form-field">
                <span>Relevant search criterion 02</span>
                <input name="search_criteria_2" value={form.search_criteria_2} onChange={onChange} placeholder="Domain expertise" required />
              </label>
              <label className="form-field">
                <span>Relevant search criterion 03</span>
                <input name="search_criteria_3" value={form.search_criteria_3} onChange={onChange} placeholder="Operational context" required />
              </label>
              <label className="form-field">
                <span>Relevant search criterion 04</span>
                <input name="search_criteria_4" value={form.search_criteria_4} onChange={onChange} placeholder="Geography, language, or seniority" required />
              </label>
            </div>

            <label className="form-field">
              <span>Exclusion characteristic</span>
              <input name="exclusion_criteria" value={form.exclusion_criteria} onChange={onChange} placeholder="Example: no experience scaling teams above 50 people" required />
            </label>

            <label className="form-field">
              <span>Differentiator</span>
              <input name="differentiator" value={form.differentiator} onChange={onChange} placeholder="A strong plus that would elevate the shortlist" required />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              <span>Leave this field empty</span>
              <input name="honeypot" value={form.honeypot} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>

            <input type="hidden" name="started_at_ms" value={form.started_at_ms} />

            {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

            <div className="form-actions">
              <button type="reset" className="button button--ghost">Clean Form</button>
              <button type="submit" className="button button--accent" disabled={!isValid || submitting}>
                {submitting ? "Sending..." : "Send"} <span aria-hidden="true">↗</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="/" aria-label="CriativAI home"><Brand /></a>
            <p>AI-supported recruiting systems designed to help teams find stronger candidates, faster.</p>
            <span className="copyright">© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">Navigation</p>
              <a href="/#services">Services</a>
              <a href="/#projects">Projects</a>
              <a href="/human-resources">Human Resources</a>
              <a href="/contact">Contact</a>
            </div>
            <div>
              <p className="micro-label">Quick links</p>
              <a href="#talent-preview-form">Request form</a>
              <a href="/style">Style</a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>Recruitment intelligence, grounded in clear criteria.</span><a href="#top">Back to top ↑</a></div>
      </footer>

      <FormSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Your request is confirmed."
        message="Thank you for sharing the role brief. We will review it and send your shortlist within 24 hours."
        detail="The automatic confirmation email will start sending as soon as the Mailjet SMTP credentials are added to the environment."
      />
    </main>
  );
}
