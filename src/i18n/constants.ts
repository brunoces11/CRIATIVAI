export const SUPPORTED_LANGUAGES = ["pt", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "en";
export const FALLBACK_LANGUAGE: Language = "pt";
