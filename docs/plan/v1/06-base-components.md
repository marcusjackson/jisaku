# V1 Base Components

UI component requirements for implementing V1 features. Focus on components that enable section-based editing and entity linking patterns.

---

## Required Components

### SharedSection ✅ Implemented

Wrapper for page sections with optional collapsible behavior.

**Props:**

- `title: string` - Section heading
- `collapsible?: boolean` - Enable collapse (default: false)
- `defaultOpen?: boolean` - Initial state when collapsible (default: true)

**Slots:**

- `default` - Section content
- `actions` - Right-side buttons (Edit, Add, etc.)

**Features:**

- Uses Reka UI Collapsible when `collapsible=true`
- Collapse button at bottom of content when expanded
- Non-collapsible sections render simpler structure

**Usage:**

```vue
<!-- Non-collapsible -->
<SharedSection title="Basic Information">
  <KanjiDetailBasicInfo />
  <template #actions>
    <BaseButton @click="edit">Edit</BaseButton>
  </template>
</SharedSection>

<!-- Collapsible -->
<SharedSection title="Occurrences" collapsible default-open>
  <ComponentOccurrenceList />
</SharedSection>
```

---

### SharedCardSubEntity ✅ Implemented

Base card for displaying linked entities (components on kanji page, kanji on component page, vocab on kanji page).

**Props:**

- `character: string` - Entity character/word
- `strokeCount?: number` - Stroke count (optional)
- `displayMeaning?: string` - Short meaning
- `badges?: Array<{ text: string; variant?: 'default' | 'primary' | 'warning' }>` - Metadata badges
- `showRemove?: boolean` - Show remove button (default: false)

**Events:**

- `view` - Navigate to entity detail page
- `remove` - Remove link (requires confirmation)

**Usage:**

```vue
<SharedCardSubEntity
  :character="component.character"
  :stroke-count="component.stroke_count"
  :display-meaning="component.short_meaning"
  :badges="[
    { text: '偏 (hen)', variant: 'default' },
    { text: 'Radical', variant: 'primary' }
  ]"
  :show-remove="isEditing"
  @view="navigateToComponent"
  @remove="confirmRemove"
/>
```

---

### SharedBackButton ✅ Implemented

Back button that preserves filter state via URL query params.

**Props:**

- `to: { name: string }` - Route object for navigation

**Implementation:**

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const props = defineProps<{ to: { name: string } }>()

const backRoute = computed(() => ({
  ...props.to,
  query: route.query // Preserve filters
}))
</script>

<template>
  <RouterLink
    :to="backRoute"
    class="back-button"
  >
    ← Back to List
  </RouterLink>
</template>
```

---

### SharedEntitySearch ✅ Implemented

Search + create pattern for linking entities.

**Props:**

- `entityType: 'kanji' | 'component' | 'vocab'` - Type of entity to search
- `options: Array<Entity>` - Available entities for selection
- `excludeIds?: number[]` - Already linked, exclude from results
- `placeholder?: string` - Search input placeholder
- `label?: string` - Search input label

**Events:**

- `select` - Existing entity selected
- `create` - User wants to create new

**Usage:**

```vue
<SharedEntitySearch
  v-model:open="showDialog"
  entity-type="component"
  :options="allComponents"
  :exclude-ids="linkedComponentIds"
  @select="linkComponent"
  @create="openQuickCreate"
/>
```

---

### SharedQuickCreateKanji ✅ Implemented

Minimal form for quick kanji creation.

**Props:**

- `open: boolean` - Dialog open state

**Events:**

- `update:open` - Dialog close event
- `created` - Kanji created, emits new kanji object

**Fields:**

- `character` (required, max 1 character)
- `stroke_count` (required, positive integer)
- `short_meaning` (optional, max 100 characters)

**Usage:**

```vue
<SharedQuickCreateKanji v-model:open="showDialog" @created="onKanjiCreated" />
```

---

### SharedQuickCreateComponent ✅ Implemented

Minimal form for quick component creation.

**Props:**

- `open: boolean` - Dialog open state

**Events:**

- `update:open` - Dialog close event
- `created` - Component created, emits new component object

**Fields:**

- `character` (required, max 1 character)
- `stroke_count` (required, positive integer)
- `short_meaning` (optional, max 100 characters)
- `can_be_radical` (optional, boolean checkbox)

**Usage:**

```vue
<SharedQuickCreateComponent
  v-model:open="showDialog"
  @created="onComponentCreated"
