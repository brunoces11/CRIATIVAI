import { useState } from "react";

import { EditableCta } from "../components/CtaEditorButton";
import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";
import { openAssistantChat } from "../lib/chatContext";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

type Award = {
  image: string;
  grayscaleImage: string;
  resultsUrl?: string;
  projectUrl: string;
};

type Experience = {
  companyMark: string;
  hasWorkMode: boolean;
  hasDescription: boolean;
  skillCount: number;
};

const featureColumns = [
  { id: "01", itemCount: 6 },
  { id: "02", itemCount: 6 },
  { id: "03", itemCount: 5 },
] as const;

const stats = [
  { id: "01", value: "20+" },
  { id: "02", value: "50+" },
  { id: "03", value: "150K+" },
  { id: "04", value: "5+" },
] as const;

const productCycle = [
  { index: "01" },
  { index: "02" },
  { index: "03" },
  { index: "04" },
  { index: "05" },
] as const;

const professionalExperience: Experience[] = [
  { companyMark: "DI", hasWorkMode: true, hasDescription: false, skillCount: 4 },
  { companyMark: "DI", hasWorkMode: true, hasDescription: false, skillCount: 4 },
  { companyMark: "EF", hasWorkMode: true, hasDescription: true, skillCount: 3 },
  { companyMark: "PM", hasWorkMode: true, hasDescription: false, skillCount: 3 },
  { companyMark: "TM", hasWorkMode: true, hasDescription: true, skillCount: 4 },
  { companyMark: "CA", hasWorkMode: false, hasDescription: true, skillCount: 3 },
  { companyMark: "II", hasWorkMode: false, hasDescription: true, skillCount: 4 },
  { companyMark: "CB", hasWorkMode: false, hasDescription: true, skillCount: 4 },
  { companyMark: "CS", hasWorkMode: false, hasDescription: true, skillCount: 4 },
  { companyMark: "VC", hasWorkMode: false, hasDescription: true, skillCount: 4 },
  { companyMark: "IDS", hasWorkMode: false, hasDescription: true, skillCount: 4 },
];

