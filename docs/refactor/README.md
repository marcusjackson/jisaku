# Jisaku Frontend Refactoring Analysis

This folder contains comprehensive documentation for the planned frontend refactoring of the Jisaku kanji dictionary application.

**👉 Quick Start: [New Component Checklist](./CHECKLIST.md)** — Use this for every new component/feature

---

## Overview

- **Codebase Size**: ~60,000 lines of code
- **Primary Issue**: Component files exceeding size limits, unclear boundaries
- **Goal**: Restructure for maintainability and AI-assisted development

---

## ⚠️ Important: Fresh Rewrite Approach

This refactoring is a **complete rewrite** of the UI, not an incremental refactor:

- **Legacy code** is frozen in `src/legacy/` — it will not be incrementally improved
- **New UI** is being built from scratch following the patterns in these docs
- **Shared components** (`SharedSection`, `SharedHeader`, etc.) will be recreated
- **E2E tests** are in `e2e/legacy/` — new tests will be written for new UI
- **No migration** of old components — reference them, but don't copy them

**Why?** The old architecture has too many issues to fix incrementally. A fresh start allows proper patterns from day one.

---

## Reading Order

### Session 1: Architecture Assessment

Foundational analysis of current architecture and proposed infrastructure changes.

1. [Current Architecture Assessment](./session-1-architecture/1-current-architecture-assessment.md)
   - Module structure analysis
   - Root vs Section component sizing
   - Handler proliferation patterns
2. [Repository Pattern Analysis](./session-1-architecture/2-repository-pattern-analysis.md)
   - Current repository locations
   - Inconsistencies across modules
   - Standardization recommendations

3. [API Layer Restructuring Plan](./session-1-architecture/3-api-layer-restructuring-plan.md)
   - Proposed `src/api/` structure
   - Base repository interfaces
   - Migration strategy

4. [ESLint Rules Requirements](./session-1-architecture/4-eslint-rules-requirements.md)
   - File size enforcement rules
   - Component structure rules
   - Implementation phases

### Session 2: Component Restructuring

Detailed plans for breaking down large components.

1. [Component Hierarchy Breakdown Plan](./session-2-component-restructuring/1-component-hierarchy-breakdown-plan.md)
   - Root/Section/UI layer definitions
   - Naming conventions
   - Event forwarding patterns

2. [File Size Refactoring Strategy](./session-2-component-restructuring/2-file-size-refactoring-strategy.md)
   - Priority file list
   - Splitting techniques
   - Before/after examples

3. [Section Decomposition Patterns](./session-2-component-restructuring/3-section-decomposition-patterns.md)
   - Mode-based extraction (view/edit)
   - List item extraction
   - Dialog extraction

4. [Composable Restructuring Guidelines](./session-2-component-restructuring/4-composable-restructuring-guidelines.md)
   - Handler extraction patterns
   - State management patterns
   - Naming conventions

5. [Form Validation Patterns](./session-2-component-restructuring/5-form-validation-patterns.md)
   - vee-validate + zod integration
   - Shared validation schemas
   - Schema testing patterns

### Session 3: Testing, UI, and Sequencing

Testing improvements, UI consistency, and implementation planning.

1. [E2E Test Reliability Improvements](./session-3-testing-ui-sequencing/1-e2e-test-reliability-improvements.md)
   - Root causes of flakiness
   - Selector strategies (data-testid)
   - Async handling patterns

2. [UI/UX Consistency Guidelines](./session-3-testing-ui-sequencing/2-ui-ux-consistency-guidelines.md)
   - Interaction patterns
   - Button placement standards
   - Form patterns
   - Visual polish checklist

3. [Implementation Sequencing](./session-3-testing-ui-sequencing/3-implementation-sequencing.md)
   - Phase timeline
   - Module dependencies
   - Per-module checklists
   - Git strategy

4. [AI Agent Workflow Recommendations](./session-3-testing-ui-sequencing/4-ai-agent-workflow-recommendations.md)
   - Context window considerations
   - File size guidelines for AI
   - Patterns that enable AI proactivity

