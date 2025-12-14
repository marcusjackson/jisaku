# V1 UI Patterns

Section-based editing, collapsible patterns, destructive action safety, and navigation patterns.

---

## Section-Based Editing

Each detail page is organized into independent sections. Each section can be edited without affecting others.

### Edit Mode Decision Matrix

| Content Type           | Edit Mode | Reason                         | Example                       |
| ---------------------- | --------- | ------------------------------ | ----------------------------- |
| Identity fields        | Linked    | Opens form, not inline         | Character, short_meaning      |
| Short text/numbers     | Inline    | Direct editing, quick updates  | Stroke count, JLPT level      |
| Lists (few items)      | Inline    | Add/remove/reorder directly    | Readings, meanings            |
| Related entity linking | Dialog    | Search/create flow             | Add component, add vocabulary |
| Analysis per item      | Inline    | Direct field updates per card  | Occurrence position, notes    |
| Long-form text         | Inline    | BaseInlineTextarea             | Etymology notes, description  |
| Per-item complex data  | Inline+   | List inline, details in dialog | Meaning with related kanji    |

### Edit Mode Implementation Patterns

#### Linked (Header Edit Button)

Header fields open a form dialog for editing character, short_meaning, search_keywords:

```vue
<!-- Header -->
<div class="header">
  <h1>{{ kanji.character }}</h1>
  <p>{{ kanji.short_meaning }}</p>
  <BaseButton @click="openEditForm">Edit</BaseButton>
</div>
```

#### Inline (Direct Editing)

Section content is directly editable:

```vue
<SharedSection title="Basic Information">
  <div v-if="!isEditing">
    <p>Stroke Count: {{ kanji.stroke_count }}</p>
    <BaseButton @click="isEditing = true">Edit</BaseButton>
  </div>
  <form v-else @submit="save">
    <BaseInput v-model="kanji.stroke_count" type="number" />
    <BaseButton type="submit">Save</BaseButton>
    <BaseButton @click="cancel">Cancel</BaseButton>
  </form>
</SharedSection>
```

#### Dialog (Search/Create)

Opens dialog for searching existing entities or creating new:

```vue
<SharedSection title="Components">
  <ComponentCardList :components="linkedComponents" />
  <BaseButton @click="openAddDialog">+ Add Component</BaseButton>
</SharedSection>

<SharedEntitySearch
  v-if="showDialog"
  entity-type="component"
  @select="linkComponent"
  @create="createComponent"
/>
```

#### Inline+ (List with Per-Item Dialogs)

List is inline-editable, but complex per-item data uses dialogs:

```vue
<SharedSection title="Meanings">
  <div v-for="meaning in meanings" :key="meaning.id">
    <p>{{ meaning.text }}</p>
    <BaseButton @click="openMeaningDialog(meaning)">
      Edit Details
    </BaseButton>
  </div>
</SharedSection>
```

---

## Collapsible Sections

**Not universal.** Reserve for content that can become very long.

### When to Use Collapsible

| Section Type            | Collapsible? | Reason                                  |
| ----------------------- | ------------ | --------------------------------------- |
| Basic Information       | No           | Core metadata, always short             |
| Readings                | No           | Typically short lists                   |
| Short lists             | No           | Limited count (5-10 items)              |
| Components (kanji page) | No           | Limited count, basic info only          |
| Occurrences (component) | Yes          | Can list 50+ kanji with inline fields   |
| Notes/Analysis fields   | Yes          | Designed for lengthy text               |
| Stroke diagrams         | Yes          | Takes vertical space, not always needed |
| Kanji breakdown (vocab) | Yes          | Multiple kanji with detailed analysis   |

**Settings Page Entity Management:**

Future classification types (kanji classifications, etc.) should follow the Position Types pattern:

- Collapsible by default (`default-open="false"`)
- Full CRUD interface within section
- Rationale: These are rarely accessed after initial setup, typically have 5-15 items with descriptions

