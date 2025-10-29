---
inclusion: always
---
# Next.js 16 Best Practices

## Configuration
- React Compiler enabled in [next.config.ts](mdc:next.config.ts) via `experimental.reactCompiler: true`
- Turbopack as default bundler (see `--turbopack` flags in package.json scripts)
- SVG imports via Webpack with regex constants at top-level scope

## Middleware Pattern
- Current [middleware.ts](mdc:middleware.ts) follows Next.js 16 best practices
- Only handles authentication and redirects (no proxying/rewrites)
- Uses better-auth session validation
- Matcher config limits middleware scope to protected routes only

## Build & Dev
- Development: `bun run dev` (uses Turbopack)
- Production build: `bun run build` (uses Turbopack)
- Build time improvements: 2-5x faster than Webpack

## Performance
- Turbopack provides 5-10x faster Fast Refresh
- React Compiler auto-optimizes components without manual memoization
