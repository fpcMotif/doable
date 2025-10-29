---
inclusion: fileMatch
fileMatchPattern: ['*.ts', '*.tsx']
---
# React 19.2 Guidelines

## useEffectEvent Hook
Replace traditional useEffect patterns with useEffectEvent when callbacks need latest props/state without triggering effect re-runs.

**Example:** [app/page.tsx](mdc:app/page.tsx)
```typescript
// Callback always accesses latest state without re-registering listener
const handleScroll = useEffectEvent(() => {
  if (window.scrollY > 10) {
    setIsScrolled(true);
  } else {
    setIsScrolled(false);
  }
});

useEffect(() => {
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []); // Truly stable dependency array
```

**Benefits:**
- No stale closures
- No unnecessary event listener re-registration
- Cleaner dependency management

## React Cache API
Use `cache` from React (not Next.js `unstable_cache`) for server-side caching.

**Example:** [app/api/google-fonts/route.ts](mdc:app/api/google-fonts/route.ts)
```typescript
import { cache } from "react";

const cachedFetchGoogleFonts = cache(async (apiKey: string | undefined) =>
  fetchGoogleFonts(apiKey)
);
```

**When to use:**
- Server Components or API Routes
- Data that should be memoized per request
- Stable React 19 API (no longer experimental)
