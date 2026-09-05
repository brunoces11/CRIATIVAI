import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import i18n from "./i18n/config";
import { getCurrentLanguage } from "./i18n/getCurrentLanguage";
import { clearAudience, syncAudienceFromPathname } from "./lib/audienceVisibility";
import App from "./App";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

const audienceAction = syncAudienceFromPathname(window.location.pathname);

if (audienceAction === "clear") {
  clearAudience();
  window.location.replace(getCurrentLanguage() === "en" ? "/en/" : "/");
} else {
  const currentLanguage = getCurrentLanguage();
  document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : "en";
  void i18n.changeLanguage(currentLanguage);

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