/>
```

---

### SharedQuickCreateVocab ⬜ Planned

Minimal form for quick vocabulary creation.

**Props:**

- `open: boolean` - Dialog open state
- `prefilledKanjiId?: number` - Auto-link to this kanji (optional)

**Events:**

- `update:open` - Dialog close event
- `created` - Vocab created, emits new vocab object

**Fields:**

- `word` (required, max 50 characters)
- `primary_reading` (required, hiragana only, max 50 characters)
- `short_meaning` (optional, max 100 characters)

**Auto-detection:** If word contains kanji characters, detect and create links automatically.

**Usage:**

```vue
<SharedQuickCreateVocab
  v-model:open="showDialog"
  :prefilled-kanji-id="kanji.id"
  @created="onVocabCreated"
/>
```

---

### SharedConfirmDialog

Confirmation dialog for destructive actions.

**Props:**

- `open: boolean` - Dialog open state
- `title: string` - Dialog title
- `message?: string` - Simple message (alternative to slot)
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `variant?: 'default' | 'danger'` - Visual variant (default: 'default')

**Events:**

- `update:open` - Dialog close event
- `confirm` - User confirmed action
- `cancel` - User cancelled action

**Slots:**

- `default` - Dialog content (alternative to message prop)

**Usage:**

```vue
<SharedConfirmDialog
  v-model:open="showDeleteConfirm"
  title="Delete Kanji?"
  variant="danger"
  confirm-text="Delete Permanently"
  @confirm="deleteKanji"
>
  <p>This will permanently delete 明 and all related data:</p>
  <ul>
    <li>Readings and meanings</li>
    <li>Component links ({{ componentCount }})</li>
    <li>Vocabulary links ({{ vocabCount }})</li>
  </ul>
  <p><strong>This cannot be undone.</strong></p>
</SharedConfirmDialog>
```

---

## Existing Base Components

These components are already implemented and support V1 patterns:

| Component          | Uses Reka UI | Status | Notes                      |
| ------------------ | ------------ | ------ | -------------------------- |
| BaseButton         | No           | ✅     | Simple, no Reka needed     |
| BaseCheckbox       | Checkbox     | ✅     | Rewritten with Reka UI     |
| BaseCombobox       | Combobox     | ✅     | Enhanced with searchKeys   |
| BaseComboboxMulti  | Combobox     | ✅     | Multi-select support       |
| BaseDialog         | Dialog       | ✅     | Already using Reka         |
| BaseFileInput      | No           | ✅     | Custom, no Reka equivalent |
| BaseInlineTextarea | No           | ✅     | Custom contenteditable     |
| BaseInput          | No           | ✅     | Native input               |
| BaseSelect         | Select       | ✅     | Already using Reka         |
| BaseSpinner        | No           | ✅     | CSS animation              |
| BaseSwitch         | Switch       | ✅     | Reka UI Switch             |
| BaseTextarea       | No           | ✅     | Native textarea            |
| BaseToast          | Toast        | ✅     | Using ToastProvider        |

---

## BaseCombobox Enhancements

BaseCombobox supports advanced search and display:

**Props:**

- `options: Array<T>` - Available options
- `modelValue: T | null` - Selected value
- `valueKey?: string` - Property for option value (default: 'id')
- `searchKeys?: string[]` - Properties to search across
- `displayFn?: (option: T) => string` - Custom display formatting
- `placeholder?: string`
- `label?: string`

**searchKeys Example:**

```vue
<BaseCombobox
  v-model="selectedKanji"
  :options="allKanji"
  :search-keys="['character', 'short_meaning', 'search_keywords']"
  :display-fn="(k) => `${k.character} - ${k.short_meaning}`"
  value-key="id"
  placeholder="Search by character or meaning..."