### Session 4: Migration Strategy

Strategy for executing the refactoring with dual-codebase approach.

1. [Dual-Codebase Strategy](./session-4-migration-strategy/1-dual-codebase-strategy.md)
   - Core concept and benefits
   - Technical feasibility analysis
   - Code organization with legacy folder
   - Decision summary and timeline

2. [Routing and Setup](./session-4-migration-strategy/2-routing-and-setup.md)
   - URL structure (prefix-based routing)
   - Router implementation
   - Version toggle UI component
   - Build and performance metrics

3. [Workflow and Risks](./session-4-migration-strategy/3-workflow-and-risks.md)
   - Phase-by-phase migration workflow
   - Per-phase validation checklists
   - CI/tooling configuration strategy
   - Git strategy and risk mitigations

4. [Additional Considerations](./session-4-migration-strategy/4-additional-considerations.md)
   - Development tools (VS Code, git hooks)
   - Build and deployment considerations
   - Documentation updates needed
   - Shared resources and monitoring

---

## Quick Reference

### Problem Files (by line count)

| File                                   | Lines | Priority |
| -------------------------------------- | ----- | -------- |
| KanjiRootDetail.vue                    | 1237  | Highest  |
| KanjiDetailMeanings.vue                | 1195  | Highest  |
| ComponentRootDetail.vue                | 757   | High     |
| ComponentDetailGroupings.vue           | 750   | High     |
| database-types.ts                      | 687   | Medium   |
| use-kanji-repository.ts                | 656   | Medium   |
| SettingsSectionClassificationTypes.vue | 643   | Medium   |

### Target Limits

| Component Type     | Max Lines |
| ------------------ | --------- |
| Root Components    | 200       |
| Section Components | 250       |
| UI Components      | 150       |
| Composables        | 200       |

### Key Patterns

1. **Root → Section → UI** hierarchy
2. **Handler extraction** to composables when 20+ handlers
3. **Mode splitting** (view/edit/grouping) for large sections
4. **vee-validate + zod** for all forms with colocated schemas
5. **data-testid** for all interactive elements and sections
6. **API layer** at `src/api/` with repository pattern

---

## Implementation Timeline

| Phase | Focus                         | Duration |
| ----- | ----------------------------- | -------- |
| 0     | Setup (ESLint, API structure) | 1 day    |
| 1     | Infrastructure (base repos)   | 2-3 days |
| 2     | Kanji module                  | 3-4 days |
| 3     | Component module              | 2-3 days |
| 4     | Settings module               | 1-2 days |
| 5     | Vocabulary module             | 1 day    |
| 6     | List modules                  | 2 days   |
| 7     | Testing & polish              | 2-3 days |

**Total: ~2-3 weeks**

---

## Document Statistics

All documents target 250-450 lines for readability:

| Document                        | Lines | Status |
| ------------------------------- | ----- | ------ |
| Current Architecture Assessment | 250   | ✅     |
| Repository Pattern Analysis     | 340   | ✅     |
| API Layer Restructuring Plan    | 469   | ✅     |
| ESLint Rules Requirements       | 483   | ✅     |
| Component Hierarchy Breakdown   | 297   | ✅     |
| File Size Refactoring Strategy  | 353   | ✅     |
| Section Decomposition Patterns  | 489   | ✅     |
| Composable Restructuring        | 436   | ✅     |
| Form Validation Patterns        | 259   | ✅     |
| E2E Test Reliability            | 372   | ✅     |
| UI/UX Consistency               | 438   | ✅     |
| Implementation Sequencing       | 363   | ✅     |
| AI Agent Workflow               | 377   | ✅     |
| Dual-Codebase Strategy          | 227   | ✅     |
| Routing and Setup               | 328   | ✅     |
| Workflow and Risks              | 337   | ✅     |
| Additional Considerations       | 210   | ✅     |

**Total: ~6,250 lines**

---

## Next Steps

1. Review all 12 documents for accuracy
2. Prioritize based on immediate pain points
3. Create refactor branch
4. Begin Phase 0: Setup
