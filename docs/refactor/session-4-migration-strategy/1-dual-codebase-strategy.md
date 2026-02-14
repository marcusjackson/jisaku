# Dual-Codebase Migration Strategy

**Summary:** This document outlines the strategy and feasibility of rewriting the
frontend from scratch while keeping the old codebase accessible, enabling
incremental releases and continuous reference to working code.

---

## Table of Contents

1. [Strategy Overview](#1-strategy-overview)
2. [Technical Feasibility](#2-technical-feasibility)
3. [Code Organization](#3-code-organization)
4. [Decision Summary](#4-decision-summary)

For implementation details, see:

- [Routing and Setup](./2-routing-and-setup.md) — Router implementation and UI
- [Workflow and Risks](./3-workflow-and-risks.md) — Migration phases and risk
  mitigations

---

## 1. Strategy Overview

### Core Concept

Maintain both old and new codebases simultaneously, allowing:

- Complete rewrite freedom without breaking existing functionality
- Incremental migration with production releases mid-refactor
- Reference old implementation while building new
- User-facing toggle to switch between versions
- Safe rollback if new version has issues
- Clean removal of old code once migration complete

### Key Benefits

| Benefit               | Explanation                                  |
| --------------------- | -------------------------------------------- |
| Zero Downtime         | App remains fully functional during refactor |
| Reference Code        | Old working code always available to check   |
| Incremental Testing   | Test new modules in production as you build  |
| Low Risk              | Can always fall back to old version          |
| Complete Rewrite      | No constraints from existing structure       |
| Progressive Migration | Ship features as they're completed           |

---

## 2. Technical Feasibility

### Build Size Impact

**Question:** Will doubling the codebase slow down the app?

**Answer:** Minimal impact on runtime, moderate impact on build.

#### Bundle Analysis

- **Current build size:** ~300KB gzipped (estimate)
- **Old + New together:** ~500-600KB gzipped (temporary)
- **Final (new only):** ~250-300KB (likely smaller with cleaner code)

#### Why Runtime Impact is Minimal

1. **Code Splitting:** Vite lazy-loads routes
2. **Conditional Loading:** Only load version user selects
3. **Tree Shaking:** Unused code eliminated per route
4. **PWA Caching:** Service worker caches both versions

**Result:** User only downloads routes they visit in their selected version.

#### Build Time Impact

- **Current build time:** ~30-60 seconds
- **With dual codebase:** ~60-90 seconds (+50%)
- **Development HMR:** Same speed (only active module reloads)

**Result:** Acceptable temporary cost for a personal project.

### Database Layer

**Shared:** Both versions use the same database layer.

```
src/
├── db/              ← Shared (no changes needed)
│   ├── init.ts
│   ├── migrations/
│   └── lifecycle.ts
```

**Rationale:**

- Database schema is stable and well-designed
- No need to rewrite working persistence logic
- Both UIs manipulate same underlying data
- Switching between versions shows same data

---

## 3. Code Organization

### Directory Structure

```
src/
├── db/                         ← Shared database (unchanged)
├── api/                        ← New API layer (shared by both)
│   ├── kanji/
│   ├── component/
│   └── vocabulary/
│
├── legacy/                     ← Old codebase (renamed)
│   ├── modules/
│   ├── pages/
│   ├── base/
│   ├── shared/
│   └── styles/
│
├── modules/                    ← New modules
│   ├── kanji/
│   ├── component/
│   └── vocabulary/
│
├── pages/                      ← New pages
├── base/                       ← New base components
├── shared/                     ← New shared code
├── styles/                     ← New styles
│
├── router/
│   ├── index.ts               ← Main router (new)
│   └── legacy-router.ts       ← Old router
│
├── App.vue                    ← New root (with version toggle)
├── LegacyApp.vue              ← Old root (renamed)
└── main.ts                    ← Entry point (both versions)
```

### Migration Steps for File Organization

#### Step 1: Rename Old Codebase

```bash
# Move all old code into legacy/ folder
mkdir src/legacy
mv src/modules src/legacy/modules
mv src/pages src/legacy/pages
mv src/base src/legacy/base
mv src/shared src/legacy/shared
mv src/styles src/legacy/styles

# Rename root component
mv src/App.vue src/legacy/LegacyApp.vue
```

#### Step 2: Update Old Code Imports

```bash
# Update all legacy imports to use new paths
# Example: '@/modules/kanji' → '@/legacy/modules/kanji'
# Example: '@/shared/components' → '@/legacy/shared/components'
```

Use find-and-replace:

```bash
# Find: @/modules/
# Replace: @/legacy/modules/

# Find: @/pages/
# Replace: @/legacy/pages/

# Find: @/base/
# Replace: @/legacy/base/

# Find: @/shared/
# Replace: @/legacy/shared/
```

#### Step 3: Create New Structure

```bash
# Create new empty directories
mkdir src/modules
mkdir src/pages
mkdir src/base
mkdir src/shared
mkdir src/styles
mkdir src/api

# Create placeholder new App.vue
```

---

## 4. Decision Summary

### Recommended Approach: Dual-Codebase with Legacy Folder

**Core decisions:**

1. ✅ **Move old code to `src/legacy/`** — Keeps old code accessible
2. ✅ **Build new code in standard locations** — Fresh start, no constraints
3. ✅ **Prefix-based routing** — `/legacy/*` for old, `/` for new
4. ✅ **Shared database and API layer** — Single source of truth
5. ✅ **Version toggle UI** — Easy switching during migration
6. ✅ **Incremental deployment** — Ship modules as completed
7. ✅ **Clean removal** — Delete legacy folder when done

### Why This Works

| Factor          | Impact                                       |
| --------------- | -------------------------------------------- |
| **Performance** | Minimal — lazy loading keeps bundles small   |
| **Build Time**  | +50% temporarily — acceptable for personal   |
| **Development** | Complete freedom — rewrite without limits    |
| **Risk**        | Zero — old version always available          |
| **Reference**   | Easy — old code at `src/legacy/`             |
| **Migration**   | Incremental — test each module in production |
| **Cleanup**     | Simple — delete one folder when done         |

### Next Steps

1. Read [Routing and Setup](./2-routing-and-setup.md)
2. Read [Workflow and Risks](./3-workflow-and-risks.md)
3. Begin Phase 0: Setup and Tooling
