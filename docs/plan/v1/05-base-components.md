# V1 Base Components

Reka UI integration audit and component status.

---

## Current Base Components

| Component          | Uses Reka UI | Status | Notes                           |
| ------------------ | ------------ | ------ | ------------------------------- |
| BaseButton         | No           | ✅     | Simple, no Reka needed          |
| BaseCheckbox       | Checkbox     | ✅     | Rewritten (T0.1)                |
| BaseCombobox       | Combobox     | ✅     | Enhanced with searchKeys (T1.6) |
| BaseComboboxMulti  | Combobox     | ✅     | Already using Reka              |
| BaseDialog         | Dialog       | ✅     | Already using Reka              |
| BaseFileInput      | No           | ✅     | Custom, no Reka equivalent      |
| BaseInlineTextarea | No           | ✅     | Custom contenteditable          |
| BaseInput          | No           | ✅     | Native input                    |
| BaseSelect         | Select       | ✅     | Already using Reka              |
| BaseSpinner        | No           | ✅     | CSS animation                   |
| BaseSwitch         | Switch       | ✅     | Created (T0.2)                  |
| BaseTextarea       | No           | ✅     | Native textarea                 |
| BaseToast          | Toast        | ✅     | Using ToastProvider             |

---

## Components Needed

### SharedSection

Wrapper for page sections with optional collapsible behavior.

**Props:**

- `title: string` - Section heading
- `collapsible?: boolean` - Enable collapse (default: false)
- `defaultOpen?: boolean` - Initial state when collapsible (default: true)

**Slots:**

- `default` - Section content
- `actions` - Right-side buttons (Edit, Add, etc.)

**Key features:**

- Uses Reka UI Collapsible when `collapsible=true`
- Collapse button at bottom of content when expanded (UX improvement)
- Non-collapsible sections render simpler structure

```vue
<!-- Usage -->
<SharedSection title="Basic Info">
  <KanjiBasicInfoContent />
  <template #actions>
    <BaseButton @click="edit">Edit</BaseButton>
  </template>
</SharedSection>

<SharedSection title="Occurrences" collapsible>
  <ComponentOccurrenceList />
</SharedSection>
```

### SharedEntityCard

Base card for displaying linked entities.

**Props:**

- `character: string`
- `shortMeaning?: string`
- `badges?: Array<{ text: string; variant?: 'default' | 'primary' | 'warning' }>`

**Events:**

- `view` - Navigate to entity
- `remove` - Remove link (edit mode only)

### SharedQuickCreate Components

- `SharedQuickCreateKanji.vue`
- `SharedQuickCreateComponent.vue`
- `SharedQuickCreateVocab.vue`

Minimal form dialogs. See `01-ui-patterns.md` for field specifications.

### SharedEntitySearch

Search + create pattern for linking entities.

**Props:**

- `entityType: 'kanji' | 'component' | 'vocab'`
- `excludeIds?: number[]` - Already linked, exclude from results

**Events:**

- `select` - Existing entity selected
- `create` - User wants to create new

---

## Combobox Search Enhancement

BaseCombobox now supports:

```vue
<BaseCombobox
  v-model="selected"
  :options="options"
  :search-keys="['character', 'shortMeaning']"
  :display-fn="formatOption"
  value-key="id"
/>
```

- `searchKeys`: Array of fields to search
- `displayFn`: Custom display formatting

---

## Collapsible Implementation Notes

### When to Use

Per `01-ui-patterns.md`, collapsible is reserved for:

- Occurrence lists (component page)
- Notes/analysis fields
- Meaning analysis within meanings

### Bottom Collapse Button

When expanded, show collapse trigger at bottom:

```vue
<CollapsibleContent>
  <slot />
  <button @click="isOpen = false" class="collapse-bottom">
    ▲ Collapse
  </button>
</CollapsibleContent>
```

This prevents scroll-back-up UX when content is long.

---

## Reka UI Reference

Docs at `docs/reference/reka-ui/` for: alert-dialog, checkbox, collapsible, combobox, dialog, dropdown-menu, pagination, popover, select, switch, tabs, toast, tooltip.
