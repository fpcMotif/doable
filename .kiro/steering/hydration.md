---
inclusion: always
---
# Hydration Safety Rules

## Common Causes of Hydration Mismatches
Hydration errors occur when server-rendered HTML differs from the initial client render. This typically happens when:
- Using client-only APIs (`window`, `localStorage`, `matchMedia`) during render
- Time-based values (`Date.now()`, `Math.random()`)
- Locale-dependent formatting (dates, numbers)
- Conditionally rendering based on viewport size without hydration guards
- Boolean props (`disabled`, `checked`, `open`) that depend on client-only state

## Use `useHydrated()` Hook

Gate client-only branches with the `useHydrated()` hook to ensure SSR and initial client render match:

```ts
import { useHydrated } from "@/hooks/use-hydrated";

const hydrated = useHydrated();
const isMobile = useIsMobile();
const renderMobile = hydrated && isMobile;

// Use renderMobile for conditional rendering
if (renderMobile) {
  return <MobileLayout />;
}
return <DesktopLayout />;
```

## Gate Boolean Props for Interactive Elements

For boolean attributes like `disabled`, `checked`, `value`, `open` that depend on client state:

```ts
const hydrated = useHydrated();
const isGeneratingTheme = useAIGeneration();
const disabled = hydrated && isGeneratingTheme;

// Pass to components
<Button disabled={disabled} />
```

This ensures:
- SSR: `disabled={false}` (hydrated=false, isGeneratingTheme=any)
- Initial client: `disabled={false}` (hydrated=false, isGeneratingTheme=any)
- After mount: `disabled={true/false}` (hydrated=true, isGeneratingTheme=actual)

## Special Case: Radix `asChild` Triggers

Radix primitives with `asChild` clone children and merge props. Unstable props cause hydration mismatches:

```tsx
// ❌ BAD: isLoading might differ between SSR and client
<TooltipTrigger asChild>
  <Button disabled={isLoading}>Click</Button>
</TooltipTrigger>

// ✅ GOOD: Gate with hydration
const hydrated = useHydrated();
const disabled = hydrated && isLoading;
<TooltipTrigger asChild>
  <Button disabled={disabled}>Click</Button>
</TooltipTrigger>
```

## Prefer CSS Over JSX Branching

Use CSS media queries instead of conditional rendering for responsive UI:

```tsx
// ✅ GOOD: CSS handles responsive layout
<div className="block md:hidden">Mobile Only</div>
<div className="hidden md:block">Desktop Only</div>

// ❌ BAD: Requires hydration guard
{isMobile ? <MobileView /> : <DesktopView />}
```

## Safe Patterns

### Read Browser APIs Only in Effects or Guards

```ts
// ✅ GOOD
useEffect(() => {
  const theme = localStorage.getItem("theme");
  setTheme(theme);
}, []);

// ✅ GOOD
const hydrated = useHydrated();
const storedValue = hydrated ? localStorage.getItem("key") : null;

// ❌ BAD: Runs during SSR
const theme = localStorage.getItem("theme");
```

### Stable Default Values

```ts
// ✅ GOOD: Same default on SSR and client
const [count, setCount] = useState(0);

// ❌ BAD: Different values on SSR vs client
const [count, setCount] = useState(() => 
  typeof window !== "undefined" ? Number(localStorage.getItem("count")) : 0
);
```

## What to Avoid

- `if (typeof window !== 'undefined')` branches in render
- Using `Date.now()`, `Math.random()` during render
- Locale-dependent formatting without explicit timezone/locale
- Passing unstable booleans to Radix triggers with `asChild`
- Reading `window.location`, `navigator`, or other browser APIs during render

## Last Resort: `suppressHydrationWarning`

Only use for content that is intentionally different and innocuous (e.g., timestamps):

```tsx
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>
```

Use sparingly—fix the root cause instead when possible.

## Summary

1. Use `useHydrated()` to gate client-only logic
2. Keep SSR and initial client render identical
3. Gate boolean props with hydration for Radix/interactive components
4. Prefer CSS over JSX for responsive layouts
5. Read browser APIs only in effects or after hydration
