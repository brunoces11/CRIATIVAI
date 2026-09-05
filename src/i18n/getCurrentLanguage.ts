import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, LANGUAGE_STORAGE_KEY, type Language } from "./constants";

export function getLanguageFromPathname(pathname: string): Language {
  return pathname === "/en" || pathname.startsWith("/en/") ? FALLBACK_LANGUAGE : DEFAULT_LANGUAGE;
}

export function getCurrentLanguage(): Language {
  const routeLanguage = getLanguageFromPathname(window.location.pathname);
  if (routeLanguage === FALLBACK_LANGUAGE) return routeLanguage;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "en" || stored === "pt" ? stored : DEFAULT_LANGUAGE;
}

export function getLocalizedPath(pathname: string, language: Language): string {
  const url = new URL(pathname || "/", window.location.origin);
  const internalPath = url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  url.pathname = language === "en" ? `/en${internalPath === "/" ? "/" : internalPath}` : internalPath;
  return `${url.pathname}${url.search}${url.hash}`;
}
