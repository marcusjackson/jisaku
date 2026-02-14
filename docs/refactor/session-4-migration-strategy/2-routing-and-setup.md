# Routing and Setup Implementation

**Summary:** This document covers the routing strategy, version toggle UI, build
configuration, and performance analysis for the dual-codebase migration.

---

## Table of Contents

1. [Routing Strategy](#1-routing-strategy)
2. [Build and Performance](#2-build-and-performance)

See [Workflow and Risks](./3-workflow-and-risks.md) for migration phases and risk
mitigations.

---

## 1. Routing Strategy

### URL Structure

**Strategy:** Prefix-based routing for clear separation.

```
# New version (default)
/kanji
/kanji/123
/components
/vocabulary
/settings

# Legacy version
/legacy/kanji
/legacy/kanji/123
/legacy/components
/legacy/vocabulary
/legacy/settings
```

**Rationale:** Clear separation, easy to understand, shareable URLs. Query
parameter approach was considered but rejected due to parameter loss issues.

### Router Implementation

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const newRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/kanji'
  },
  {
    path: '/kanji',
    name: 'kanji-list',
    component: () => import('@/pages/KanjiListPage.vue'),
    meta: { title: 'Kanji List' }
  },
  {
    path: '/kanji/:id',
    name: 'kanji-detail',
    component: () => import('@/pages/KanjiDetailPage.vue'),
    meta: { title: 'Kanji Detail' }
  }
  // ... other new routes
]

const legacyRoutes: RouteRecordRaw[] = [
  {
    path: '/legacy',
    redirect: '/legacy/kanji'
  },
  {
    path: '/legacy/kanji',
    name: 'legacy-kanji-list',
    component: () => import('@/legacy/pages/KanjiListPage.vue'),
    meta: { title: 'Kanji List (Legacy)' }
  },
  {
    path: '/legacy/kanji/:id',
    name: 'legacy-kanji-detail',
    component: () => import('@/legacy/pages/KanjiDetailPage.vue'),
    meta: { title: 'Kanji Detail (Legacy)' }
  }
  // ... other legacy routes
]

const routes = [...newRoutes, ...legacyRoutes]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})
```

### Version Toggle UI Component

Implement a switch component for toggling between versions during development.
This provides immediate visual feedback and is simpler than a dropdown menu.

**Implementation Location:** `src/legacy/shared/components/SharedSwitchNewUi.vue`

**Component Behavior:**

- **OFF (gray)** = Currently on legacy UI (`/legacy/*` routes)
- **ON (colored)** = Attempting to use new UI (navigates to `/coming-soon`)
- **Disabled state** = Indicates the new UI is still under construction

```vue
<!-- src/legacy/shared/components/SharedSwitchNewUi.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseSwitch from '@/legacy/base/components/BaseSwitch.vue'

const route = useRoute()
const router = useRouter()

// ON if on new UI, OFF if on legacy
const isNewUiMode = computed(() => {
  const path = route.path
  return !path.startsWith('/legacy') && path !== '/'
})

// Handle toggle click
async function handleToggle() {
  if (!isNewUiMode.value) {
    await router.push('/coming-soon')
  }
}
</script>

<template>
  <div
    class="shared-switch-new-ui"
    title="Switch to new UI (under construction)"
  >
    <BaseSwitch
      :model-value="isNewUiMode"
      disabled
      @click="handleToggle"
    >
      <span class="shared-switch-new-ui-label">New UI</span>
    </BaseSwitch>
  </div>
</template>

<style scoped>
.shared-switch-new-ui {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.shared-switch-new-ui-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Mobile: hide label on small screens */
@media (max-width: 400px) {
  .shared-switch-new-ui-label {
    display: none;
  }
}
</style>
```

### Placement Strategy

**Location:** Legacy header navigation (always accessible)

**Implementation:** Add `SharedSwitchNewUi` component to the right of the settings icon.

**Legacy code:** Add to `SharedHeader.vue` header

```vue
<!-- src/legacy/shared/components/SharedHeader.vue -->
<template>
  <header class="shared-header">
    <div class="shared-header-content">
      <RouterLink
        class="shared-header-logo"
        to="/legacy"
      >
        自作
      </RouterLink>

      <nav
        aria-label="Main navigation"
        class="shared-header-nav"
      >
        <RouterLink
          class="shared-header-link"
          to="/legacy/kanji"
        >
          Kanji
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/legacy/components"
        >
          Components
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/legacy/vocabulary"
        >
          Vocab
        </RouterLink>
        <RouterLink
          aria-label="Settings"
          class="shared-header-link shared-header-link--icon"
          title="Settings"
          to="/legacy/settings"
        >
          <!-- Settings icon SVG -->
        </RouterLink>
        <SharedSwitchNewUi />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import SharedSwitchNewUi from './SharedSwitchNewUi.vue'
</script>

<style scoped>
/* Position switch next to settings, with minimal gap */
:deep(.shared-switch-new-ui) {
  margin-left: var(--spacing-xs);
}

/* Hide label on small screens for mobile responsiveness */
@media (max-width: 400px) {
  :deep(.shared-switch-new-ui-label) {
    display: none;
  }
}
</style>
```

**Why a Switch vs Dropdown:**

- **Simple & Direct:** Single toggle with clear ON/OFF states
- **Mobile Friendly:** Takes minimal header space, label hides on small screens
- **Visual Feedback:** Switch state immediately shows current version
- **Low Cognitive Load:** No menu navigation needed
- **Temporary Solution:** Easy to remove once refactoring is complete
- **Consistent:** Uses existing `BaseSwitch` component from design system

---

## 2. Build and Performance

### Vite Configuration

No changes needed. Vite's default lazy loading handles dual codebase efficiently.

```typescript
// vite.config.ts (existing configuration works)
export default defineConfig({
  plugins: [vue(), VitePWA({ ... })],
  build: {
    rollupOptions: {
      output: {
        // Vite automatically chunks by route
        manualChunks: undefined
      }
    }
  }
})
```

### Performance Metrics

| Metric               | Current | Dual Codebase | New Only |
| -------------------- | ------- | ------------- | -------- |
| Initial Bundle       | ~300KB  | ~300KB        | ~250KB   |
| Total Build Size     | ~1.5MB  | ~2.5MB        | ~1.3MB   |
| Route Load (gzipped) | ~50KB   | ~50KB         | ~40KB    |
| Build Time           | 45s     | 70s           | 40s      |
| Dev HMR              | <1s     | <1s           | <1s      |

**Key Insight:** Users only download routes they visit, so having both versions doesn't impact runtime performance.

### Bundle Analysis

Run bundle analysis to verify lazy loading:

```bash
# Build with analysis
pnpm build -- --mode analyze

# Check chunk sizes
ls -lh dist/assets/*.js
```

Expected output:

```
# New version routes
kanji-list.abc123.js    ~45KB
kanji-detail.def456.js  ~52KB

# Legacy version routes (separate chunks)
legacy-kanji-list.ghi789.js     ~48KB
legacy-kanji-detail.jkl012.js   ~55KB
```

### Caching Strategy

Service worker caches both versions:

```javascript
// Auto-generated by Vite PWA plugin
workbox.precaching.precacheAndRoute([
```
