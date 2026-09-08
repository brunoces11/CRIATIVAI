import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, type Language } from "./constants";

export function getLanguageFromPathname(pathname: string): Language {
  return pathname === "/en" || pathname.startsWith("/en/") ? FALLBACK_LANGUAGE : DEFAULT_LANGUAGE;
}

export function getCurrentLanguage(): Language {
  return getLanguageFromPathname(window.location.pathname);
}

export function getLocalizedPath(pathname: string, language: Language): string {
  const url = new URL(pathname || "/", window.location.origin);
  const internalPath = url.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  url.pathname = language === "en" ? `/en${internalPath === "/" ? "/" : internalPath}` : internalPath;
  return `${url.pathname}${url.search}${url.hash}`;
}
