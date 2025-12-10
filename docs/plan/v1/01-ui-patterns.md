# V1 UI Patterns

Section-based editing, collapsible patterns, destructive action safety, and navigation.

---

## Section-Based Editing

Each detail page is organized into independent sections. Each section can be edited without affecting others.

### Inline vs Dialog Editing

| Section Type            | Edit Mode | Reason                            |
| ----------------------- | --------- | --------------------------------- |
| Basic Info              | Inline    | Few fields, always visible        |
| Short Meaning           | Inline    | Single field                      |
| Readings                | Inline    | Short lists, quick editing        |
| Meanings list           | Inline    | List itself is short              |
| Meaning analysis/notes  | Dialog    | Lengthy text per item             |
| Related Entities        | Dialog    | Search/create flow                |
| Occurrences (component) | Inline    | List can be long, fields per item |
| Notes sections          | Inline    | Direct text editing               |

---

## Collapsible Sections: Selective Use

**Collapsing is NOT universal.** Reserve for content that can become very long.

### When to Use Collapsible

| Section                 | Collapsible? | Reason                              |
| ----------------------- | ------------ | ----------------------------------- |
| Basic Info              | No           | Always short, core metadata         |
| Short Meaning           | No           | Single field                        |
| Components (kanji page) | No           | Limited count, basic info only      |
| Readings                | No           | Typically short lists               |
| Meanings list           | No           | List itself not long                |
| Meaning analysis/notes  | Yes          | Can be lengthy per meaning          |
| Occurrences (component) | Yes          | Can list 50+ kanji with inline edit |
| Notes/Analysis fields   | Yes          | Designed for lengthy text           |

### Implementation

`SharedSection` component with `collapsible` prop (default: `false`):

```vue
<SharedSection title="Basic Info">
  <!-- Always expanded -->
</SharedSection>

<SharedSection title="Occurrences" collapsible default-open>
  <!-- Can collapse, starts open -->
</SharedSection>
```

### Collapse Button Placement

When collapsible, provide collapse trigger at:

1. Section header (always)
2. **Bottom of expanded content** (prevents scroll-back-up UX)

---

## Destructive Actions Safety

Design assumes users want to add, view, analyze—not delete. Deletion should be intentionally harder.

### Delete Button Placement

**DO NOT** make delete buttons prominent:

| Pattern                   | Status  | Notes                        |
| ------------------------- | ------- | ---------------------------- |
| Primary delete button     | ❌ Bad  | Too prominent                |
| Delete in main actions    | ❌ Bad  | High-traffic area            |
| Delete in "More" menu     | ✅ Good | Hidden behind dropdown       |
| Ghost/small delete button | ✅ Good | Visually de-emphasized       |
| Delete in separate panel  | ✅ Good | Requires navigation to reach |

### Entity Deletion

Entity deletion (kanji, component, vocab) requires multi-step confirmation:

1. Click delete in "More actions" menu
2. Confirmation dialog explains impact
3. User types entity name or clicks "I understand"
4. Deletion proceeds

### Unlinking Components (Kanji Page)

Current tag-based display with X buttons is dangerous. Required changes:

| Current                  | Issue                       | Solution                   |
| ------------------------ | --------------------------- | -------------------------- |
| Tags with X in view mode | Accidental unlink           | Remove X in view mode      |
| Tags with X in edit mode | Lost unsaved work if unlink | Require save before effect |

**Recommended approach:**

- View mode: Show linked components without remove option
- Edit mode: Show components with remove option, changes staged until save

### Confirmation Dialogs

For destructive actions, use `SharedConfirmDialog`:

```vue
<SharedConfirmDialog
  title="Remove Component?"
  message="This will unlink 日 from this kanji."
  confirm-text="Remove"
  variant="danger"
/>
```

---

## Navigation Improvements

### Back Button Placement

Detail pages should have "Back to List" at both **top and bottom**:

```
┌─────────────────────────────────────────────┐
│ ← Back to Kanji List                        │
├─────────────────────────────────────────────┤
│ [Page content...]                           │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│ ← Back to Kanji List                        │
└─────────────────────────────────────────────┘
```

### Filter State Persistence

When navigating from list → detail → back to list:

| Behavior         | Implementation                  |
| ---------------- | ------------------------------- |
| Preserve filters | Store in URL query params       |
| Preserve scroll  | Use router scrollBehavior       |
| Reset option     | Explicit "Clear filters" button |

**Implementation:** Use `useUrlSearchParams` or store filter state in route query.

### Browser Back vs Back Button

- **Browser back**: Returns to previous page in history stack
- **Back to List button**: Always navigates to list with preserved filters

Both should work correctly. Back button is a convenience shortcut.

---

## Quick-Create Forms

Minimal forms when creating entities from another entity's page.

### Standard Fields

| Entity    | Quick-Create Fields                                    |
| --------- | ------------------------------------------------------ |
| Kanji     | character, stroke_count, short_meaning                 |
| Component | character, stroke_count, short_meaning, can_be_radical |
| Vocab     | word, primary_reading, short_meaning                   |

### Flow

1. User clicks "+ Add" or "Create New"
2. Quick-create dialog opens
3. User fills minimal fields
4. On save: Navigate to new entity's detail page
5. User adds full details on entity's own page

### Dialog Design

```
┌─────────────────────────────────────────────┐
│ Quick Create Kanji                          │
├─────────────────────────────────────────────┤
│ Character: [___]                            │
│ Strokes:   [___]                            │
│ Meaning:   [_______________]                │
│                                             │
│ ⓘ Add readings and details on the          │
│   kanji detail page.                        │
│                                             │
│                  [Cancel] [Create & View]   │
└─────────────────────────────────────────────┘
```

---

## Linking Patterns

### Search or Create

When linking related entities:

1. Search existing by character OR meaning
2. Select from results → link created, stay on page
3. "Create New" option → quick-create dialog → navigate to new entity

### Display Linked Entities

Show basic info with navigation:

```
┌─────────────────────────────────────────────┐
│ 日  sun, day                                │
│ Position: 偏 (hen) • 🔶 Radical             │
│                              [View] [✕]     │
└─────────────────────────────────────────────┘
```

- **View**: Navigate to entity's detail page
- **Remove**: Only in edit mode, with confirmation
