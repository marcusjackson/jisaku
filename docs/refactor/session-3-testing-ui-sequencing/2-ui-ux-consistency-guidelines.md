# UI/UX Consistency Guidelines

**Summary:** This document establishes consistent interaction patterns, visual standards, and component behaviors across all modules to create a polished, predictable user experience.

---

## Table of Contents

1. [Interaction Patterns](#1-interaction-patterns) (Lines 20-80)
2. [Button Placement Standards](#2-button-placement-standards) (Lines 85-140)
3. [State Display Patterns](#3-state-display-patterns) (Lines 145-200)
4. [Form Patterns](#4-form-patterns) (Lines 205-250)
5. [Visual Polish Checklist](#5-visual-polish-checklist) (Lines 255-300)

---

## 1. Interaction Patterns

### View/Edit Mode Transitions

**Standard Pattern:**

- View mode is default
- "Edit" button enters edit mode
- "Cancel" discards changes, returns to view
- "Save" persists changes, returns to view
- Changes auto-save on blur for inline fields

**Consistent Button Labels:**
| Mode | Primary | Secondary |
|------|---------|-----------|
| View → Edit | "Edit" | — |
| Edit → View | "Save" | "Cancel" |
| Creating | "Create" / "Add" | "Cancel" |
| Deleting | "Delete" | "Cancel" |

### Section Edit Pattern

```vue
<template>
  <SharedSection :title="title">
    <template #actions>
      <!-- View mode: Edit button -->
      <BaseButton
        v-if="!isEditing"
        variant="secondary"
        size="sm"
        @click="startEditing"
      >
        Edit
      </BaseButton>

      <!-- Edit mode: Save/Cancel -->
      <template v-else>
        <BaseButton
          variant="ghost"
          size="sm"
          @click="cancelEditing"
        >
          Cancel
        </BaseButton>
        <BaseButton
          variant="primary"
          size="sm"
          @click="saveChanges"
        >
          Save
        </BaseButton>
      </template>
    </template>

    <ViewMode v-if="!isEditing" />
    <EditMode v-else />
  </SharedSection>
</template>
```

### Inline Edit Pattern

For simple text fields that can be edited in place:

```vue
<template>
  <div class="inline-editable">
    <span
      v-if="!isEditing"
      class="inline-editable-value"
      @click="startEditing"
    >
      {{ displayValue }}
      <span class="inline-editable-hint">Click to edit</span>
    </span>

    <input
      v-else
      v-model="localValue"
      @blur="handleBlur"
      @keydown.enter="handleBlur"
      @keydown.escape="cancelEditing"
    />
  </div>
</template>
```

### Destructive Mode Pattern

Dangerous actions (delete) are only visible when destructive mode is enabled:

```vue
<template>
  <SharedSection title="Actions">
    <div class="destructive-toggle">
      <BaseSwitch
        id="destructive-mode"
        v-model="isDestructiveMode"
      />
      <label for="destructive-mode">Enable destructive actions</label>
    </div>

    <BaseButton
      v-if="isDestructiveMode"
      variant="danger"
      @click="confirmDelete"
    >
      Delete
    </BaseButton>
  </SharedSection>
</template>
```

---

## 2. Button Placement Standards

### Section Action Buttons

```
┌─────────────────────────────────────────────────┐
│ Section Title                    [Edit] [+Add]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Content area                                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Title on left
- Action buttons on right
- Edit button always visible (if editable)
- Add button visible when appropriate

### Edit Mode Layout

```
┌─────────────────────────────────────────────────┐
│ Section Title                  [Cancel] [Save]  │
├─────────────────────────────────────────────────┤
│ [+ Add Item]                                    │
│                                                 │
│ Item 1                              [↑] [↓] [×] │
│ Item 2                              [↑] [↓] [×] │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Save/Cancel buttons replace Edit button
- Add button below section header
- Item actions (reorder, delete) on right of each item

### Dialog Button Placement

```
┌─────────────────────────────────────────────────┐
│ Dialog Title                              [×]   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Form content                                   │
│                                                 │
├─────────────────────────────────────────────────┤
│                          [Cancel]   [Save]      │
└─────────────────────────────────────────────────┘
```

- Cancel on left (or first)
- Primary action on right (last)
- Matches dialog footer standard

### Page-Level Actions

```
┌─────────────────────────────────────────────────┐
│ ← Back to List                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  Page content                                   │
│                                                 │
├─────────────────────────────────────────────────┤
│ ☐ Destructive mode            [Delete Entity]  │
└─────────────────────────────────────────────────┘
```

- Back link at top
- Destructive toggle at bottom
- Delete button only visible in destructive mode

---

## 3. State Display Patterns

### Loading States

```vue
<!-- Full page loading -->
<SharedPageContainer v-if="isLoading">
  <BaseSpinner size="lg" label="Loading..." />
</SharedPageContainer>

<!-- Section loading -->
<SharedSection title="Meanings">
  <div v-if="isLoadingMeanings" class="section-loading">
    <BaseSpinner size="sm" />
    <span>Loading meanings...</span>
  </div>
</SharedSection>

<!-- Inline loading (button) -->
<BaseButton :disabled="isSaving">
  <BaseSpinner v-if="isSaving" size="xs" />
  {{ isSaving ? 'Saving...' : 'Save' }}
</BaseButton>
```

### Empty States

```vue
<!-- List empty state -->
<div v-if="items.length === 0" class="empty-state">
  <p class="empty-state-message">No meanings added yet</p>
  <BaseButton variant="primary" @click="addFirst">
    Add First Meaning
  </BaseButton>
</div>

<!-- Search empty state -->
<div v-if="searchResults.length === 0" class="empty-state">
  <p class="empty-state-message">No results found for "{{ query }}"</p>
  <BaseButton variant="secondary" @click="clearSearch">
    Clear Search
  </BaseButton>
</div>
```

### Error States

```vue
<!-- Full page error -->
<SharedPageContainer v-if="error">
  <div class="error-state">
    <h2>Something went wrong</h2>
    <p>{{ error.message }}</p>
    <BaseButton @click="retry">Try Again</BaseButton>
  </div>
</SharedPageContainer>

<!-- Inline error -->
<BaseInput :error="errors.character" error-message="Character is required" />
```

---

## 4. Form Patterns

### Form Field Layout

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Required fields first -->
    <BaseInput
      v-model="values.character"
      label="Character"
      required
      :error="errors.character"
    />

    <!-- Optional fields with helpful labels -->
    <BaseInput
      v-model="values.shortMeaning"
      label="Short Meaning"
      placeholder="e.g., water, mountain"
    />

    <!-- Grouped related fields -->
    <fieldset>
      <legend>Classification</legend>
      <BaseSelect
        v-model="values.jlptLevel"
        label="JLPT Level"
      />
      <BaseSelect
        v-model="values.joyoLevel"
        label="Joyo Level"
      />
    </fieldset>

    <!-- Actions at bottom -->
    <div class="form-actions">
      <BaseButton
        type="button"
        variant="ghost"
        @click="cancel"
      >
        Cancel
      </BaseButton>
      <BaseButton
        type="submit"
        variant="primary"
        :disabled="!isValid"
      >
        Create
      </BaseButton>
    </div>
  </form>
</template>
```

### Inline Validation Feedback

```vue
<!-- Error shown below field -->
<div class="form-field">
  <BaseInput 
    v-model="value"
    :class="{ 'has-error': error }"
  />
  <span v-if="error" class="field-error">{{ error }}</span>
</div>
```

### Submission Feedback

```typescript
async function handleSubmit() {
  isSubmitting.value = true

  try {
    await saveEntity()
    success('Saved successfully')
    router.push('/list')
  } catch (err) {
    error(err.message)
    // Stay on form for correction
  } finally {
    isSubmitting.value = false
  }
}
```

---

## 5. Visual Polish Checklist

### Per Section

- [ ] Title uses correct heading level (h2 for sections)
- [ ] Edit button visible and properly positioned
- [ ] Empty state has helpful message and action
- [ ] Loading state shows spinner with label
- [ ] Error states are helpful and actionable

### Per List

- [ ] Items have consistent height
- [ ] Hover states on interactive items
- [ ] Reorder buttons properly disabled at edges
- [ ] Delete button only visible in destructive mode
- [ ] Smooth transitions on add/remove

### Per Form

- [ ] Required fields marked
- [ ] Placeholder text helpful
- [ ] Error messages below fields
- [ ] Submit button disabled while invalid
- [ ] Loading state during submission
- [ ] Success/error feedback via toast

### Per Page

- [ ] Back navigation visible
- [ ] Page title reflects content
- [ ] Sections in logical order
- [ ] Consistent spacing between sections
- [ ] Mobile-responsive layout

### Keyboard Accessibility

- [ ] Tab order follows visual order
- [ ] Focus visible on interactive elements
- [ ] Enter submits forms
- [ ] Escape closes dialogs
- [ ] Arrow keys for reordering (if applicable)

---

## Module-Specific Checklist

### Kanji Detail Page

- [ ] Header shows character prominently
- [ ] Basic info uses consistent field layout
- [ ] Readings section has view/edit toggle
- [ ] Meanings section supports grouping mode
- [ ] Components section has search/add
- [ ] Notes sections use inline textarea
- [ ] Delete at bottom in destructive mode

### Component Detail Page

- [ ] Header shows character
- [ ] Forms section has add/edit dialogs
- [ ] Groupings section supports drag/drop
- [ ] Kanji list shows linked kanji

### Settings Page

- [ ] Sections clearly separated
- [ ] CRUD operations have confirmation
- [ ] Dangerous actions require extra step
- [ ] Export/import have progress indicators

---

## Cross-References

- **Previous**: [1-e2e-test-reliability-improvements.md](./1-e2e-test-reliability-improvements.md)
- **Next**: [3-implementation-sequencing.md](./3-implementation-sequencing.md)
- **Related**: [Session 2: Section Decomposition Patterns](../session-2-components/3-section-decomposition-patterns.md)
