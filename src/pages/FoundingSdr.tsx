import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";

const stages = [
  ["01", "Founding SDR", "Represent CriativAI in San Francisco, prospect companies, identify opportunities and earn commission from the clients you generate."],
  ["02", "Build the Market", "Reach the defined commercial milestone and establish a recurring client base in the region."],
  ["03", "Become a Partner", "After reaching the partnership threshold, become part of the San Francisco operation you helped build."],
] as const;

const solutions = ["AI & Automation", "AI Agents", "Custom Software", "Web & App Development", "Product Design", "System Design", "Business Process Automation", "Integrations & Deployment"];
const traits = ["Strong hunter mentality", "Experience with B2B outbound", "Confidence approaching founders and business owners", "Interest in AI, automation and technology", "Entrepreneurial ambition", "Strong motivation to earn based on performance", "Desire to build something instead of simply occupying a position"];

function Brand() {
  return <span className="brand-lockup" aria-label="CriativAI"><img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" /></span>;
}

export default function FoundingSdrPage() {
  const { t } = useTranslation();
  return (
    <main className="founding-sdr-page" id="top">
      <SiteHeader brand={<Brand />} page="founding-sdr" />
      <section className="founding-sdr-hero" aria-labelledby="founding-sdr-title">
        <div className="site-container founding-sdr-hero__inner">
          <div className="founding-sdr-hero__copy">
            <p className="eyebrow">{t("founding.eyebrow")}</p>
            <h1 id="founding-sdr-title"><span>{t("founding.titleOne")}</span><br />{t("founding.titleTwo")}<br /><strong>{t("founding.titleThree")}</strong></h1>
            <p className="founding-sdr-lead">{t("founding.lead")}</p>
            <p className="founding-sdr-detail">{t("founding.detail")}</p>
            <div className="founding-sdr-actions"><a className="button button--accent" href="/contact">{t("founding.apply")} <span aria-hidden="true">-&gt;</span></a><a className="button button--ghost" href="#founding-sdr-process">{t("founding.seeHow")}</a></div>
          </div>
          <div className="founding-sdr-hero__signal" aria-hidden="true"><span>SF</span><strong>01</strong><small>{t("founding.oneMarket")}<br />{t("founding.oneOpportunity")}</small></div>
        </div>
      </section>

      <section className="founding-sdr-section founding-sdr-section--contrast" aria-labelledby="more-than-sales-title">
        <div className="site-container founding-sdr-split"><div><p className="eyebrow">{t("founding.opportunity")}</p><h2 id="more-than-sales-title">{t("founding.opportunityTitle")}</h2></div><div className="founding-sdr-copy"><p>{t("founding.opportunityLead")}</p><p>{t("founding.opportunityReward")}</p><p>{t("founding.opportunitySupport")}</p><p className="founding-sdr-mantra">{t("founding.mantra")}</p><p>{t("founding.growth")}</p></div></div>
      </section>

      <section className="founding-sdr-section" id="founding-sdr-process" aria-labelledby="process-title"><div className="site-container"><div className="founding-sdr-heading"><p className="eyebrow">{t("founding.path")}</p><h2 id="process-title">{t("founding.pathTitle")}</h2><p>{t("founding.pathLead")}</p></div><div className="founding-sdr-stages">{stages.map(([number, title, text]) => <article className="founding-sdr-stage" key={number}><span>{number}</span><h3>{t(`founding.stages.${number}.title`, title)}</h3><p>{t(`founding.stages.${number}.text`, text)}</p>{number === "03" ? <strong>{t("founding.asset")}</strong> : null}</article>)}</div></div></section>

      <section className="founding-sdr-section founding-sdr-section--contrast" aria-labelledby="selling-title"><div className="site-container founding-sdr-split"><div><p className="eyebrow">{t("founding.offer")}</p><h2 id="selling-title">{t("founding.selling")}</h2></div><div className="founding-sdr-copy"><p>{t("founding.offerLead")}</p><div className="founding-sdr-solution-list">{solutions.map((solution) => <span key={solution}>{solution}</span>)}</div><p><strong>{t("founding.offerStrong")}</strong></p></div></div></section>

      <section className="founding-sdr-section" aria-labelledby="looking-title"><div className="site-container founding-sdr-split"><div><p className="eyebrow">{t("founding.profile")}</p><h2 id="looking-title">{t("founding.looking")}</h2></div><div className="founding-sdr-copy"><p>{t("founding.profileLead")}</p><ul className="founding-sdr-traits">{traits.map((trait) => <li key={trait}>{trait}</li>)}</ul><p>{t("founding.profileStrong")}</p></div></div></section>

      <section className="founding-sdr-section founding-sdr-section--statement" aria-labelledby="different-title"><div className="site-container"><p className="eyebrow">{t("founding.difference")}</p><h2 id="different-title">{t("founding.bringMarket")}<br /><em>{t("founding.buildOperation")}</em></h2><p>{t("founding.differenceLead")}</p></div></section>

      <section className="founding-sdr-section founding-sdr-section--sf" aria-labelledby="sf-title"><div className="site-container"><p className="eyebrow">{t("founding.sanFrancisco")}</p><h2 id="sf-title">{t("founding.oneMarketTitle")}<br /><em>{t("founding.oneOpportunityTitle")}</em></h2><p>{t("founding.sfLead")}</p></div></section>

      <section className="founding-sdr-final" aria-labelledby="final-title"><div className="site-container"><p className="eyebrow">{t("founding.nextMove")}</p><h2 id="final-title">{t("founding.buildMore")}<br /><em>{t("founding.yourPipeline")}</em><br /><strong>{t("founding.buildMarket")}</strong></h2><p>{t("founding.finalLead")}</p><a className="button button--accent" href="/contact">{t("founding.applyOpportunity")} <span aria-hidden="true">-&gt;</span></a><small>CriativAI<br /><strong>AI • Automation • Software • Digital Products</strong></small></div></section>
    </main>
  );
}
