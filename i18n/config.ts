/**
 * Internationalization Configuration
 * Defines supported locales and routing settings
 */

export const defaultLocale = "en";

export const locales = ["en", "ja", "zh", "es", "de", "fr"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ja: "日本語",
  zh: "简体中文",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
};

export const pathnames = {
  "/": "/",
  "/sign-in": {
    en: "/sign-in",
    ja: "/ja/sign-in",
    zh: "/zh/sign-in",
    es: "/es/sign-in",
    de: "/de/sign-in",
    fr: "/fr/sign-in",
  },
  "/sign-up": {
    en: "/sign-up",
    ja: "/ja/sign-up",
    zh: "/zh/sign-up",
    es: "/es/sign-up",
    de: "/de/sign-up",
    fr: "/fr/sign-up",
  },
  "/dashboard": {
    en: "/dashboard",
    ja: "/ja/dashboard",
    zh: "/zh/dashboard",
    es: "/es/dashboard",
    de: "/de/dashboard",
    fr: "/fr/dashboard",
  },
} as const;