const awards: Award[] = [
  {
    image: "/CPT_TUB_AGENTOS.jpg",
    grayscaleImage: "/PB_CPT_TUB_AGENTOS.jpg",
    resultsUrl: "https://chipp.substack.com/p/chipp-hackathon-winners-showcase",
    projectUrl: "https://agentos-12981.chipp.ai/",
  },
  {
    image: "/CPT_TUB.jpg",
    grayscaleImage: "/PB_CPT_TUB.jpg",
    resultsUrl: "https://flowgpt.com/bounty/s3-original-prompt-techniques",
    projectUrl: "https://flowgpt.com/p/cpt-concatenated-prompt-technique-4",
  },
  {
    image: "/TUB_JUDGEN.jpg",
    grayscaleImage: "/PB_TUB_JUDGEN.jpg",
    resultsUrl: "https://flowgpt.com/bounty/s3-chatgpt-judge",
    projectUrl: "https://flowgpt.com/p/judgen-ai-1",
  },
  {
    image: "/TIME_TUB2.jpg",
    grayscaleImage: "/PB_TIME_TUB2.jpg",
    resultsUrl: "https://flowgpt.com/bounty/past-and-future",
    projectUrl: "https://flowgpt.com/p/track-to-the-future-game-1",
  },
  {
    image: "/GPTINDER_Brazil.jpg",
    grayscaleImage: "/PB_GPTINDER_Brazil.jpg",
    resultsUrl: "https://flowgpt.com/bounty/hMydz_Vg7yIIoRQ8wK1y-",
    projectUrl: "https://flowgpt.com/p/gptinder-your-turbocharged-dating-advisor-16",
  },
  {
    image: "/TUB_ICON_v2.jpg",
    grayscaleImage: "/PB_TUB_ICON_v2.jpg",
    resultsUrl: "https://flowgpt.com/bounty/xa_9CI5A41wMta9FTyTET",
    projectUrl: "https://flowgpt.com/p/icon-machine-is-everything-you-need-to-deal-with-icons-4-any-application-2",
  },
  {
    image: "/MINECRAFT_MASHUP_CHATGPT_GAME.jpg",
    grayscaleImage: "/PB_MINECRAFT_MASHUP_CHATGPT_GAME.jpg",
    resultsUrl: "https://flowgpt.com/bounty/promptBattle0724",
    projectUrl: "https://flowgpt.com/p/nM8rkh83STfc2UIE4E9xj",
  },
  {
    image: "/SHERLOCK_TUB.jpg",
    grayscaleImage: "/PB_SHERLOCK_TUB.jpg",
    projectUrl: "https://flowgpt.com/p/sherlock-hoax-game",
  },
];

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function AboutMePage() {
  const { t } = useTranslation();
  const localizedPath = (path: string) => getLocalizedPath(path, getCurrentLanguage());
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null);

  const toggleAccordion = (accordionId: string) => {
    setOpenAccordionId((currentId) => currentId === accordionId ? null : accordionId);
  };

  return (
    <main className="about-me-page" id="top">
      <SiteHeader brand={<Brand />} page="about-me" />

      <section className="about-me-hero" aria-labelledby="about-me-title">
        <div className="site-container about-me-hero-grid">
          <div className="about-me-hero-copy">
            <h1 id="about-me-title">
              {t("about.heroTitle")} <span className="about-me-title-subline">{t("about.heroSubtitle")}</span>
            </h1>
            <p className="about-me-hero-role">{t("about.heroRole")}</p>
            <p className="about-me-hero-lead">
              {t("about.heroLead")}
            </p>
            <div className="hero-actions about-me-actions">
              <a className="button button--ghost" href={localizedPath("/contact")}>
                {t("about.dropMessage")} <span aria-hidden="true">-&gt;</span>
              </a>
              <EditableCta welcomeKey="about-me/hero/bruno-profile/ask-my-assistant">
                <button className="button button--light" type="button" onClick={() => openAssistantChat({ welcomeKey: "about-me/hero/bruno-profile/ask-my-assistant" })}>
                  {t("chat.askAssistant")} <span aria-hidden="true">-&gt;</span>
                </button>
              </EditableCta>
              <EditableCta welcomeKey="about-me/hero/bruno-profile/book-a-call">
                <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: "about-me/hero/bruno-profile/book-a-call" })}>
                  {t("about.bookCall")} <span aria-hidden="true">-&gt;</span>
                </button>
              </EditableCta>
            </div>
          </div>

          <div className="about-me-portrait-column">
            <div className="about-me-portrait-card">
              <img
                src="/Bruno_cesar_ai_architect_edge.png"
                alt={t("about.portraitAlt")}
                className="about-me-portrait"
              />
              <span className="about-me-portrait-name">{t("about.portraitName")}</span>
              <div className="about-me-portrait-meta">
                <strong>{t("about.portraitMeta")}</strong>
              </div>
            </div>
            <nav className="about-me-social-links" aria-label={t("about.socialAria")}>
              <a href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener" aria-label={t("footer.youtube")} title={t("footer.youtube")}>YT</a>
              <a href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener" aria-label={t("footer.linkedin")} title={t("footer.linkedin")}>in</a>
              <a href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener" aria-label={t("footer.behance")} title={t("footer.behance")}>Be</a>
              <a href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener" aria-label={t("footer.github")} title={t("footer.github")}>GH</a>
            </nav>
          </div>
        </div>
      </section>

      <section className="stats-section about-me-stats-section" id="experience" aria-label={t("about.statsAria")}>
        <div className="site-container stats-grid">
          {stats.map((stat) => (
            <article className="stat" key={stat.value}>
              <strong className="stat-value">{stat.value}</strong>
            <p>{t(`about.stats.${stat.id}`)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section about-me-product-cycle-section" aria-labelledby="about-me-product-cycle-title">
        <div className="site-container">
          <div className="about-me-product-cycle-heading">
            <p className="eyebrow">{t("about.fullCycle")}</p>
            <h2 id="about-me-product-cycle-title">
              <span className="about-me-product-cycle-line about-me-product-cycle-line--primary">{t("about.oneProfessional")}</span>
              <span className="about-me-product-cycle-line about-me-product-cycle-line--secondary">{t("about.fullProductCycle")}</span>
            </h2>
            <p>{t("about.cycleLead")}</p>
          </div>

          <div className="about-me-product-cycle-grid">
            {productCycle.map((item) => (
              <article className="about-me-product-cycle-card" key={item.index}>
                <span>{item.index}</span>
                <h3>{t(`about.productCycle.${item.index}.title`)}</h3>
                <p>{t(`about.productCycle.${item.index}.text`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-me-features-section" aria-labelledby="about-me-features-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "features" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-features-title">{t("about.capabilitiesTitle")}</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "features"}
                aria-controls="about-me-features-panel"
                onClick={() => toggleAccordion("features")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">{t("about.techStack")}</p>
                  <h3 className="about-me-awards-heading-title">{t("about.capabilities")}</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    {t("about.capabilitiesLead")}
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">{t("about.clickDetails")}</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-features-panel"
                className="about-me-awards-panel"
                hidden={openAccordionId !== "features"}
              >
                <div className="about-me-feature-grid">
                  {featureColumns.map((column) => (
                    <article className="about-me-feature-card" key={column.id}>
                      <h3>{t(`about.features.${column.id}.title`)}</h3>
                      <ul>
                        {Array.from({ length: column.itemCount }, (_, itemIndex) => (
                          <li key={itemIndex}>{t(`about.features.${column.id}.items.${String(itemIndex + 1).padStart(2, "0")}`)}</li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-me-awards-section" aria-labelledby="about-me-awards-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "awards" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-awards-title">{t("about.awardsTitle")}</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "awards"}
                aria-controls="about-me-awards-panel"
                onClick={() => toggleAccordion("awards")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">{t("about.awards")}</p>
                  <h3 className="about-me-awards-heading-title">{t("about.promptEngineering")}</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    {t("about.awardsLead")}
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">{t("about.clickDetails")}</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-awards-panel"
                className="about-me-awards-panel"
                hidden={openAccordionId !== "awards"}
              >
                <div className="about-me-awards-grid">
                  {awards.map((award, awardIndex) => (
                    <article className="about-me-award-card" key={award.projectUrl}>
                      <div className="about-me-award-image-wrap">
                        <img src={award.grayscaleImage} alt="" className="about-me-award-image about-me-award-image--gray" loading="lazy" />
                        <img src={award.image} alt="" className="about-me-award-image about-me-award-image--color" loading="lazy" />
                      </div>
                      <div className="about-me-award-content">
                        <p className="about-me-award-result">{t(`about.awardItems.${awardIndex}.result`)}</p>
                        <p className="about-me-award-category">{t(`about.awardItems.${awardIndex}.category`)}</p>
                        <h3>{t(`about.awardItems.${awardIndex}.title`)}</h3>
                        <p>{t(`about.awardItems.${awardIndex}.description`)}</p>
                        <div className="about-me-award-links">
                          {award.resultsUrl ? (
                            <a href={award.resultsUrl} target="_blank" rel="noreferrer noopener">
                              {t("about.resultsPage")} <span aria-hidden="true">-&gt;</span>
                            </a>
                          ) : null}
                          <a href={award.projectUrl} target="_blank" rel="noreferrer noopener">
                            {t("about.openProject")} <span aria-hidden="true">-&gt;</span>
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-me-experience-section" aria-labelledby="about-me-experience-title">
        <div className="site-container">
          <div className="about-me-awards-accordion">
            <article className={`about-me-awards-accordion-item${openAccordionId === "experience" ? " is-open" : ""}`}>
              <h2 className="sr-only" id="about-me-experience-title">{t("about.experienceTitle")}</h2>
              <button
                type="button"
                className="section-heading section-heading--split about-me-awards-heading"
                aria-expanded={openAccordionId === "experience"}
                aria-controls="about-me-experience-panel"
                onClick={() => toggleAccordion("experience")}
              >
                <div className="about-me-awards-heading-copy">
                  <p className="eyebrow">{t("about.professional")}</p>
                  <h3 className="about-me-awards-heading-title">{t("about.experience")}</h3>
                </div>
                <div className="about-me-awards-heading-side">
                  <p className="section-intro about-me-awards-intro">
                    {t("about.experienceLead")}
                  </p>
                </div>
                <span className="about-me-awards-chevron-wrap" aria-hidden="true">
                  <span className="about-me-awards-hover-label">{t("about.clickDetails")}</span>
                  <span className="about-me-awards-chevron">
                    <span />
                    <span />
                  </span>
                </span>
              </button>

              <div
                id="about-me-experience-panel"
                className="about-me-awards-panel about-me-experience-panel"
                hidden={openAccordionId !== "experience"}
              >
                <div className="about-me-timeline">
                  {professionalExperience.map((experience, experienceIndex) => (
                    <article
                      className="about-me-timeline-item"
                      key={experienceIndex}
                    >
                      <div className="about-me-timeline-card">
                        <div className="about-me-timeline-card-header">
                          <span className="about-me-timeline-company-mark" aria-hidden="true">
                            {experience.companyMark}
                          </span>
                          <div>
                            <p className="about-me-timeline-company">{t(`about.experienceItems.${experienceIndex}.company`)}</p>
                            <h3>{t(`about.experienceItems.${experienceIndex}.role`)}</h3>
                          </div>
                        </div>
                        <p className="about-me-timeline-period">{t(`about.experienceItems.${experienceIndex}.period`)}</p>
                        <p className="about-me-timeline-location">
                          {t(`about.experienceItems.${experienceIndex}.location`)}{experience.hasWorkMode ? ` | ${t(`about.experienceItems.${experienceIndex}.workMode`)}` : ""}
                        </p>
                        {experience.hasDescription ? <p className="about-me-timeline-description">{t(`about.experienceItems.${experienceIndex}.description`)}</p> : null}
                        <ul className="about-me-timeline-skills" aria-label={t("about.skillsAria", { company: t(`about.experienceItems.${experienceIndex}.company`) })}>
                          {Array.from({ length: experience.skillCount }, (_, skillIndex) => <li key={skillIndex}>{t(`about.experienceItems.${experienceIndex}.skills.${skillIndex}`)}</li>)}
                        </ul>
                      </div>
                      <span className="about-me-timeline-marker" aria-hidden="true" />
                    </article>
                  ))}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="final-cta about-me-final-cta" aria-labelledby="about-me-cta-title">
        <div className="cta-orbit cta-orbit--one" aria-hidden="true" />
        <div className="cta-orbit cta-orbit--two" aria-hidden="true" />
        <div className="site-container final-cta-inner">
          <p className="eyebrow">{t("about.buildConfidence")}</p>
          <h2 id="about-me-cta-title">{t("about.finalTitle")}</h2>
          <p>{t("about.finalLead")}</p>
          <div className="hero-actions about-me-cta-actions">
            <a className="button button--ghost" href={localizedPath("/contact")}>
              {t("about.contactBruno")} <span aria-hidden="true">-&gt;</span>
            </a>
            <EditableCta welcomeKey="about-me/final-cta/build-with-confidence/ask-my-assistant">
              <button className="button button--light" type="button" onClick={() => openAssistantChat({ welcomeKey: "about-me/final-cta/build-with-confidence/ask-my-assistant" })}>
                {t("chat.askAssistant")} <span aria-hidden="true">-&gt;</span>
              </button>
            </EditableCta>
            <EditableCta welcomeKey="about-me/final-cta/build-with-confidence/book-a-call">
              <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: "about-me/final-cta/build-with-confidence/book-a-call" })}>
                {t("about.bookCall")} <span aria-hidden="true">-&gt;</span>
              </button>
            </EditableCta>
          </div>
        </div>
      </section>

      <footer className="footer" id="footer">
        <div className="site-container footer-grid">
          <div className="footer-brand">
            <a href="#top" aria-label={t("about.footerHomeAria")}><Brand /></a>
            <p>{t("footer.productLead")}</p>
            <span className="copyright">&copy; {new Date().getFullYear()} CriativAI. {t("footer.rights")}</span>
          </div>
          <div className="footer-links-grid">
            <div>
              <p className="micro-label">{t("header.navigation")}</p>
              <a href={localizedPath("/#services")}>{t("header.services")}</a>
              <a href={localizedPath("/#projects")}>{t("header.projects")}</a>
              <a href={localizedPath("/about-me")}>{t("header.about")}</a>
              <a href={localizedPath("/contact")}>{t("header.contact")}</a>
            </div>
            <div>
              <p className="micro-label">{t("footer.social")}</p>
              <a className="footer-social-link" href="https://www.youtube.com/@tutorialmasterbrasil" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">YT</span>{t("footer.youtube")}</a>
              <a className="footer-social-link" href="https://www.linkedin.com/in/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">in</span>{t("footer.linkedin")}</a>
              <a className="footer-social-link" href="https://www.behance.net/brunoalecrim" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">Be</span>{t("footer.behance")}</a>
              <a className="footer-social-link" href="https://github.com/brunoces11" target="_blank" rel="noreferrer noopener"><span className="footer-social-icon" aria-hidden="true">GH</span>{t("footer.github")}</a>
            </div>
          </div>
        </div>
        <div className="site-container footer-bottom"><span>{t("footer.bottom")}</span><a className="footer-legal-link" href={localizedPath("/privacy")}>{t("legal.eyebrow")}</a><a href="#top">{t("header.backToTop")}</a></div>
      </footer>
    </main>
  );
}
