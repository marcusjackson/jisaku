# Commit Instructions

Guidelines for writing commit messages following Conventional Commits.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

| Type       | Description                             |
| ---------- | --------------------------------------- |
| `feat`     | New feature                             |
| `fix`      | Bug fix                                 |
| `docs`     | Documentation only                      |
| `style`    | Formatting, no code change              |
| `refactor` | Code change that neither fixes nor adds |
| `test`     | Adding or updating tests                |
| `chore`    | Tooling, dependencies, config           |
| `perf`     | Performance improvement                 |

## Scope

Optional. Indicates the area of change:

- `kanji` — Kanji module
- `kanji-list` — Kanji list module
- `components` — Component module
- `settings` — Settings module
- `base` — Base utilities and components
- `shared` — Shared code
- `db` — Database layer
- `ui` — UI components
- `router` — Routing
- `pwa` — PWA functionality
- `deps` — Dependencies

## Subject

- Imperative mood: "add" not "adds" or "added"
- No capitalization
- No period at end
- Max 50 characters

## Body

- Explain **what** and **why**, not how
- Wrap at 72 characters
- Separate from subject with blank line

## Footer

- Reference issues: `Closes #42` or `Refs #42`
- Breaking changes: `BREAKING CHANGE: description`

## Examples

### Simple Feature

```
feat(kanji): add stroke count validation
```

### Feature with Body

```
feat(kanji): add stroke count validation

Add zod schema validation for stroke count field.
Ensures value is positive integer between 1-64.

Closes #42
```

### Bug Fix

```
fix(kanji-list): correct filter reset behavior

Filters were not resetting to default values when
clicking the clear button. Fixed by explicitly
setting each filter to its initial state.

Closes #57
```

### Documentation

```
docs: update architecture with component hierarchy

Add detailed explanation of Root/Section/UI pattern
with code examples for each layer.
```

### Refactor

```
refactor(kanji): extract form logic to composable

Move form state and validation from KanjiForm.vue
to use-kanji-form.ts for better testability.
```

### Chore

```
chore(deps): update vue to 3.5.2
```

### Multiple Scopes

If change spans multiple areas, omit scope or use most relevant:

```
feat: add dark mode support
```

### Breaking Change

```
feat(db)!: change schema for readings table

BREAKING CHANGE: readings table now uses separate
columns for onyomi and kunyomi instead of a type field.
Run migration 003 before updating.
```

## Commit Principles

### One Logical Change Per Commit

Each commit should represent a single, coherent change:

```
# ✅ Good - separate commits
feat(kanji): add form validation
test(kanji): add tests for form validation

# ❌ Bad - mixed concerns
feat(kanji): add validation and fix list styling
```

### Atomic Commits

Code should work after each commit. Don't commit broken states:

```
# ✅ Good - complete feature
feat(kanji): add delete confirmation dialog

# ❌ Bad - incomplete
wip: start working on delete
```

### Use Body for Context

When the subject isn't self-explanatory:

```
fix(kanji-list): handle empty search results

Previously, an empty search would show a loading spinner
indefinitely. Now properly shows "No results found" state.

The issue was that the loading state wasn't being reset
when the query returned zero results.

Closes #63
```

## Issue References

Reference GitHub Issues when applicable:

- `Closes #42` — Automatically closes issue when merged
- `Fixes #42` — Same as Closes
- `Refs #42` — References without closing
- `Part of #42` — Partial work toward an issue

```
feat(kanji): add JLPT level filter

Adds dropdown filter for JLPT levels N5-N1.
Filter state persists in URL query params.

Part of #15
```

## Pre-commit Checklist

Before committing:

- [ ] Changes compile without errors
- [ ] Tests pass
- [ ] Lint passes
- [ ] Commit message follows format
- [ ] One logical change per commit
- [ ] Issue referenced if applicable