### Implementation with SharedSection

```vue
<!-- Non-collapsible (default) -->
<SharedSection title="Basic Information">
  <KanjiDetailBasicInfo />
</SharedSection>

<!-- Collapsible, starts open -->
<SharedSection title="Occurrences" collapsible default-open>
  <ComponentOccurrenceList />
</SharedSection>

<!-- Collapsible, starts closed -->
<SharedSection title="Etymology Notes" collapsible>
  <BaseInlineTextarea v-model="notes" />
</SharedSection>
```

### Collapse Button Placement

When collapsible and expanded, provide collapse trigger at:

1. **Section header** (always, via SharedSection)
2. **Bottom of expanded content** (prevents scroll-back-up UX)

```vue
<template>
  <CollapsibleContent v-if="isOpen">
    <slot />
    <!-- Bottom collapse button -->
    <BaseButton
      variant="ghost"
      @click="isOpen = false"
      class="collapse-bottom"
    >
      ▲ Collapse
    </BaseButton>
  </CollapsibleContent>
</template>
```

**Rationale:** After scrolling through long content, clicking collapse at the bottom is more convenient than scrolling back up to the section header.

---

## Destructive Action Safety

Design assumes users want to add, view, analyze—not delete. Deletion should be intentionally harder to prevent accidents.

### Delete Button Styling

| Pattern                       | Status  | Notes                                   |
| ----------------------------- | ------- | --------------------------------------- |
| Primary delete button         | ❌ Bad  | Too prominent                           |
| Delete in main action area    | ❌ Bad  | High-traffic area                       |
| Delete with danger variant    | ❌ Bad  | Draws attention                         |
| Ghost variant delete button   | ✅ Good | Visually de-emphasized                  |
| Delete with increased spacing | ✅ Good | Reduces accidental clicks (spacing-lg)  |
| Delete in "More" menu         | ✅ Good | Hidden behind dropdown (future pattern) |

**Current implementation:**

```vue
<div class="actions">
  <BaseButton variant="secondary" @click="edit">Edit</BaseButton>
  <!-- Increased spacing (lg instead of md/sm) -->
  <BaseButton variant="ghost" @click="confirmDelete">Delete</BaseButton>
</div>
```

**CSS:**

```css
.actions {
  display: flex;
  gap: var(--spacing-lg); /* Larger gap reduces accidents */
}
```

### Entity Deletion Confirmation

Entity deletion (kanji, component, vocab) requires multi-step confirmation:

```vue
<SharedConfirmDialog
  v-model:open="showDeleteConfirm"
  title="Delete Kanji?"
  variant="danger"
>
  <p>This will permanently delete 明 and all related data:</p>
  <ul>
    <li>Readings and meanings</li>
    <li>Component links ({{ componentCount }})</li>
    <li>Vocabulary links ({{ vocabCount }})</li>
  </ul>
  <p><strong>This cannot be undone.</strong></p>
  
  <template #actions>
    <BaseButton @click="showDeleteConfirm = false">Cancel</BaseButton>
    <BaseButton variant="danger" @click="deleteEntity">
      Delete Permanently
    </BaseButton>
  </template>
</SharedConfirmDialog>
```

### Unlinking Confirmation

Unlinking related entities (e.g., removing a component from a kanji):

```vue
<SharedConfirmDialog
  title="Remove Component?"
  message="This will unlink 日 from this kanji. Position and analysis notes will be lost."
  confirm-text="Remove"
  variant="danger"
/>
```

**Key principle:** Explain what will be lost. Don't just ask "Are you sure?"

### View vs Edit Mode Safety

**View mode:** No remove/delete actions visible

```vue
<SharedCardSubEntity
  :character="component.character"
  :stroke-count="component.stroke_count"
  :display-meaning="component.short_meaning"
  :show-remove="false"
  @view="navigateToComponent"
/>
```

**Edit mode:** Remove actions available with confirmation

