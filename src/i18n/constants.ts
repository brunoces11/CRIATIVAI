export const SUPPORTED_LANGUAGES = ["pt", "en"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: Language = "pt";
export const FALLBACK_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "criativai:language";
