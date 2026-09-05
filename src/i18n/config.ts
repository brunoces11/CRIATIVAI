import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE } from "./constants";
import pt from "../locales/pt.json";
import en from "../locales/en.json";

export const i18nInstance = i18n;
export { i18nInstance as i18n };

void i18n.use(initReactI18next).init({
  resources: { pt: { translation: pt }, en: { translation: en } },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: ["pt", "en"],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
