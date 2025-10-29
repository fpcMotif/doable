---
inclusion: always
---
# Tech Stack Migration Summary

Complete migration from Next.js 15 + React 19.0 to latest stable versions.

See [MIGRATION_NEXT16_REACT19.md](mdc:MIGRATION_NEXT16_REACT19.md) for full documentation.

## Dependency Upgrades
- Next.js: 15.4.1 → 16.0.0
- React: 19.0.0 → 19.2.0
- React DOM: 19.0.0 → 19.2.0
- New: Effect-TS 3.18.4
- New: Oxlint 1.24.0

## Key Features Enabled

### Next.js 16
- React Compiler (automatic optimization)
- Turbopack bundler (5-10x faster)
- Webpack SVG rules optimized

### React 19.2
- useEffectEvent for stable event handlers
- React cache API for server-side caching

### Effect-TS
- Type-safe async pipeline pattern
- Unified error handling
- Built-in observability

### Linting & Formatting
- Oxlint for blazing-fast linting
- Biome/Ultracite for consistent formatting
- Separate concerns (no tool overlap)

## Testing Migration
```bash
bun install
bun run dev          # Verify Turbopack
bun run lint         # Check code quality
bun run format       # Auto-fix formatting
bun run build        # Production build test
```

## Files Modified
Key files in this migration:
- [next.config.ts](mdc:next.config.ts) - React Compiler + Webpack config
- [app/page.tsx](mdc:app/page.tsx) - useEffectEvent example
- [app/api/google-fonts/route.ts](mdc:app/api/google-fonts/route.ts) - React cache
- [app/api/subscription/route.ts](mdc:app/api/subscription/route.ts) - Effect-TS
- [lib/effect-helpers.ts](mdc:lib/effect-helpers.ts) - Effect utilities
- [package.json](mdc:package.json) - Dependencies + scripts
- [biome.jsonc](mdc:biome.jsonc) - Linter disabled
- [.oxlintrc.json](mdc:.oxlintrc.json) - Oxlint config
- [.vscode/settings.json](mdc:.vscode/settings.json) - Editor integration

## Performance Improvements
- Build time: 2-5x faster (Turbopack)
- Fast Refresh: 5-10x faster
- Linting: 100x faster (Oxlint vs ESLint)
- No middleware proxy overhead (auth-only middleware pattern)
