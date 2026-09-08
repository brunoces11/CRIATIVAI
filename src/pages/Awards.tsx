import { useTranslation } from "react-i18next";
import { SiteHeader } from "../components/SiteHeader";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const awardIds = ["01", "02", "03", "04", "05", "06", "07", "08"] as const;
const links: Record<string, Array<{ kind: "competition" | "direct"; url: string }>> = {
  "01": [{ kind: "competition", url: "https://flowgpt.com/bounty/s3-original-prompt-techniques" }, { kind: "direct", url: "https://flowgpt.com/p/cpt-concatenated-prompt-technique-4" }],
  "02": [{ kind: "competition", url: "https://chipp.substack.com/p/chipp-hackathon-winners-showcase" }, { kind: "direct", url: "https://agentos-12981.chipp.ai/" }],
  "03": [{ kind: "competition", url: "https://flowgpt.com/bounty/past-and-future" }, { kind: "direct", url: "https://flowgpt.com/p/track-to-the-future-game-1" }],
  "04": [{ kind: "competition", url: "https://flowgpt.com/bounty/s3-chatgpt-judge" }, { kind: "direct", url: "https://flowgpt.com/p/judgen-ai-1" }],
  "05": [{ kind: "competition", url: "https://flowgpt.com/bounty/promptBattle0724" }, { kind: "direct", url: "https://flowgpt.com/p/nM8rkh83STfc2UIE4E9xj" }],
  "06": [{ kind: "direct", url: "https://flowgpt.com/p/sherlock-hoax-game" }],
  "07": [{ kind: "competition", url: "https://flowgpt.com/bounty/hMydz_Vg7yIIoRQ8wK1y-" }, { kind: "direct", url: "https://flowgpt.com/p/gptinder-your-turbocharged-dating-advisor-16" }],
  "08": [{ kind: "competition", url: "https://flowgpt.com/bounty/xa_9CI5A41wMta9FTyTET" }, { kind: "direct", url: "https://flowgpt.com/p/icon-machine-is-everything-you-need-to-deal-with-icons-4-any-application-2" }],
};

export default function AwardsPage() {
  const { t } = useTranslation();
  const contactPath = getLocalizedPath("/contact", getCurrentLanguage());
  return (
    <main className="awards-page" id="top">
      <SiteHeader brand={<Brand />} page="awards" />
      <article className="awards-article site-container">
        <header className="cpt-article__header">
          <p className="eyebrow">{t("awards.eyebrow")}</p>
          <h1 className="awards-title"><span className="awards-title__text">{t("awards.title")}</span></h1>
          <p>{t("awards.intro")}</p>
        </header>
        {awardIds.map((id) => {
          const image = t(`awards.items.${id}.image`);
          return (
            <section className="award-item" key={id}>
              <p className="eyebrow">{t(`awards.items.${id}.award`)}</p>
              <div className="award-item__grid">
                <img src={`https://pmt.criativai.site/wp-content/uploads/${image.includes("/") ? image : `2024/03/${image}`}`} alt={t(`awards.items.${id}.alt`)} loading="lazy" />
                <div>
                  <h2>{t(`awards.items.${id}.title`)}</h2>
                  <p>{t(`awards.items.${id}.text`)}</p>
                  {links[id].map((link) => <p key={link.url}>{t(`awards.linkLabels.${link.kind}`)}:<br /><a href={link.url} target="_blank" rel="noreferrer">{link.url}</a></p>)}
                </div>
              </div>
            </section>
          );
        })}
        <section className="award-contact"><h2>{t("awards.supportTitle")}</h2><p>{t("awards.supportText")}</p><a className="button button--accent" href={contactPath}>{t("awards.contact")}</a></section>
      </article>
    </main>
  );
}
