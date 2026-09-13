import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

const topics = [
  { id: "cpt", href: "/contatenated-prompt-techique" },
  { id: "ux", href: "/ux-prompt-design" },
  { id: "promptApp", href: "/prompt-app" },
  { id: "metagraph", href: "#metagraph-details", accordion: true },
  { id: "selfContained", href: "#self-contained-details", accordion: true },
  { id: "fullPrompt", href: "#top" },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function ResearchPage() {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  return (
    <main className="research-page" id="top">
      <SiteHeader brand={<Brand />} page="research" />

      <article className="research-article site-container">
        <header className="research-article__header">
          <p className="eyebrow">{t("research.eyebrow")}</p>
          <h1 id="prompt-engineering-creative-research-heading">
            <span className="research-title-line">{t("research.titlePrimary")}</span>
            <span className="research-title-line research-title-line--accent">{t("research.titleAccent")}</span>
          </h1>
          <p className="research-article__dek">{t("research.dek1")}<br />{t("research.dek2")}<br />{t("research.dek3")}</p>
        </header>

        <div className="research-article__body">
          <p>{t("research.intro")}</p>

          <div className="research-topics">
            {topics.map((topic) => (
              topic.id === "metagraph" ? <MetagraphTopic key={topic.id} /> : topic.id === "selfContained" ? <SelfContainedTopic key={topic.id} /> : (
                <section className="research-topic" key={topic.id}>
                  <h2>{t(`research.topics.${topic.id}.title`)}</h2>
                  <p>{t(`research.topics.${topic.id}.summary`)}</p>
                  <a className="research-topic__details" href={topic.href.startsWith("#") ? topic.href : getLocalizedPath(topic.href, currentLanguage)} onClick={topic.href === "#top" ? (event) => event.preventDefault() : undefined}>{t("research.details")} <span aria-hidden="true">-&gt;</span></a>
                </section>
              )
            ))}
          </div>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}

function MetagraphTopic() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={`research-topic research-topic--accordion${expanded ? " is-expanded" : ""}`}>
      <h2>{t("research.topics.metagraph.title")}</h2>
      <p>{t("research.topics.metagraph.summary")}</p>
      <div className="research-topic__accordion-content" hidden={!expanded}>
        <p>{t("research.topics.metagraph.detail1")}</p>
        <p>{t("research.topics.metagraph.detail2")}</p>
      </div>
      <a className="research-topic__details" href="#metagraph-details" role="button" aria-expanded={expanded} onClick={(event) => { event.preventDefault(); setExpanded((value) => !value); }}>{t("research.details")} <span aria-hidden="true">{expanded ? "^" : "-&gt;"}</span></a>
    </section>
  );
}

function SelfContainedTopic() {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={`research-topic research-topic--accordion${expanded ? " is-expanded" : ""}`}>
      <h2>{t("research.topics.selfContained.title")}</h2>
      <p>{t("research.topics.selfContained.summary")}</p>
      <p><strong>{t("research.topics.selfContained.strong")}</strong></p>
      <div className="research-topic__accordion-content" hidden={!expanded}>
        <p>{t("research.topics.selfContained.detail1")}</p>
        <p>{t("research.topics.selfContained.detail2")}</p>
      </div>
      <a className="research-topic__details" href="#self-contained-details" role="button" aria-expanded={expanded} onClick={(event) => { event.preventDefault(); setExpanded((value) => !value); }}>{t("research.details")} <span aria-hidden="true">{expanded ? "^" : "-&gt;"}</span></a>
    </section>
  );
}
