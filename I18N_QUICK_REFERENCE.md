# i18n Quick Reference

## Using Translations in Components

### Client Component (Most Common)
```typescript
"use client";
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("section_name");
  
  return (
    <div>
      <h1>{t("key_name")}</h1>
      <button>{t("button_text")}</button>
    </div>
  );
}
```

### Server Component
```typescript
import { getTranslations } from "next-intl/server";

export default function Page() {
  const t = getTranslations("section_name");
  
  return <h1>{t("title")}</h1>;
}
```

## Available Translation Sections

| Section | Usage | Example |
|---------|-------|---------|
| `common` | Generic UI (buttons, labels) | `t("save")`, `t("cancel")` |
| `navigation` | Sidebar & nav items | `t("issues")`, `t("projects")` |
| `auth` | Auth screens | `t("signIn")`, `t("email")` |
| `dashboard` | Dashboard messages | `t("loading")`, `t("teamNotFound")` |
| `teams` | Team management | `t("selectTeam")`, `t("createNewTeam")` |
| `issues` | Issue tracking | `t("issues")`, `t("priority")` |
| `projects` | Projects | `t("projects")`, `t("projectName")` |
| `workflowStates` | Workflow states | `t("completed")`, `t("backlog")` |
| `labels` | Labels | `t("labels")`, `t("labelName")` |
| `metadata` | SEO metadata | `t("title")`, `t("description")` |

## Navigation & Routing

### Using i18n-aware Link
```typescript
import { Link } from "@/i18n/navigation";

// Automatically handles locale in URL
<Link href="/dashboard">Go to Dashboard</Link>
// Output: /en/dashboard, /ja/dashboard, etc.
```

### Using i18n-aware Router
```typescript
"use client";
import { useRouter } from "@/i18n/navigation";

export function MyComponent() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push("/dashboard");
  };
  
  return <button onClick={handleClick}>Navigate</button>;
}
```

### Getting Current Locale
```typescript
import { useLocale } from "next-intl";

export function MyComponent() {
  const locale = useLocale();
  // "en", "ja", "zh", "es", "de", or "fr"
  
  return <p>Current language: {locale}</p>;
}
```

## Utility Functions

### Formatting Dates
```typescript
import { formatDate, formatDateTime } from "@/lib/i18n-utils";

const date = new Date("2025-01-15");
formatDate(date, "en");  // "January 15, 2025"
formatDate(date, "ja");  // "2025年1月15日"
formatDate(date, "de");  // "15. Januar 2025"
```

### Formatting Numbers
```typescript
import { formatNumber } from "@/lib/i18n-utils";

formatNumber(1234.56, "en");  // "1,234.56"
formatNumber(1234.56, "de");  // "1.234,56"
formatNumber(1234.56, "fr");  // "1 234,56"
```

## Adding New Translation Keys

1. **Edit English file**: `messages/en.json`
```json
{
  "mySection": {
    "newKey": "English text here"
  }
}
```

2. **Add to all other language files**: `messages/ja.json`, `messages/zh.json`, etc.
```json
{
  "mySection": {
    "newKey": "翻訳テキストここに"
  }
}
```

3. **Use in component**:
```typescript
const t = useTranslations("mySection");
return <div>{t("newKey")}</div>;
```

## Language Switcher Component

```typescript
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export function MyHeader() {
  return (
    <header>
      <h1>My App</h1>
      <LanguageSwitcher />
    </header>
  );
}
```

## Common Translation Keys by Section

### Common Section
- `loading` - Generic loading text
- `error` - Generic error message
- `save`, `cancel`, `delete` - Common buttons
- `edit`, `create`, `update` - Common actions
- `yes`, `no` - Boolean choices

### Navigation Section
- `issues` - Issues page label
- `projects` - Projects page label
- `management` - Management section
- `people` - People/team members
- `apiKey` - API Key settings
- `settings` - Settings page

### Teams Section
- `selectTeam` - "Select Team" heading
- `noTeamsFound` - No teams message
- `createNewTeam` - Create team button
- `teamMembers` - Team members label

### Dashboard Section
- `loading` - Loading team message
- `loadingMessage` - "Fetching team data..."
- `redirecting` - Redirection message
- `teamNotFound` - Team not found error

## Supported Languages

- **English** (en) - Default
- **Japanese** (ja) - 日本語
- **Simplified Chinese** (zh) - 简体中文
- **Spanish** (es) - Español
- **German** (de) - Deutsch
- **French** (fr) - Français

## URL Examples

```
http://localhost:3000/en/dashboard        # English
http://localhost:3000/ja/dashboard        # Japanese
http://localhost:3000/zh/dashboard        # Chinese
http://localhost:3000/es/dashboard        # Spanish
http://localhost:3000/de/dashboard        # German
http://localhost:3000/fr/dashboard        # French
```

## Troubleshooting

### Translation key not appearing?
1. Check spelling in component: `t("keyName")`
2. Verify key exists in `messages/en.json`
3. Verify all language files have the same structure
4. Clear `.next` build cache and restart dev server

### Locale not changing?
1. Ensure using i18n Link/Router: `from "@/i18n/navigation"`
2. Check URL has locale prefix: `/en/`, `/ja/`, etc.
3. Verify LanguageSwitcher is rendering correctly

### TypeScript errors?
1. Ensure import is from `next-intl`: `import { useTranslations } from "next-intl"`
2. Check namespace parameter matches section in JSON
3. Verify component is client-side for `useTranslations`

---

**For more details, see `I18N_SETUP.md`**
