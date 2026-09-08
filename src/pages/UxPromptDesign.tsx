import { useTranslation } from "react-i18next";
import { SiteHeader } from "../components/SiteHeader";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = {
  requirements: "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAMS_UX_v6a.jpg",
  minecraft: "https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_MINECRAFT_v2a.jpg",
  sherlock: "https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_SHERLOCK_v2a.jpg",
  track: "https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_TIME_v2a.jpg",
  gptinder: "https://pmt.criativai.site/wp-content/uploads/2024/03/CPT_PRINT_GPTINDER_v2a.jpg",
} as const;

const examples = [
  { id: "minecraft", href: "https://flowgpt.com/p/minecraft-mashup-beyond-the-end-1" },
  { id: "sherlock", href: "https://flowgpt.com/p/sherlock-hoax-game" },
  { id: "track", href: "https://flowgpt.com/p/track-to-the-future-game-1" },
  { id: "gptinder", href: "https://flowgpt.com/p/gptinder-your-turbocharged-dating-advisor-16" },
] as const;

export default function UxPromptDesignPage() {
  const { t } = useTranslation();
  const contactPath = getLocalizedPath("/contact", getCurrentLanguage());
  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header"><p className="eyebrow">{t("uxPrompt.eyebrow")}</p><h1>{t("uxPrompt.title")}</h1></header>
        <p>{t("uxPrompt.intro")}</p>

        <section><h2>{t("uxPrompt.requirementsTitle")}</h2><p>{t("uxPrompt.requirementsBefore")} <strong>{t("uxPrompt.requirementsStrongOne")}</strong>. {t("uxPrompt.requirementsMiddle")} <strong>{t("uxPrompt.requirementsStrongTwo")}</strong> + <strong>{t("uxPrompt.requirementsStrongThree")}</strong> + <strong>{t("uxPrompt.requirementsStrongFour")}</strong>. {t("uxPrompt.seeDiagram")}</p><ArticleImage src={images.requirements} alt={t("uxPrompt.images.requirements")} /></section>
        <section><h2>{t("uxPrompt.examplesTitle")}</h2><p>{t("uxPrompt.examplesText")}</p></section>
        {examples.map((example) => <Example key={example.id} title={t(`uxPrompt.examples.${example.id}.title`)} href={example.href} image={images[example.id]} alt={t(`uxPrompt.examples.${example.id}.alt`)} accessPrompt={t("uxPrompt.accessPrompt")} clickHere={t("uxPrompt.clickHere")} />)}
        <section><h2>{t("uxPrompt.conclusionTitle")}</h2><p>{t("uxPrompt.conclusionText")}</p></section>
        <section><h2>{t("uxPrompt.supportTitle")}</h2><p>{t("uxPrompt.supportText")}</p><a className="button button--accent" href={contactPath}>{t("uxPrompt.contact")}</a></section>
      </article>
    </main>
  );
}

function ArticleImage({ src, alt }: { src: string; alt: string }) {
  return <figure className="cpt-figure"><img src={src} alt={alt} loading="lazy" /><figcaption>{alt}</figcaption></figure>;
}

function Example({ title, href, image, alt, accessPrompt, clickHere }: { title: string; href: string; image: string; alt: string; accessPrompt: string; clickHere: string }) {
  return <section><h2>{title}</h2><p>{accessPrompt} <a href={href} target="_blank" rel="noreferrer">{clickHere}</a>.</p><ArticleImage src={image} alt={alt} /></section>;
}
