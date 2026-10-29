import { DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, type Language } from "./constants";

export function getLanguageFromPathname(pathname: string): Language {
  return pathname === "/pt" || pathname.startsWith("/pt/") ? FALLBACK_LANGUAGE : DEFAULT_LANGUAGE;
}

export function getCurrentLanguage(): Language {
  return getLanguageFromPathname(window.location.pathname);
}

export function getLocalizedPath(pathname: string, language: Language): string {
  const url = new URL(pathname || "/", window.location.origin);
  const internalPath = url.pathname.replace(/^\/(?:en|pt)(?=\/|$)/, "") || "/";
  url.pathname = language === "pt" ? `/pt${internalPath === "/" ? "/" : internalPath}` : internalPath;
  return `${url.pathname}${url.search}${url.hash}`;
}