```vue
<SharedCardSubEntity
  :character="component.character"
  :stroke-count="component.stroke_count"
  :display-meaning="component.short_meaning"
  :show-remove="isEditing"
  @view="navigateToComponent"
  @remove="confirmRemove"
/>
```

**Rationale:** In view mode, users are navigating and reading—accidental clicks on remove buttons would be disruptive. Edit mode is an intentional state where modifications are expected.

---

## Navigation Patterns

### Back Button Placement

Detail pages have "Back to List" at **top and bottom**:

```vue
<template>
  <div class="page">
    <!-- Top back button -->
    <SharedBackButton :to="{ name: 'kanji-list' }" />

    <!-- Page content -->
    <KanjiDetailHeader />
    <SharedSection>...</SharedSection>

    <!-- Bottom actions and back button -->
    <div class="actions">
      <BaseButton>Edit</BaseButton>
      <BaseButton variant="ghost">Delete</BaseButton>
    </div>
    <SharedBackButton :to="{ name: 'kanji-list' }" />
  </div>
</template>
```

**Rationale:** After scrolling through a long page, users shouldn't have to scroll back to the top to navigate away.

### Filter State Preservation

When navigating from list → detail → back to list, preserve filters and scroll position.

**Implementation:** Use URL query params for filter state:

```typescript
// use-kanji-filters.ts
export function useKanjiFilters() {
  const route = useRoute()
  const router = useRouter()

  const filters = reactive({
    search: (route.query.search as string) || '',
    jlptLevel: (route.query.jlpt as string) || ''
    // ...
  })

  watch(filters, (newFilters) => {
    router.replace({
      query: {
        ...route.query,
        ...newFilters
      }
    })
  })

  return { filters }
}
```

**SharedBackButton** preserves query params:

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const props = defineProps<{
  to: { name: string }
}>()

const backRoute = computed(() => ({
  ...props.to,
  query: route.query // Preserve existing query params
}))
</script>

<template>
  <RouterLink
    :to="backRoute"
    class="back-button"
  >
    ← Back to {{ props.to.name }}
  </RouterLink>
</template>
```

### Browser Back vs Back Button

- **Browser back:** Returns to previous page in history stack (may go outside app)
- **Back to List button:** Always navigates to list with preserved filters

Both should work correctly. Back button is a convenience shortcut for the most common navigation pattern.

---

## Quick-Create Forms

Minimal forms when creating entities from another entity's page. Full details are added later on the entity's own detail page.

### Standard Fields

| Entity    | Quick-Create Fields                                    |
| --------- | ------------------------------------------------------ |
| Kanji     | character, stroke_count, short_meaning                 |
| Component | character, stroke_count, short_meaning, can_be_radical |
| Vocab     | word, primary_reading, short_meaning                   |

**Omitted from quick-create:** search_keywords, readings, meanings, classifications, notes, images, etc.

### Flow

1. User clicks "+ Add" or "Create New" in a linking section
2. Quick-create dialog opens
3. User fills minimal fields
4. On save:
   - Entity created
   - Link created (kanji ↔ component, kanji ↔ vocab)
   - **Navigate to new entity's detail page** for full editing

**Rationale:** Quick-create gets the entity into the system fast. Navigation to detail page makes it obvious where to continue adding information.

### Dialog Design

```vue
<SharedQuickCreateKanji v-model:open="showDialog" @created="onKanjiCreated">
  <template #footer-info>
    <p class="info-text">
      ⓘ Add readings, keywords, and detailed information 
      on the kanji detail page.
    </p>
  </template>
