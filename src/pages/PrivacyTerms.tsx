import { SiteHeader } from "../components/SiteHeader";
import { useTranslation } from "react-i18next";

function Brand() {
  return (
    <span className="brand-lockup" aria-label="CriativAI">
      <img className="brand-logo" src="/logo.svg" alt="" aria-hidden="true" />
    </span>
  );
}

export default function PrivacyTermsPage() {
  const { t } = useTranslation();
  return (
    <main className="policy-page" id="top">
      <SiteHeader brand={<Brand />} page="home" />

      <section className="policy-section" aria-labelledby="policy-title">
        <div className="site-container policy-container">
          <p className="eyebrow">{t("legal.eyebrow")}</p>
          <h1 id="policy-title">{t("legal.title")}</h1>
          <p className="policy-updated">{t("legal.updated")}</p>

          <div className="policy-content">
            <section aria-labelledby="privacy-title">
              <h2 id="privacy-title">{t("legal.privacy")}</h2>
              <p>
                {t("legal.privacyOne")}
              </p>
              <p>
                {t("legal.privacyTwo")}
              </p>
              <p>
                {t("legal.privacyThree")}
              </p>
            </section>

            <section aria-labelledby="terms-title">
              <h2 id="terms-title">{t("legal.terms")}</h2>
              <p>
                {t("legal.termsOne")}
              </p>
              <p>
                {t("legal.termsTwo")}
              </p>
              <p>
                {t("legal.termsThree")}
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
