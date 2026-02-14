# Additional Considerations

**Summary:** Other project aspects that need attention during the dual-codebase migration beyond code structure and workflow.

---

## Table of Contents

1. [Development Tools](#1-development-tools)
2. [Build and Deployment](#2-build-and-deployment)
3. [Documentation](#3-documentation)

---

## 1. Development Tools

### VS Code Workspace Settings

Update `.vscode/settings.json` to exclude legacy from certain features:

```json
{
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "src/legacy/**": false // Set to true to hide from search
  },
  "files.exclude": {
    "src/legacy/**": false // Set to true to hide from file explorer
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

**Recommendation:** Keep legacy visible initially for reference, hide later when
no longer needed.

### Git Hooks

Pre-commit hooks should skip legacy code:

```bash
# .husky/pre-commit (if using husky)
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Only lint staged files (legacy already ignored by ESLint config)
pnpm lint-staged
```

### Hot Module Reload

No changes needed. Vite's HMR works per-module, so editing new code only
reloads new code, and vice versa.

---

## 2. Build and Deployment

### Bundle Analysis

Analyze both versions separately:

```bash
# Build with analysis
pnpm build

# Analyze new version chunks
ls -lh dist/assets/ | grep -v legacy

# Analyze legacy version chunks
ls -lh dist/assets/ | grep legacy
```

### Environment Variables

No changes needed. Both versions share same environment configuration.

### Service Worker

PWA service worker handles both versions automatically. No configuration needed.

### Deployment

**GitHub Pages:** No changes to `.github/workflows/deploy.yml` needed. Both
versions deploy together.

**Cache-Control:** Consider cache headers for legacy vs new:

```nginx
# Legacy routes (cache longer since frozen)
location /legacy/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# New routes (cache shorter during active development)
location / {
  add_header Cache-Control "public, max-age=3600";
}
```

---

## 3. Documentation

### README Updates

Update main README to mention migration:

```markdown
## Development Status

This project is undergoing a major refactoring. Two versions are available:

- **New UI** (default): `/kanji`, `/components`, etc.
- **Legacy UI**: `/legacy/kanji`, `/legacy/components`, etc.

Use the version toggle in the navigation to switch between them.
```

### Architecture Documentation

Update `docs/architecture.md` to reflect dual-codebase structure:

```markdown
## Temporary Migration Structure

During the refactoring period, the codebase contains both old and new implementations. See `docs/refactor/session-4-migration-strategy/` for details.
```

---

## Additional Items to Consider

### Package Dependencies

**Strategy:** Don't duplicate dependencies for legacy code.

- Both versions share same `package.json`
- No need for separate dependency management
- Remove unused dependencies during cleanup phase

### Type Definitions

**Strategy:** Keep types separate between versions (don't share).

**Rationale:**

- **Isolation** — Legacy is frozen; changes to new version types won't affect it
- **Safety** — Prevents accidental legacy code edits during new version development
- **Cleaner cleanup** — Delete `src/legacy/` without worrying about cascading impacts
- **Type drift** — New version may evolve types (strictness, new fields) independently

**Implementation:**

```typescript
// Legacy: src/legacy/shared/types/domain-types.ts
import type { Kanji, Component, Vocabulary } from '@/legacy/shared/types'

// New: src/shared/types/domain-types.ts
import type { Kanji, Component, Vocabulary } from '@/shared/types'
```

Types will be initially identical, but can diverge as new version evolves without
touching legacy code.

---

## Checklist

Before starting migration:

- [ ] Update VS Code settings
- [ ] Configure ESLint/Prettier ignores
- [ ] Add legacy scripts to package.json
- [ ] Update Makefile with legacy targets
- [ ] Update README with migration notice
- [ ] Update architecture documentation
- [ ] Verify HMR works for both versions
- [ ] Plan bundle analysis approach

During migration:

- [ ] Monitor bundle sizes for both versions
- [ ] Update docs as patterns emerge
- [ ] Document any version-specific quirks

After migration (cleanup):

- [ ] Remove legacy references from README
- [ ] Remove legacy scripts from package.json
- [ ] Remove legacy targets from Makefile
- [ ] Update all documentation
- [ ] Celebrate! 🎉

---

## Summary

Beyond code structure, consider:

✅ **Development tools** — VS Code settings, HMR
✅ **Build and deployment** — Bundle analysis, caching, service workers
✅ **Documentation** — README, architecture docs
✅ **Shared resources** — Dependencies
✅ **Monitoring** — Analytics, performance tracking

Most items require minimal changes due to Vite's architecture and shared
database/API layers. Main focus: excluding legacy from CI/lint by default while
keeping it accessible when needed.
