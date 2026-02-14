# Migration Workflow and Risk Mitigation

**Summary:** This document outlines the phase-by-phase migration workflow,
validation checklists, git strategy, and comprehensive risk mitigation strategies.

---

## Table of Contents

1. [Migration Workflow](#1-migration-workflow)
2. [Risks and Mitigations](#2-risks-and-mitigations)

See [Strategy Overview](./1-dual-codebase-strategy.md) for context and
[Routing and Setup](./2-routing-and-setup.md) for implementation details.

---

## 1. Migration Workflow

### Phase 0: Setup and Tooling

**Goal:** Separate legacy and new code, configure CI/lint/test for dual codebase.

**Core Tasks:**

1. Move old code to `src/legacy/`
2. Update all imports in legacy code
3. Configure ESLint to skip legacy
4. Configure TypeScript to skip legacy
5. Set up dual router with legacy prefix routes
6. Create version toggle component
7. Add legacy targets to Makefile
8. Verify both versions work

**Commands:**

```bash
mkdir -p src/legacy
mv src/modules src/legacy/
mv src/pages src/legacy/
mv src/base src/legacy/
mv src/shared src/legacy/
mv src/styles src/legacy/
mv src/App.vue src/legacy/LegacyApp.vue

mkdir -p src/modules src/pages src/base src/shared src/styles src/api

# Update legacy imports
find src/legacy -type f \( -name "*.vue" -o -name "*.ts" \) -exec sed -i '' \
  's/@\/modules/@\/legacy\/modules/g;
   s/@\/pages/@\/legacy\/pages/g;
   s/@\/base/@\/legacy\/base/g;
   s/@\/shared/@\/legacy\/shared/g' {} \;
```

**Tooling Configuration:**

```javascript
// eslint.config.ts
export default [
  { ignores: ['dist', 'node_modules', 'src/legacy/**'] }
  // ... rest of config
]
```

```json
// tsconfig.json
{ "exclude": ["src/legacy"] }
```

```makefile
# Makefile (add targets for optional legacy checks)
lint-legacy:
	pnpm eslint src/legacy --fix

check-legacy:
	pnpm eslint src/legacy
```

**Validation Checklist:**

- [ ] All files moved to `src/legacy/`
- [ ] Legacy imports updated
- [ ] ESLint ignores legacy by default
- [ ] Dual router works (test both `/kanji` and `/legacy/kanji`)
- [ ] `pnpm ci:full` succeeds
- [ ] `pnpm build` succeeds

### Phase 0.5: Navigation Header (Before Phase 1)

**Goal:** Build the new navigation header with version toggle before API work.

**Why before API?** Having the header with version switching allows immediate testing
of new UI components as they're built, and establishes the new UI shell.

**Tasks:**

1. Create new `SharedNavigation.vue` for new UI
2. Implement version toggle switch in legacy header
3. Set up basic layout shell
4. Ensure switching between new/legacy routes works

**Validation Checklist:**

- [ ] New header renders on new routes
- [ ] Version toggle switch works on legacy header
- [ ] Clicking switch navigates to coming-soon page
- [ ] Coming Soon page displays for unbuilt routes
- [ ] Styles match design tokens

### Phase 1: API Layer

**Goal:** Extract shared API layer (repositories, queries, mutations).

**Tasks:**

1. Create `src/api/` structure
2. Extract kanji repository
3. Extract component repository
4. Extract vocabulary repository
5. Update legacy code to use new API (optional—freeze legacy as-is if preferred)

**Structure:**

```
src/api/
├── index.ts
├── types.ts
├── base-repository.ts
├── kanji/
│   ├── kanji-repository.ts
│   ├── kanji-queries.ts
│   ├── kanji-mutations.ts
│   └── index.ts
├── component/
│   ├── component-repository.ts
│   └── index.ts
└── vocabulary/
    ├── vocabulary-repository.ts
    └── index.ts
```

**Validation Checklist:**

- [ ] API layer exports clear interfaces
- [ ] CRUD operations verified
- [ ] Tests pass
- [ ] Build succeeds

### Phase 2+: Module Refactoring

**Pattern for each module:**

1. Build new module in `src/modules/[name]/`
2. Create new page in `src/pages/`
3. Add routes to new router
4. Write unit and E2E tests
5. Validate against per-module checklist

**Suggested Module Order (by priority):**

1. Kanji (highest priority)
2. Component
3. Vocabulary
4. Settings
5. Lists

**Per-Module Checklist:**

- [ ] Root component created (< 200 lines)
- [ ] Section components created (< 250 lines)
- [ ] UI components created (< 150 lines)
- [ ] Composables extracted (< 200 lines)
- [ ] Unit tests pass
- [ ] E2E tests updated
- [ ] Keyboard accessible
- [ ] Error states handled
- [ ] Loading states handled
- [ ] CSS uses design tokens

### Phase N: Polish

**Goal:** UI/UX consistency, E2E reliability, make new version default.

**Tasks:**

1. Visual consistency pass across modules
2. E2E test flakiness fixes
3. Performance profiling
4. Update router to default to new UI

**Validation Checklist:**

- [ ] All features work in new version
- [ ] UI consistent across modules
- [ ] E2E tests stable (no flakiness)
- [ ] Performance acceptable
- [ ] Documentation updated

### Phase N+1: Cleanup

**Goal:** Remove legacy code and version toggle.

**Tasks:**

1. Remove version toggle switch component
2. Delete `src/legacy/` folder
3. Remove legacy routes from router
4. Update documentation

**Commands:**

```bash
rm -rf src/legacy
rm src/legacy/shared/components/SharedSwitchNewUi.vue
# Edit src/router/index.ts to remove legacy routes
pnpm build
pnpm ci:full
```

**Validation Checklist:**

- [ ] No references to `src/legacy/` remain
- [ ] No references to SharedSwitchNewUi remain
- [ ] Build succeeds
- [ ] All tests pass
- [ ] Documentation updated

### Git Strategy

**Flexible approach:** Work at your own pace with multiple branches per phase
if needed.

```bash
# Phase 0: One branch
git checkout -b refactor/setup
git commit -m "refactor: separate legacy and new code"
git commit -m "refactor: configure dual routing"
git commit -m "refactor: update CI/tooling for legacy exclusion"
git push && merge to main

# Phase 1: One branch
git checkout -b refactor/api-layer
git commit -m "refactor(api): create repositories and queries"
git push && merge to main

# Phases 2+: Multiple branches per phase if desired
git checkout -b feat/kanji-new-ui
git commit -m "feat(kanji): create new KanjiListPage"
git commit -m "feat(kanji): create new KanjiDetailPage"
git push && merge to main

git checkout -b feat/kanji-styling
git commit -m "style(kanji): apply design tokens"
git push && merge to main

git checkout -b test/kanji-e2e
git commit -m "test(kanji): add E2E tests"
git push && merge to main
# Repeat pattern for other modules
```

**Rationale:** Flexible branching allows working on multiple features
simultaneously and breaking up large changes into reviewable chunks.

---

## 2. Risks and Mitigations

### Risk 1: Import Path Confusion

**Risk:** Accidentally mixing legacy and new imports.

**Mitigation:**

- Add ESLint rule to prevent cross-version imports
- Use TypeScript path aliases to enforce boundaries
- Code review checklist: No `@/legacy/` imports in new code

### Risk 2: Database Conflicts

**Risk:** New code breaking assumptions made by old code.

**Mitigation:**

- Shared database layer (no changes)
- API layer enforces same constraints
- E2E tests for both versions: `pnpm test:e2e` and `pnpm test:e2e:legacy`

### Risk 3: Duplicate Work

**Risk:** Maintaining two versions increases effort.

**Mitigation:**

- **Freeze legacy code** — no new features, only critical bug fixes
- Focus all new development on new version
- Shared API layer minimizes divergence

### Risk 4: Build Pipeline Issues

**Risk:** Dual codebase increasing build time or bundle size.

**Mitigation:**

- Vite lazy-loads routes per version
- Monitor bundle sizes regularly
- Legacy code excluded from default CI checks

### Risk 5: Version Toggle Confusion

**Risk:** Users unclear about which version they're using.

**Mitigation:**

- Clear UI labels in toggle
- Tooltips explaining differences
- Remove toggle after migration complete

---

## Summary

This implementation plan provides:

✅ **Clear separation** — Legacy and new code in distinct folders
✅ **Flexible phases** — Work at your own pace, no fixed deadlines
✅ **Flexible branching** — Multiple branches per phase as needed
✅ **Smart CI/tooling** — Legacy excluded by default, opt-in checks available
✅ **Risk mitigations** — Import boundaries, API layer, testing strategy
✅ **Validation checklists** — Clear success criteria per phase

**Next Steps:**

1. Review [Routing and Setup](./2-routing-and-setup.md)
2. Review [Additional Considerations](./4-additional-considerations.md)
3. Begin Phase 0: Setup and Tooling
