/**
 * next-intl Navigation Configuration
 * Provides locale-aware Link and useRouter hooks
 */

import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./config";

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: locales as unknown as string[],
  defaultLocale: defaultLocale,
  localePrefix: "as-needed",
});
