import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";
import { EditableCta } from "../components/CtaEditorButton";
import { openAssistantChat } from "../lib/chatContext";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

const pillars = [
  {
    id: "digital-operations",
    number: "02",
    itemIds: [
      "administrative-process-automation",
      "recruitment-support-ai-agents",
      "custom-management-systems",
      "performance-operations-dashboards",
      "custom-operational-tools",
      "business-tool-integration",
    ],
  },
  {
    id: "business-discovery",
    number: "03",
    itemIds: [
      "company-prospecting",
      "decision-maker-identification",
      "lead-data-enrichment",
      "evidence-based-personalized-messaging",
      "campaign-automation-and-tracking",
      "ai-sdr-agents",
      "calendar-scheduling-integration",
    ],
  },
  {
    id: "recruitment-intelligence",
    number: "01",
    itemIds: [
      "multi-source-talent-search",
      "candidate-fit-ranking",
      "evidence-based-shortlists",
      "custom-qualification-tests",
      "standardized-assessments",
      "outreach-and-screening",
    ],
  },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

type Pillar = (typeof pillars)[number];

function openBenefitCardChat(pillar: Pillar, itemId: string, buttonKey: "ask-my-agents" | "i-want-it") {
  openAssistantChat({ welcomeKey: `human-resources/${pillar.id}/${itemId}/${buttonKey}` });
}

function HrFooter() {
  const { t } = useTranslation();
  const localizedPath = (path: string) => getLocalizedPath(path, getCurrentLanguage());
  return (
    <footer className="footer" id="footer">
      <div className="site-container footer-grid">
        <div className="footer-brand">
          <a href="#top" aria-label={t("hr.footerHomeAria")}><Brand /></a>
          <p>{t("hr.footerLead")}</p>
          <span className="copyright">{"\u00A9"} {new Date().getFullYear()} CriativAI. {t("footer.rights")}</span>
        </div>
        <div className="footer-links-grid">
          <div>
            <p className="micro-label">{t("footer.navigation")}</p>
            <a href="#overview">{t("hr.overview")}</a>
            <a href="#recruitment-intelligence">{t("hr.pillars.recruitment-intelligence.title")}</a>
            <a href="#digital-operations">{t("hr.pillars.digital-operations.title")}</a>
            <a href="#business-discovery">{t("hr.pillars.business-discovery.title")}</a>
          </div>
          <div>
            <p className="micro-label">{t("footer.social")}</p>
            <a className="footer-social-link" href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">{"\u25B6"}</span>{t("footer.youtube")}</a>
            <a className="footer-social-link" href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">in</span>{t("footer.linkedin")}</a>
            <a className="footer-social-link" href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">Be</span>{t("footer.behance")}</a>
            <a className="footer-social-link" href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">GH</span>{t("footer.github")}</a>
          </div>
        </div>
      </div>
      <div className="site-container footer-bottom"><span>{t("hr.footerBottom")}</span><a className="footer-legal-link" href={localizedPath("/privacy")}>{t("legal.eyebrow")}</a><a href="#top">{t("header.backToTop")} {"\u2191"}</a></div>
    </footer>
  );
}

export default function HumanResourcesPage() {
  const { t } = useTranslation();
  return (
    <main className="hr-page" id="top">
      <SiteHeader brand={<Brand />} page="human-resources" />

      <section className="hr-hero" aria-labelledby="hr-hero-title">
        <div className="hr-hero-glow" aria-hidden="true" />
        <div className="site-container hr-hero-grid hr-hero-grid--solo">
          <div className="hr-hero-copy">
            <p className="eyebrow"><span /> {t("hr.eyebrow")}</p>
            <h1 id="hr-hero-title">
              <span className="hr-hero-title-topline">
            <span className="hr-hero-title-line hr-hero-title-line--streamline">{t("hr.streamline")}</span>
                <span className="hr-hero-title-line hr-hero-title-line--your">{t("hr.your")}</span>
              </span>
              <span className="hr-hero-title-line hr-hero-title-line--recruitment">{t("hr.recruitment")}</span>
              <span className="hr-hero-title-line hr-hero-title-line--operations">{t("hr.operations")}</span>
              <span className="hr-hero-title-line hr-hero-title-line--ai">
                <span className="hr-hero-title-with">{t("hr.with")}</span>
                <span className="hr-hero-title-ai">{t("hr.ai")}</span>
              </span>
            </h1>
            <p className="hr-hero-lead">
              {t("hr.heroLead")}
            </p>
            <p className="hr-hero-detail">
              {t("hr.heroDetail")}
            </p>
            <div className="hero-actions">
              <EditableCta welcomeKey="human-resources/hero/book-a-call">
                <button
                  className="button button--accent"
                  type="button"
                  onClick={() => openAssistantChat({ welcomeKey: "human-resources/hero/book-a-call" })}
                >
                  {t("about.bookCall")} <span aria-hidden="true">{"\u2197"}</span>
                </button>
              </EditableCta>
            </div>
          </div>
        </div>
      </section>

      {pillars.map((pillar) => (
        <section className="section hr-workflow-section" id={pillar.id} aria-labelledby={`${pillar.id}-title`} key={pillar.id}>
          <div className="site-container">
            <div className="hr-section-head">
              <p className="eyebrow">{pillar.number}</p>
              <h2 id={`${pillar.id}-title`}>{t(`hr.pillars.${pillar.id}.title`)}</h2>
              <p className="section-intro">{t(`hr.pillars.${pillar.id}.intro`)}</p>
            </div>
            <div className="hr-benefits-grid">
              {pillar.itemIds.map((itemId) => (
                <article className="hr-benefits-card" key={itemId} tabIndex={0}>
                  <div className="hr-benefits-card-body">
                    <i aria-hidden="true" />
                    <p>{t(`hr.pillars.${pillar.id}.items.${itemId}`)}</p>
                  </div>
                  <div className="hr-benefits-card-actions">
                    <EditableCta welcomeKey={`human-resources/${pillar.id}/${itemId}/ask-my-agents`}>
                      <button type="button" onClick={() => openBenefitCardChat(pillar, itemId, "ask-my-agents")}>{t("chat.askAgents")}</button>
                    </EditableCta>
                    <EditableCta welcomeKey={`human-resources/${pillar.id}/${itemId}/i-want-it`}>
                      <button type="button" onClick={() => openBenefitCardChat(pillar, itemId, "i-want-it")}>{t("services.iWantIt")}</button>
                    </EditableCta>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section hr-value-section" id="overview" aria-labelledby="value-title">
        <div className="site-container hr-value-grid">
          <div>
              <p className="eyebrow">{t("hr.era")}</p>
              <h2 id="value-title">{t("hr.valueTitle")}</h2>
          </div>
          <div className="hr-value-copy">
            <p>
              {t("hr.valueLead")}
            </p>
            <strong>{t("hr.valueStrong")}</strong>
          </div>
        </div>
      </section>

      <section className="final-cta hr-final-cta" aria-labelledby="demo-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">{t("hr.broader")}</p>
          <h2 id="demo-title">
            <span className="hr-demo-title-line hr-demo-title-line--light">{t("hr.buildThe")}</span>
            <span className="hr-demo-title-line hr-demo-title-line--semi-bold">{t("hr.recruitmentCompany")}</span>
            <span className="hr-demo-title-line">{t("hr.youRun")}</span>
          </h2>
          <p>
            {t("hr.finalLead")}
          </p>
          <div className="hero-actions">
            <a className="button button--accent" href={`mailto:hello@criativai.com?subject=${encodeURIComponent(t("hr.demoEmailSubject"))}`}>
              {t("hr.requestDemo")} <span aria-hidden="true">{"\u2197"}</span>
            </a>
            <a className="hr-text-link" href={`mailto:hello@criativai.com?subject=${encodeURIComponent(t("hr.useCaseEmailSubject"))}`}>
              {t("hr.talkUseCase")} <span aria-hidden="true">{"\u2197"}</span>
            </a>
          </div>
        </div>
      </section>

      <HrFooter />
    </main>
  );
}
