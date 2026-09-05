import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";
import { EditableCta } from "../components/CtaEditorButton";
import { openAssistantChat } from "../lib/chatContext";

const positions = [
  {
    id: "full-time",
    welcomeKey: "hire-me/open-positions/full-time/hire-me-full-time",
    statusTone: "neutral",
  },
  {
    id: "dedicated-part-time",
    welcomeKey: "hire-me/open-positions/dedicated-part-time/reserve-part-time-capacity",
    statusTone: "open",
  },
  {
    id: "project-design",
    welcomeKey: "hire-me/open-positions/project-design/start-a-custom-build",
    statusTone: "neutral",
  },
  {
    id: "discovery-consulting",
    welcomeKey: "hire-me/open-positions/discovery-consultant-sessions/book-discovery-session",
    statusTone: "open",
  },
  {
    id: "specialized-training",
    welcomeKey: "hire-me/open-positions/specialized-training/plan-training",
    statusTone: "neutral",
  },
] as const;

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function HireMePage() {
  const { t } = useTranslation();
  return (
    <main className="hire-page" id="top">
      <SiteHeader brand={<Brand />} page="hire-me" />

      <section className="hire-hero" aria-labelledby="hire-title">
        <div className="site-container hire-hero-grid">
          <div>
            <p className="eyebrow">{t("hire.eyebrow")}</p>
            <h1 id="hire-title">{t("hire.title")}</h1>
          </div>
          <p>
            {t("hire.lead")}
          </p>
        </div>
      </section>

      <section className="section hire-positions-section" aria-labelledby="hire-positions-title">
        <div className="site-container">
          <div className="section-heading section-heading--split">
            <div>
              <p className="eyebrow">{t("hire.openPositions")}</p>
              <h2 id="hire-positions-title">{t("hire.chooseModel")}</h2>
            </div>
            <p className="section-intro">
              {t("hire.modelLead")}
            </p>
          </div>

          <div className="hire-position-grid">
            {positions.map((position) => (
              <article className="hire-position-card" key={position.id}>
                <div className="hire-position-topline">
                  <span className="micro-label">{t(`hire.positions.${position.id}.eyebrow`)}</span>
                  <span className={`hire-status hire-status--${position.statusTone}`}>
                    <i aria-hidden="true" />
                    {t(`hire.positions.${position.id}.status`)}
                  </span>
                </div>
                <h3>{t(`hire.positions.${position.id}.title`)}</h3>
                <p>{t(`hire.positions.${position.id}.text`)}</p>
                <p>{t(`hire.positions.${position.id}.detail`)}</p>
                <EditableCta welcomeKey={position.welcomeKey}>
                  <button className="button button--accent" type="button" onClick={() => openAssistantChat({ welcomeKey: position.welcomeKey })}>
                    {t(`hire.positions.${position.id}.action`)} <span aria-hidden="true">-&gt;</span>
                  </button>
                </EditableCta>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
