# International​ization (i18n) Setup with next-intl

## Overview

This project now supports full internationalization with **next-intl** for 6 languages:
- English (en)
- Japanese (日本語, ja)
- Simplified Chinese (简体中文, zh)
- Spanish (Español, es)
- German (Deutsch, de)
- French (Français, fr)

## Architecture

### Without Middleware Approach

As per Next.js 16 best practices, we're using next-intl without middleware. The routing is handled via:
- Dynamic `[locale]` segment in app directory
- Language preference detection from URL path
- Default to English if no locale specified

## Key Files

### Configuration
- `i18n/config.ts` - Locale configuration and constants
- `i18n/request.ts` - Server-side request configuration
- `i18n/navigation.ts` - Locale-aware navigation utilities
- `messages/en.json`, `messages/ja.json`, etc. - Translation files

### Components
- `components/shared/language-switcher.tsx` - Language selection dropdown
- `lib/i18n-utils.ts` - Translation utilities and formatting helpers

### Updated Core Files
- `app/layout.tsx` - Root layout with NextIntlClientProvider
- `app/dashboard/[teamId]/layout.tsx` - Dashboard with translation hooks
- `components/shared/team-selector.tsx` - Team selector with i18n
- `next.config.ts` - i18n configuration
- `tsconfig.json` - Path aliases for messages

## Implementation Status

### Completed ✓
- [x] Installed next-intl package
- [x] Created i18n configuration files
- [x] Created translation files for all 6 languages
- [x] Updated root layout with NextIntlClientProvider
- [x] Translated all Chinese comments to English
- [x] Created language switcher component
- [x] Created i18n utility functions
- [x] Updated key components with useTranslations hook

### Next Steps

1. **Reorganize App Structure** (IMPORTANT)
   - Current: `app/layout.tsx`, `app/page.tsx`, etc.
   - Target: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, etc.
   - Move all app pages into `[locale]` folder

2. **Update Navigation Links**
   - Replace Next.js Link with i18n Link from `@/i18n/navigation`
   - Update useRouter calls to use i18n version

3. **Add to Components.json**
   ```typescript
   // In your existing components that need translations
   "use client";
   import { useTranslations } from "next-intl";
   
   export function MyComponent() {
     const t = useTranslations("section");
     return <div>{t("key")}</div>;
   }
   ```

4. **Update All API Routes**
   - Add locale parameter handling
   - Internationalize error messages

5. **Test Language Switching**
   - Verify URL changes on language switch
   - Confirm locale persists across navigation

## Routing Examples

```
/en/dashboard/team-123/issues
/ja/dashboard/team-123/issues
/zh/dashboard/team-123/issues
/es/dashboard/team-123/issues
/de/dashboard/team-123/issues
/fr/dashboard/team-123/issues

/ (redirects to /en)
```

## Translation File Structure

Each language file (`messages/{locale}.json`) contains:
```json
{
  "common": { ... },
  "navigation": { ... },
  "auth": { ... },
  "dashboard": { ... },
  "teams": { ... },
  "issues": { ... },
  "projects": { ... },
  "workflowStates": { ... },
  "labels": { ... },
  "metadata": { ... }
}
```

## Usage in Components

### Server Components
```typescript
import { getTranslations } from "next-intl/server";

export default function Page() {
  const t = getTranslations("section");
  return <h1>{t("title")}</h1>;
}
```

### Client Components
```typescript
"use client";
import { useTranslations } from "next-intl";

export function Component() {
  const t = useTranslations("section");
  return <h1>{t("title")}</h1>;
}
```

## Environment Variables

No additional environment variables are required. The locale is determined from the URL path.

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile, etc.)
- Language preference can be manually switched via language switcher

## Performance Notes

- Translation files are bundled with the app
- No runtime translation engine or API calls required
- Minimal performance impact
- Cached at build time

## Future Enhancements

1. Add more languages
2. Implement cookie-based locale persistence
3. Add language auto-detection from browser preferences
4. Add RTL language support (Arabic, Hebrew)
5. Implement language-specific date/time formatting throughout
