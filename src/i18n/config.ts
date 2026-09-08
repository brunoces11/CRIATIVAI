import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from "./constants";
import pt from "../locales/pt.json";
import en from "../locales/en.json";

export const i18nInstance = i18n;
export { i18nInstance as i18n };

export async function initializeI18n(language: Language) {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: { pt: { translation: pt }, en: { translation: en } },
      lng: language,
      fallbackLng: FALLBACK_LANGUAGE,
      supportedLngs: SUPPORTED_LANGUAGES,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    });
  } else if (i18n.resolvedLanguage !== language) {
    await i18n.changeLanguage(language);
  }

  return i18n;
}

export default i18n;
