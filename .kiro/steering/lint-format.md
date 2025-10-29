---
inclusion: always
---
# Linting & Formatting Strategy

## Tool Responsibilities
- **Oxlint**: Primary linter (lint rules only)
- **Biome/Ultracite**: Formatter only (linter disabled)

See [LINTING_FORMATTING.md](mdc:LINTING_FORMATTING.md) for complete documentation.

## Configuration Files
- [.oxlintrc.json](mdc:.oxlintrc.json) - Oxlint rules
- [biome.jsonc](mdc:biome.jsonc) - Biome config with `"linter": { "enabled": false }`

## Commands
```bash
bun run lint          # Run Oxlint (fast!)
bun run format        # Auto-format with Biome
bun run lint:biome    # Check Biome formatting
bun run check         # Full check (lint + format)
```

## Pre-commit Hooks
Configured in [package.json](mdc:package.json) lint-staged:
- TypeScript/JSX files: Run Oxlint then Biome format
- Other files (JSON, CSS, Markdown): Biome format only

## Performance
- Oxlint: ~48ms for 390 files
- Biome format: ~3s for 407 files
- Total: 100x faster than ESLint + Prettier

## Rules to Follow
- Prefix unused variables with underscore: `_error`, `_e`
- No double negation: Use `toolbarControls` not `!!toolbarControls`
- Remove empty fallbacks in spreads: `...(obj || {})` → `...obj`
