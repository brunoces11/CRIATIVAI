import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

function Brand() { return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>; }

type Build = {
  id: string;
  image: string;
  stackCount: number;
  repo?: string;
};

const builds: Build[] = [
  { id: "01", image: "criativai_skill_full_deploy_bruno_cesar_context_prompt_engineer.jpg", stackCount: 5, repo: "https://github.com/brunoces11/Full-Deploy" },
  { id: "02", image: "criativai_skill_target_mode_bruno_cesar_context_prompt_engineer.jpg", stackCount: 5, repo: "https://github.com/brunoces11/Target-Mode" },
  { id: "03", image: "criativai_pffset_print_ai__bruno_cesar_context_prompt_engineer.jpg", stackCount: 7, repo: "https://github.com/brunoces11/print_ai/tree/master" },
  { id: "04", image: "criativai_tldraw_turbo_bruno_cesar_context_prompt_engineer.jpg", stackCount: 5, repo: "https://github.com/brunoces11/tldraw-turbo" },
  { id: "05", image: "criativai_social_media_viral_videos_scraper_bruno_cesar_context_prompt_engineer.jpg", stackCount: 1, repo: "https://github.com/brunoces11/social_scraper" },
  { id: "06", image: "criativai_batch_AI_video_generator_bruno_cesar_context_prompt_engineer.jpg", stackCount: 6, repo: "https://github.com/brunoces11/batch_video_generator" },
  { id: "07", image: "criativai_AI_NEWS_REPLICATOR__bruno_cesar_context_prompt_engineer.jpg", stackCount: 0 },
  { id: "08", image: "criativai_weavy_photo_studio_bruno_cesar_context_prompt_engineer.jpg", stackCount: 0 },
  { id: "09", image: "criativai_robloger_from_idea_to_post_in_one_click_bruno_cesar_context_prompt_engineer.jpg", stackCount: 0 },
  { id: "10", image: "criativai_metagraph_chunking_bruno_cesar_context_prompt_engineer.jpg", stackCount: 5, repo: "https://github.com/brunoces11/MetaGraph" },
] as const;

export default function LabPage() {
  const { t } = useTranslation();
  const contactPath = getLocalizedPath("/contact", getCurrentLanguage());
  return (
    <main className="lab-page" id="top">
      <SiteHeader brand={<Brand />} page="lab" />
      <header className="lab-hero">
        <div className="site-container">
          <p className="eyebrow">{t("lab.eyebrow")}</p>
          <h1 className="lab-hero__title">{t("lab.heroTitle")}</h1>
          <h2 className="lab-content__title">{t("lab.subtitle")}</h2>
        </div>
      </header>
      <article className="lab-content site-container">
        <div className="lab-grid">
          {builds.map(({ id, image, stackCount, repo }) => {
            const title = t(`lab.builds.${id}.title`);
            return (
              <article className="lab-card" key={id}>
                <img src={`/${image}`} alt="" loading="lazy" />
                <h3>{title}</h3>
                <p>{t(`lab.builds.${id}.description`)}</p>
                {stackCount > 0 && (
                  <ul className="lab-card__stack" aria-label={`${title} ${t("lab.technologyStack")}`}>
                    {Array.from({ length: stackCount }, (_, index) => <li key={index}>{t(`lab.builds.${id}.stack.${index}`)}</li>)}
                  </ul>
                )}
                {repo && <a className="lab-card__repo" href={repo} target="_blank" rel="noreferrer noopener">{t("lab.repository")} <span aria-hidden="true">-&gt;</span></a>}
              </article>
            );
          })}
        </div>
        <div className="lab-contact">
          <a className="button button--accent" href={contactPath}>{t("lab.contact")}</a>
        </div>
      </article>
    </main>
  );
}
