/**
 * Request-based i18n configuration for next-intl
 * Handles message loading and locale detection
 */

import { getRequestConfig } from "next-intl/server";
import { defaultLocale, type Locale, locales } from "./config";

export default getRequestConfig(async ({ locale }) => {
  // Validate locale
  if (!locales.includes(locale as Locale)) {
    return {
      messages: (await import(`../messages/${defaultLocale}.json`)).default,
    };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
