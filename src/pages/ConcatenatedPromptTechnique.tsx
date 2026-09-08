import { useTranslation } from "react-i18next";
import { SiteHeader } from "../components/SiteHeader";
import { getCurrentLanguage, getLocalizedPath } from "../i18n/getCurrentLanguage";

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

const images = ["https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAM_TRADITIONAL_v9.jpg", "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_DIAGRAM_CTP_v9.jpg", "https://pmt.criativai.site/wp-content/uploads/2024/03/CTP_CONCATENATED_PROMPT_TECHNIQUE_DIAGRAM_v10.jpg"] as const;
const useCaseIds = ["01", "02", "03", "04", "05", "06", "07", "08", "09"] as const;

export default function ConcatenatedPromptTechniquePage() {
  const { t } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const contactPath = getLocalizedPath("/contact", currentLanguage);

  return (
    <main className="cpt-page" id="top">
      <SiteHeader brand={<Brand />} />
      <article className="cpt-article site-container">
        <header className="cpt-article__header"><p className="eyebrow">{t("cpt.eyebrow")}</p><h1>{t("cpt.title")}</h1></header>

        <p>{t("cpt.introBefore")} <strong>{t("cpt.introStrongOne")}</strong>. {t("cpt.introMiddle")} <strong>{t("cpt.introStrongTwo")}</strong>.</p>

        <section><h2>{t("cpt.howTitle")}</h2><p>{t("cpt.howText")}</p></section>

        <section><h2>{t("cpt.milestoneTitle")}</h2><p>{t("cpt.milestoneText")}</p><ol>{["01", "02", "03", "04"].map((id) => <li key={id}><strong>{t(`cpt.milestoneItems.${id}`)}</strong></li>)}</ol></section>

        <section><h2>{t("cpt.regularTitle")}</h2><p>{t("cpt.regularText")}</p><CptImage src={images[0]} alt={t("cpt.images.traditional")} /></section>

        <section><h2>{t("cpt.potentialTitle")}</h2><p>{t("cpt.potentialText")}</p><CptImage src={images[1]} alt={t("cpt.images.cpt")} /></section>

        <section><h2>{t("cpt.functionalTitle")}</h2><p>{t("cpt.functionalText")}</p><CptImage src={images[2]} alt={t("cpt.images.functional")} /></section>

        <section><h2>{t("cpt.checkTitle")}</h2><p>{t("cpt.checkFlowgpt")}<br /><a href="https://flowgpt.com/p/cpt-concatenated-prompt-technique-4" target="_blank" rel="noreferrer">https://flowgpt.com/p/cpt-concatenated-prompt-technique-4</a></p><p>{t("cpt.checkOpenai")}<br /><a href="https://chat.openai.com/share/8d8e914b-1611-4c7d-aef9-aaa620d75d6f" target="_blank" rel="noreferrer">https://chat.openai.com/share/8d8e914b-1611-4c7d-aef9-aaa620d75d6f</a></p><p>{t("cpt.checkCustom")}<br /><span>{t("cpt.checkWork")}</span></p></section>

        <section><h2>{t("cpt.useCasesTitle")}</h2>{useCaseIds.map((id) => <p key={id}><strong>{t(`cpt.useCases.${id}.title`)}:</strong> {t(`cpt.useCases.${id}.text`)}</p>)}</section>

        <section><h2>{t("cpt.conclusionTitle")}</h2><p>{t("cpt.conclusionText")}</p></section>
        <section><h2>{t("cpt.ctaTitle")}</h2><p>{t("cpt.ctaText")}</p><a className="button button--accent" href={contactPath}>{t("cpt.contact")}</a></section>
      </article>
    </main>
  );
}

function CptImage({ src, alt }: { src: string; alt: string }) {
  return <figure className="cpt-figure"><img src={src} alt={alt} loading="lazy" /><figcaption>{alt}</figcaption></figure>;
}