</SharedQuickCreateKanji>
```

**Key elements:**

- Title indicates this is quick creation
- Only essential fields
- Info text explains next step
- On create, navigation happens automatically

---

## Linking Patterns

### Search or Create

When linking related entities from a section:

```
┌─────────────────────────────────────────────┐
│ Add Component                               │
├─────────────────────────────────────────────┤
│ Search: [日____________________] [🔍]      │
│                                             │
│ Results:                                    │
│ ┌─────────────────────────────────────┐   │
│ │ 日  4画  太陽、日              [+] │   │
│ │ 月  4画  月                    [+] │   │
│ │ 木  4画  木                    [+] │   │
│ └─────────────────────────────────────┘   │
│                                             │
│ Not found? [Create New Component]           │
└─────────────────────────────────────────────┘
```

**Flow:**

1. Search existing by character or short_meaning
2. Select from results → link created, **stay on current page**
3. "Create New" option → quick-create dialog → **navigate to new entity**

**Rationale:** Linking existing entities is a quick action that shouldn't disrupt flow. Creating new entities requires more work, so navigation to the detail page is appropriate.

### Display Linked Entities

Show basic info with navigation:

```vue
<SharedCardSubEntity
  :character="component.character"
  :stroke-count="component.stroke_count"
  :display-meaning="component.short_meaning"
  :badges="[
    { text: '偏 (hen)', variant: 'default' },
    { text: 'Radical', variant: 'primary' }
  ]"
  @view="navigateToComponent"
  @remove="confirmRemove"
/>
```

**Actions:**

- **View:** Navigate to entity's detail page
- **Remove:** Only in edit mode, with confirmation

**Badge examples:**

- Components: Position type (偏), radical indicator (🔶 or "Radical")
- Vocabulary: Reading (あした), JLPT level (N5)

---

## Form Validation Feedback

### Inline Errors

Display validation errors below the field:

```vue
<BaseInput
  v-model="character"
  label="Character"
  :error="errors.character"
  required
/>
<!-- errors.character = "Character is required" -->
```

### Form-Level Errors

For errors that affect multiple fields or the form as a whole:

```vue
<div v-if="formError" class="form-error">
  <p>{{ formError }}</p>
</div>
```

### Toast Notifications

For operation results (not validation errors):

- Success: "Kanji created successfully"
- Error: "Failed to save changes. Please try again."

**Do NOT use toasts for validation errors.** Those should be inline with the fields.

---

## Loading and Empty States

### Loading

Reserve space to prevent layout shift:

```vue
<div v-if="loading" class="spinner-container">
  <BaseSpinner />
</div>
<div v-else>
  <!-- Content -->
</div>
```

### Empty State

When a list or section has no data:

```vue
<div v-if="components.length === 0" class="empty-state">
  <p>No components linked yet.</p>
  <BaseButton @click="openAddDialog">+ Add Component</BaseButton>
</div>
```

### Error State

When data fails to load:

```vue
<div v-if="error" class="error-state">
  <p>Failed to load kanji data.</p>
  <BaseButton @click="retry">Retry</BaseButton>
</div>
```

---

## Keyboard Accessibility

All interactive elements must be keyboard-accessible:

- Forms: Tab through fields, Enter to submit
- Buttons: Focus visible, Enter/Space to activate
- Dialogs: Trap focus, Escape to close
- Collapsible sections: Enter/Space to toggle
- Lists: Arrow keys to navigate (when appropriate)

**Reka UI components handle most accessibility patterns automatically.** Verify in testing.

---

## Quick Reference: Pattern Decision Tree

**When adding a new section:**

1. Is the content always short (< 10 lines)? → **Not collapsible**
2. Can it become lengthy (> 20 lines)? → **Collapsible**
3. Are there 1-3 simple fields? → **Inline editing**
4. Is there a search/create flow? → **Dialog editing**
5. Is it a list with per-item fields? → **Inline editing per item**
6. Does it link to other entities? → **Display basic info + View button**
7. Does it own deep analysis? → **Inline editable fields per item**

**When adding an action:**

1. Is it destructive (delete, remove)? → **Ghost variant, increased spacing, confirmation**
2. Is it the primary action? → **Primary or secondary button**
3. Is it a quick toggle? → **Switch or checkbox, no confirmation**
4. Does it navigate away? → **Link styled as button or View button**
