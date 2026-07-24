import { SiteHeader } from "../components/SiteHeader";

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <span className="brand-monogram" aria-hidden="true">CA</span>
      <span className="brand-name">CRIATIVAI</span>
    </span>
  );
}

export default function PrivacyTermsPage() {
  return (
    <main className="policy-page" id="top">
      <SiteHeader brand={<Brand />} page="home" />

      <section className="policy-section" aria-labelledby="policy-title">
        <div className="site-container policy-container">
          <p className="eyebrow">Privacy &amp; Terms</p>
          <h1 id="policy-title">CriativAI Privacy &amp; Terms</h1>
          <p className="policy-updated">Last updated: July 24, 2026</p>

          <div className="policy-content">
            <section aria-labelledby="privacy-title">
              <h2 id="privacy-title">Privacy</h2>
              <p>
                CriativAI uses contact, chat, form, and calendar information only to respond to requests, support scheduling, and provide the services chosen by the user.
              </p>
              <p>
                When Google Calendar is connected, CriativAI may check availability and create, update, or cancel calendar events with Google Meet links. Calendar data is used only for scheduling and is not sold.
              </p>
              <p>
                Access tokens and operational data are stored only as needed to run the service. Access can be revoked by disconnecting the app from the Google account permissions page or by contacting CriativAI.
              </p>
            </section>

            <section aria-labelledby="terms-title">
              <h2 id="terms-title">Terms</h2>
              <p>
                By using CriativAI, you agree to use the site and scheduling features lawfully and only for legitimate business communication.
              </p>
              <p>
                AI-generated responses and scheduling suggestions should be reviewed before relying on them for final business decisions. CriativAI may update or disable features to improve reliability, security, or compliance.
              </p>
              <p>
                For privacy, terms, or data access questions, contact bruno@criativai.site.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
