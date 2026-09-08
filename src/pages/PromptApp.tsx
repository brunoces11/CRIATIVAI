import { useTranslation } from "react-i18next";
import { SiteHeader } from "../components/SiteHeader";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = {
  concept: "https://pmt.criativai.site/wp-content/uploads/2024/04/prompt-app-concept-prompt-master-creative-chatgpt-research-bruno-cesar-prompt-engneer.jpg",
  future: "https://pmt.criativai.site/wp-content/uploads/2024/04/prompt-app-concept-creative-chatgpt-research-bruno-cesar-prompt-engeneering-prompt-master.jpg",
} as const;

const advantageIds = ["01", "02", "03", "04", "05", "06", "07"] as const;

export default function PromptAppPage() {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const contactPath = getLocalizedPath("/contact", currentLanguage);
  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header"><p className="eyebrow">{t("promptApp.eyebrow")}</p><h1>{t("promptApp.title")}</h1></header>
        <p>{t("promptApp.introBefore")} <a href={getLocalizedPath("/contatenated-prompt-techique", currentLanguage)} title={t("cpt.title")}>{t("promptApp.cptLink")}</a> {t("promptApp.introMiddle")} <a href={getLocalizedPath("/ux-prompt-design", currentLanguage)} title={t("uxPrompt.title")}>{t("promptApp.uxLink")}</a>{t("promptApp.introAfter")}</p>
        <ArticleImage src={images.concept} alt={t("promptApp.images.concept")} />

        <section><h2>{t("promptApp.whyTitle")}</h2><p>{t("promptApp.whyText")}</p></section>
        <section><h2>{t("promptApp.futureTitle")}</h2><p>{t("promptApp.futureText")}</p><ArticleImage src={images.future} alt={t("promptApp.images.future")} /></section>

        <section><h2>{t("promptApp.advantagesTitle")}</h2><ol>{advantageIds.map((id) => <li key={id}><strong>{t(`promptApp.advantages.${id}.title`)}:</strong> {t(`promptApp.advantages.${id}.text`)}</li>)}</ol><h3>{t("promptApp.advantagesStrong")}</h3></section>

        <section><h2>{t("promptApp.supportTitle")}</h2><p>{t("promptApp.supportText")}</p><a className="button button--accent" href={contactPath}>{t("promptApp.contact")}</a></section>
      </article>
    </main>
  );
}

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return <figure className="cpt-figure"><img src={src} alt={alt} loading="lazy" /><figcaption>{alt}</figcaption></figure>;
}