/>
```

**Implementation:** Searches across multiple fields, filters options client-side.

---

## Reka UI Components Used

V1 features leverage these Reka UI primitives:

| Reka Component | Used In                                | Docs Path                          |
| -------------- | -------------------------------------- | ---------------------------------- |
| Collapsible    | SharedSection (when collapsible=true)  | docs/reference/reka-ui/collapsible |
| Dialog         | BaseDialog, quick-create components    | docs/reference/reka-ui/dialog      |
| Combobox       | BaseCombobox, BaseComboboxMulti        | docs/reference/reka-ui/combobox    |
| Select         | BaseSelect, position dropdowns         | docs/reference/reka-ui/select      |
| Checkbox       | BaseCheckbox, is_radical toggles       | docs/reference/reka-ui/checkbox    |
| Switch         | BaseSwitch, can_be_radical toggles     | docs/reference/reka-ui/switch      |
| Toast          | BaseToast, success/error notifications | docs/reference/reka-ui/toast       |

**Reference docs:** `docs/reference/reka-ui/` folder contains full Reka UI documentation.

---

## Component Organization

Base components are project-agnostic and live in `src/base/components/`. Shared components are app-specific and live in `src/shared/components/`.

### Decision Rule

**Base components:**

- Generic UI primitives that work in ANY Vue project
- Examples: BaseButton, BaseInput, BaseCheckbox, BaseDialog

**Shared components:**

- App-specific components used across multiple modules
- Examples: SharedSection, SharedCardSubEntity, SharedEntitySearch, quick-create components

**Module components:**

- Feature-specific components used within one module only
- Examples: KanjiDetailHeader, ComponentOccurrenceCard

---

## Testing Requirements

### Unit Tests

Each component should have colocated unit tests:

```
SharedSection.vue
SharedSection.test.ts
```

**Test coverage:**

- Props and slots rendering
- Event emissions
- Collapsible behavior (if applicable)
- Keyboard accessibility
- Edge cases (empty states, long content)

### E2E Tests

E2E tests verify integration:

- Section collapsing/expanding
- Entity search and selection
- Quick-create flows
- Back button navigation with filter preservation
- Confirmation dialogs

---

## Accessibility Checklist

All components must be keyboard-accessible:

- [ ] Focus visible on all interactive elements
- [ ] Tab order logical
- [ ] Enter/Space activate buttons
- [ ] Escape closes dialogs/dropdowns
- [ ] Arrow keys navigate lists (when appropriate)
- [ ] Screen reader announcements for state changes
- [ ] ARIA labels for icon-only buttons

**Reka UI handles most patterns automatically.** Verify in testing.

---

## Performance Considerations

### Virtualization

For long lists (50+ items), consider virtualization:

- Occurrence lists (component page)
- Search results (entity search)
- Grouping kanji lists

**Libraries:** Consider `vue-virtual-scroller` if performance degrades with large datasets.

### Debouncing

Auto-save fields use debounced updates:

```typescript
import { useDebounceFn } from '@vueuse/core'

const debouncedSave = useDebounceFn(async (value: string) => {
  await save(value)
}, 500)
```

**Apply to:**

- Notes textareas (500ms)
- Search inputs (300ms)
- Inline text fields (500ms)

---

## Quick Reference: Component Usage

| Feature                    | Component(s)                                   |
| -------------------------- | ---------------------------------------------- |
| Page section               | SharedSection                                  |
| Linked entity card         | SharedCardSubEntity                            |
| Search + create            | SharedEntitySearch + SharedQuickCreate[Entity] |
| Back navigation            | SharedBackButton                               |
| Destructive confirmation   | SharedConfirmDialog                            |
| Reading dropdown           | BaseCombobox with dynamic options              |
| Position dropdown          | BaseSelect with position_types                 |
| Radical toggle             | BaseSwitch or BaseCheckbox                     |
| Notes editing              | BaseInlineTextarea                             |
| Success/error notification | BaseToast (via useToast composable)            |

---

## Future Enhancements

### Drag and Drop

For reordering meanings, readings, forms:

- Use `@vueuse/core` `useSortable` or similar
- Visual drag handle (≡)
- Auto-save on drop

### Rich Text Editing

For notes with formatting:

- Consider lightweight Markdown editor
- Preview mode vs edit mode
- Keep plain text as fallback

### Keyboard Shortcuts

For power users:

- `Ctrl/Cmd + E` - Edit current section
- `Ctrl/Cmd + S` - Save
- `Esc` - Cancel edit
- `Ctrl/Cmd + K` - Open search

**Implementation:** Use `@vueuse/core` `useMagicKeys` or similar.
