import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { FormSuccessModal } from "../components/FormSuccessModal";
import { SiteHeader } from "../components/SiteHeader";
import { submitContact } from "../lib/forms";

type ContactState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
};

const initialState: ContactState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  honeypot: "",
};

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <span className="brand-monogram" aria-hidden="true">CA</span>
      <span className="brand-name">CRIATIVAI</span>
    </span>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactState>(initialState);
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
    setForm(initialState);
    setError("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await submitContact(form);
      setForm(initialState);
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
        <div className="site-container form-hero-grid">
          <div className="form-hero-copy">
            <p className="eyebrow"><span /> Contact CriativAI</p>
            <h1 id="contact-page-title">Start a <span>conversation.</span></h1>
            <p className="form-hero-lead">
              Tell us what you are building, automating, or exploring—and we will get back to you directly.
            </p>
            <p className="form-hero-detail">
              This form sends your message to Bruno at CriativAI and stores the submission for reliable follow-up inside the project database.
            </p>
          </div>

          <div className="form-visual-card form-visual-card--compact" aria-label="Contact response expectations">
            <div className="form-visual-card__head"><span>CONTACT FLOW</span><i>OPEN</i></div>
            <div className="form-visual-card__metric"><strong>1</strong><span>direct inbox destination</span></div>
            <ul className="form-visual-card__list">
              <li><span>01</span><strong>Name and email</strong></li>
              <li><span>02</span><strong>Subject and message</strong></li>
              <li><span>03</span><strong>Saved and forwarded for follow-up</strong></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section form-section-shell" aria-labelledby="contact-form-title">
        <div className="site-container form-shell-grid">
          <div className="form-shell-copy">
            <p className="eyebrow">Direct contact form</p>
            <h2 id="contact-form-title">A clear path to the right next step.</h2>
            <p>
              Use this space for project inquiries, automation requests, partnership opportunities, or any business question that deserves a thoughtful response.
            </p>
            <strong>All fields are required so the reply can be relevant from the first exchange.</strong>
          </div>

          <form className="form-panel" onSubmit={onSubmit} onReset={onReset} noValidate>
            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Name</span>
                <input name="name" value={form.name} onChange={onChange} placeholder="Your name" required />
              </label>
              <label className="form-field">
                <span>Email</span>
                <input name="email" type="email" value={form.email} onChange={onChange} placeholder="name@company.com" required />
              </label>
            </div>

            <label className="form-field">
              <span>Subject</span>
              <input name="subject" value={form.subject} onChange={onChange} placeholder="What would you like to discuss?" required />
            </label>

            <label className="form-field">
              <span>Message</span>
              <textarea name="message" value={form.message} onChange={onChange} placeholder="Share the context, goal, or challenge." rows={7} required />
            </label>

            <label className="form-honeypot" aria-hidden="true">
              <span>Leave this field empty</span>
              <input name="honeypot" value={form.honeypot} onChange={onChange} tabIndex={-1} autoComplete="off" />
            </label>

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
            <p>AI-powered products, automations, and grounded systems designed for real business work.</p>
            <span className="copyright">© {new Date().getFullYear()} CriativAI. All rights reserved.</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">Navigation</p>
              <a href="/#services">Services</a>
              <a href="/#projects">Projects</a>
              <a href="/human-resources">Human Resources</a>
              <a href="/style">Style</a>
            </div>
            <div>
              <p className="micro-label">Destination</p>
              <span className="footer-social-link">bruno@criativai.site</span>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>Direct contact, with context preserved.</span><a href="#top">Back to top ↑</a></div>
      </footer>

      <FormSuccessModal
        open={successOpen}
        onClose={() => setSuccessOpen(false)}
        title="Message sent successfully."
        message="Thanks for reaching out. Your message has been received and will be reviewed as soon as possible."
      />
    </main>
  );
}
