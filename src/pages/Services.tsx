import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useTranslation } from "react-i18next";

import { EditableCta } from "../components/CtaEditorButton";
import { ServiceCatalogCard } from "../components/ServiceCatalogCard";
import { serviceCatalog } from "../data/serviceCatalog";
import { openAssistantChat } from "../lib/chatContext";

const steps = [
  {
    welcomeKey: "services/process/initial-ai-briefing/start-ai-briefing-now",
    index: "01",
    compactTitle: false,
  },
  {
    welcomeKey: "services/process/planning-call/book-a-call",
    index: "02",
    compactTitle: false,
  },
  {
    welcomeKey: "services/process/design-and-delivery/ask-my-agent",
    index: "03",
    compactTitle: true,
  },
] as const;

const faqIds = Array.from({ length: 9 }, (_, index) => String(index + 1).padStart(2, "0"));

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

type Step = (typeof steps)[number];

function openProcessCardChat(step: Step) {
  openAssistantChat({ welcomeKey: step.welcomeKey });
}

export default function ServicesPage() {
  const { t } = useTranslation();
  return (
    <main className="services-page" id="top">
      <SiteHeader brand={<Brand />} page="services" />

      <section className="services-page-hero" aria-labelledby="services-page-title">
        <div className="site-container services-page-hero-grid">
          <div>
            <p className="eyebrow">{t("services.whatWeBuild")}</p>
            <h1 id="services-page-title">
              {t("services.heroTitle")}
            </h1>
            <p>
              {t("services.heroLead")}
            </p>
            <span className="sr-only">{t("services.whatWeBuild")}</span>
          </div>
          <div className="services-page-hero-visual" aria-hidden="true">
            <img
              src="/criativai_ai_services.png"
              alt=""
              className="services-page-hero-image"
            />
          </div>
        </div>
      </section>

      <section className="section services-page-list" aria-labelledby="services-list-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("home.services")}</p>
              <h2 id="services-list-title">{t("services.stackTitle")}</h2>
            </div>
            <p className="section-intro">
              {t("services.stackLead")}
            </p>
          </div>

          <div className="services-page-grid">
            {serviceCatalog.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="section services-process-section" aria-labelledby="services-process-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("services.fromIdea")}</p>
              <h2 id="services-process-title">{t("services.stepsTitle")}</h2>
            </div>
            <p className="section-intro">
              {t("services.stepsLead")}
            </p>
          </div>

          <div className="services-process-grid">
            {steps.map((step) => (
              <article className="services-process-card" key={step.index}>
                <span>{step.index}</span>
                <h3 className={step.compactTitle ? "services-process-card__title--compact" : undefined}>{t(`services.steps.${step.index}.title`)}</h3>
                <p>{t(`services.steps.${step.index}.text`)}</p>
                <button className="button services-process-card__cta" type="button" onClick={() => openProcessCardChat(step)}>{t(`services.steps.${step.index}.cta`)}</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-faq-section" aria-labelledby="services-faq-title">
        <div className="site-container services-faq-inner">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("services.faqEyebrow")}</p>
              <h2 id="services-faq-title">{t("services.faqTitle")}</h2>
            </div>
          </div>

          <div className="services-faq-list">
            {faqIds.map((faqId, index) => (
              <details className="services-faq-item" key={faqId} name="services-faq">
                <summary>
                  <h4>{t(`services.faqs.${faqId}.question`)}</h4>
                  <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
                </summary>
                <div className="services-faq-answer">
                  <p>{t(`services.faqs.${faqId}.answer`)}</p>
                  {faqId === "03" ? (
                    <ol>
                      {["01", "02", "03"].map((stepId) => <li key={stepId}>{t(`services.faqs.03.steps.${stepId}`)}</li>)}
                    </ol>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta services-page-cta" aria-labelledby="services-cta-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">{t("services.startBuilding")}</p>
          <h2 id="services-cta-title">
            <span className="services-cta-title-strong">
              <span>{t("services.ctaWhatIdea")}</span>
              <span className="services-cta-title-strong-line2">{t("services.ctaDoYouWant")}</span>
            </span>
            <span className="services-cta-title-accent">{t("services.ctaBringToLife")}</span>
            <span className="services-cta-title-strong">{t("services.ctaMakeReal")}</span>
          </h2>
          <p>
            {t("services.ctaLead")}
          </p>
          <EditableCta welcomeKey="services/global/project-conversation/start-project-conversation">
            <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: "services/global/project-conversation/start-project-conversation" })}>
              {t("services.startConversation")} <span aria-hidden="true">-&gt;</span>
            </button>
          </EditableCta>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
