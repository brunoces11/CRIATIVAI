import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initializeI18n } from "./i18n/config";
import { getCurrentLanguage } from "./i18n/getCurrentLanguage";
import { clearAudience, syncAudienceFromPathname } from "./lib/audienceVisibility";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

const rootElement = root;
const audienceAction = syncAudienceFromPathname(window.location.pathname);

async function bootstrap() {
  if (audienceAction === "clear") {
    clearAudience();
    window.location.replace(getCurrentLanguage() === "en" ? "/en/" : "/");
    return;
  }

  const currentLanguage = getCurrentLanguage();
  document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : "en-US";
  const i18n = await initializeI18n(currentLanguage);
  const title = i18n.t("meta.title");
  const description = i18n.t("meta.description");
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:locale"]')?.setAttribute("content", i18n.t("meta.ogLocale"));
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);

  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
