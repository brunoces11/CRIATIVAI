import { SiteHeader } from "../components/SiteHeader";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isAudienceEnabled } from "../lib/audienceVisibility";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

import { ServiceCatalogCard } from "../components/ServiceCatalogCard";
import { serviceCatalog } from "../data/serviceCatalog";

const groundingTopicIds = Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(2, "0"));

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

function ProjectVisual({ type }: { type: "hr" | "trading" | "dante" }) {
  const src =
    type === "hr"
      ? "/tub_dashboard_inteligence.png"
      : type === "trading"
        ? "/tub_ai-first-trading-plataform.png"
        : "/tub_dante_ai_legal_system.png";

  if (type === "hr") {
    return (
      <div className="project-visual project-visual--hr" aria-hidden="true">
        <div className="project-graphic-scale">
          <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
        </div>
      </div>
    );
  }

  if (type === "trading") {
    return (
      <div className="project-visual project-visual--trading" aria-hidden="true">
        <div className="project-graphic-scale">
          <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="project-visual project-visual--dante" aria-hidden="true">
      <div className="project-graphic-scale">
        <img className="project-visual-image" src={src} alt="" aria-hidden="true" />
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const localizedPath = (path: string) => getLocalizedPath(path, getCurrentLanguage());
  const [expandedGroundingTopic, setExpandedGroundingTopic] = useState<{ columnId: string; title: string } | null>(null);

  const toggleGroundingTopic = (columnId: string, topicTitle: string) => {
    setExpandedGroundingTopic((currentTopic) =>
      currentTopic?.columnId === columnId && currentTopic.title === topicTitle ? null : { columnId, title: topicTitle },
    );
  };

  return (
    <main id="top">
      <SiteHeader brand={<Brand />} />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-atmosphere" aria-hidden="true" />
        <div className="site-container hero-grid">
          <div className="hero-copy">
            <span className="sr-only">{t("home.servicesCoverage")}</span>
            <span className="sr-only">{t("home.leadCoverage")}</span>
            <p className="eyebrow hero-eyebrow"><span /> {t("home.heroEyebrow")}</p>
            <h1 id="hero-title" className="hero-title">
              <span className="hero-line hero-line--one">{t("video.creative")}</span>
              <span className="hero-line hero-line--two">{t("video.aiSolutions")}</span>
            </h1>
            <div className="hero-intro">
              <p>
                {t("home.heroLead")}
              </p>
              <div className="hero-actions">
                    <a className="button button--light" href={localizedPath("/contact")}>{t("home.talk")} <span aria-hidden="true">{"\u2197"}</span></a>
              </div>
            </div>
          </div>

          <div className="hero-portrait-column">
            <div className="portrait-orbit portrait-orbit--outer" aria-hidden="true" />
            <div className="portrait-orbit portrait-orbit--inner" aria-hidden="true" />
            <div className="hero-portrait-frame">
              <img
                src="/bruno-portrait.png"
                alt={t("home.portraitAlt")}
                className="hero-portrait"
              />
              <div className="hero-portrait-shade" aria-hidden="true" />
            </div>
          </div>
        </div>
        <a className="scroll-cue" href="#projects" aria-label={t("video.scrollProjects")}>
          <span>{t("home.scroll")}</span><i aria-hidden="true" />
        </a>
      </section>


      <section className="section grounding-section" id="custom-development" aria-labelledby="custom-development-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="custom-development-title">{t("home.customDevelopment")}</h2>
            <h3>{t("home.customLead")}</h3>
            <p>{t("home.customText")}</p>
            <div className="grounding-actions">
              <a className="button button--accent" href={localizedPath("/contact")}>{t("home.iWantBuild")}</a>
              <a className="button button--ghost" href={localizedPath("/contact")}>{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel grounding-panel--image">
            <img
              src="/TUB_BRUNO_CESAR_CUSTOM_DEVELOPMENT.png"
              alt={t("home.customImageAlt")}
              className="grounding-panel-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section grounding-section" id="grounding" aria-labelledby="grounding-title">
        <div className="grounding-orbit" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="grounding-title">{t("home.knowledgeGrounding")}</h2>
            <h3>{t("home.groundingLead")}</h3>
            <p>{t("home.groundingText")}</p>
            <div className="grounding-actions">
              <a className="button button--accent" href={localizedPath("/contact")}>{t("home.iWantBuild")}</a>
              <a className="button button--ghost" href={localizedPath("/contact")}>{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel">
            <div className="grounding-panel-head">
              <span>{t("video.enterpriseLayer")}</span>
              <span>{t("video.capabilitiesCount")}</span>
            </div>
            <div className="topic-list" role="list">
              <div className="topic-list-column">
                {groundingTopicIds.map((topicId, index) => {
                  const isExpanded = expandedGroundingTopic?.title === topicId;
                  const isCompact = Boolean(expandedGroundingTopic) && !isExpanded;
                  const detailId = `grounding-topic-${index}`;

                  return (
                    <div
                      role="listitem"
                      className={`topic-list-item${isExpanded ? " is-expanded" : ""}${isCompact ? " is-compact" : ""}`}
                      key={topicId}
                    >
                      <button
                        type="button"
                        className="topic-list-button"
                        aria-expanded={isExpanded}
                        aria-controls={detailId}
                        onClick={() => toggleGroundingTopic("single", topicId)}
                      >
                        <span className="topic-list-toggle" aria-hidden="true" />
                        <span className="topic-list-index">{String(index + 1).padStart(2, "0")}</span>
                        <span className="topic-list-title">{t(`home.groundingTopics.${topicId}.title`)}</span>
                        <span id={detailId} className="topic-list-detail" hidden={!isExpanded}>
                          {t(`home.groundingTopics.${topicId}.description`)}
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section grounding-section grounding-section--lead-gen" id="lead-generation" aria-labelledby="lead-generation-title">
        <div className="grounding-orbit grounding-orbit--right" aria-hidden="true" />
        <div className="site-container grounding-grid">
          <div className="grounding-copy">
            <h2 id="lead-generation-title">{t("video.leadTitle")}</h2>
            <h3>{t("video.leadSubtitle")}</h3>
            <p>{t("video.leadText")}</p>
            <div className="grounding-actions">
              <a className="button button--accent" href={localizedPath("/contact")}>{t("services.iWantIt")}</a>
              <a className="button button--ghost" href={localizedPath("/contact")}>{t("about.bookCall")}</a>
            </div>
          </div>
          <div className="grounding-panel grounding-panel--image">
            <img
              src="/LEAD_FUNNEL.png"
              alt={t("home.leadImageAlt")}
              className="grounding-panel-image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section projects-section" id="projects" aria-labelledby="projects-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <h2 id="projects-title">{t("home.projects")}</h2>
            </div>
          </div>

          <div className="projects-grid">
            <article className="project-card" id="human-resources">
              <ProjectVisual type="hr" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">01 / {t("video.automation")}</p>
                <h3>{t("video.projectDashboard")}</h3>
                <p>{t("video.projectDashboardText")}</p>
              </div>
            </article>

            <article className="project-card">
              <ProjectVisual type="trading" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">02 / {t("video.fintech")}</p>
                <h3>{t("video.projectTrading")}</h3>
                <p>{t("video.projectTradingText")}</p>
              </div>
            </article>

            <article className="project-card">
              <ProjectVisual type="dante" />
              <div className="project-overlay" />
              <div className="project-content">
                <p className="project-index">03 / {t("video.legalAi")}</p>
                <h3>Dante <span>{t("video.legalAiPlatform")}</span></h3>
                <p>{t("video.projectDanteText")}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section services-section" id="services" aria-labelledby="services-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("video.whatWeBuild")}</p>
              <h2 id="services-title">{t("home.services")}</h2>
            </div>
            <p className="section-intro">{t("video.servicesLead")}</p>
          </div>

          <div className="services-grid services-page-grid">
            {serviceCatalog.map((service) => (
              <ServiceCatalogCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="final-cta" id="contact" aria-labelledby="contact-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">{t("home.startConversation")}</p>
          <h2 id="contact-title">
            <span>{t("video.readyToBuild")}</span>
            <span>{t("video.nextAiProduct")}</span>
          </h2>
          <p>{t("video.finalLead")}</p>
          <a className="button button--accent" href={localizedPath("/contact")}>
            {t("home.startProject")} <span aria-hidden="true">{"\u2197"}</span>
          </a>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label={t("header.home")}><Brand /></a>
            <p>{t("footer.productLead")}</p>
            <span className="copyright">{"\u00A9"} {new Date().getFullYear()} CriativAI. {t("footer.rights")}</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">{t("footer.navigation")}</p>
              <a href="#services">{t("header.services")}</a>
              <a href="#projects">{t("footer.projects")}</a>
              {isAudienceEnabled("recruiters") ? <a href={localizedPath("/for-recrutiers")}>{t("footer.recruiters")}</a> : null}
              <a href={localizedPath("/contact")}>{t("header.contact")}</a>
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
        <div className="site-container footer-bottom"><span>{t("footer.bottom")}</span><a className="footer-legal-link" href={localizedPath("/privacy")}>{t("legal.eyebrow")}</a><a href="#top">{t("header.backToTop")} {"\u2191"}</a></div>
      </footer>
    </main>
  );
}
