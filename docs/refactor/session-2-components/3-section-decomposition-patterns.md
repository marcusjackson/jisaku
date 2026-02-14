# Section Decomposition Patterns

**Summary:** This document provides concrete patterns for breaking down monolithic Section components into proper hierarchies. Includes detailed code examples for the most complex sections.

---

## Table of Contents

1. [Section Component Responsibilities](#1-section-component-responsibilities) (Lines 20-60)
2. [Inline Editing Pattern](#2-inline-editing-pattern) (Lines 65-130)
3. [List Section Pattern](#3-list-section-pattern) (Lines 135-200)
4. [Complex Section Example: Meanings](#4-complex-section-example-meanings) (Lines 205-290)
5. [Data Flow Patterns](#5-data-flow-patterns) (Lines 295-350)

---

## 1. Section Component Responsibilities

### What a Section Should Do

1. **Orchestrate UI components** — Coordinate view/edit modes
2. **Handle section-level state** — isEditing, isExpanded
3. **Provide section layout** — Using SharedSection
4. **Emit events to parent** — No direct API calls

### What a Section Should NOT Do

1. ❌ Make API calls directly
2. ❌ Manage complex nested state
3. ❌ Contain 400+ lines
4. ❌ Have 10+ handler methods inline
5. ❌ Define dialogs inline (extract them)

### Section Template

```vue
<!-- [Module]Section[Feature].vue -->
<script setup lang="ts">
import { ref } from 'vue'
import SharedSection from '@/shared/components/SharedSection.vue'

// Props: Data from parent
const props = defineProps<{
  entity: Entity
  items: Item[]
  isDestructiveMode?: boolean
}>()

// Emits: Actions to parent
const emit = defineEmits<{
  add: [data: CreateInput]
  update: [id: number, data: UpdateInput]
  remove: [id: number]
}>()

// Local state: Section-specific only
const isEditing = ref(false)
</script>

<template>
  <SharedSection title="Feature Name">
    <template #actions>
      <BaseButton @click="isEditing = !isEditing">
        {{ isEditing ? 'Done' : 'Edit' }}
      </BaseButton>
    </template>

    <FeatureViewMode
      v-if="!isEditing"
      :items="items"
    />
    <FeatureEditMode
      v-else
      :items="items"
      @add="emit('add', $event)"
      @update="(id, data) => emit('update', id, data)"
      @remove="emit('remove', $event)"
    />
  </SharedSection>
</template>
```

---

## 2. Inline Editing Pattern

### Single-Field Inline Edit

For simple fields that can be edited in place:

```vue
<!-- KanjiBasicInfoField.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInlineTextarea from '@/base/components/BaseInlineTextarea.vue'

const props = defineProps<{
  value: string | null
  label: string
}>()

const emit = defineEmits<{
  save: [value: string | null]
}>()

const localValue = ref(props.value)

watch(
  () => props.value,
  (newVal) => {
    localValue.value = newVal
  }
)

function handleSave() {
  emit('save', localValue.value || null)
}
</script>

<template>
  <div class="basic-info-field">
    <label>{{ label }}</label>
    <BaseInlineTextarea
      v-model="localValue"
      @blur="handleSave"
    />
  </div>
</template>
```

### Section with Multiple Inline Fields

```vue
<!-- KanjiSectionBasicInfo.vue -->
<script setup lang="ts">
import KanjiBasicInfoField from './KanjiBasicInfoField.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'

const props = defineProps<{
  kanji: Kanji
}>()

const emit = defineEmits<{
  updateField: [field: string, value: unknown]
}>()

const jlptOptions = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' }
  // ...
]
</script>

<template>
  <SharedSection title="Basic Information">
    <div class="basic-info-grid">
      <KanjiBasicInfoField
        label="Stroke Count"
        :value="String(kanji.strokeCount ?? '')"
        @save="emit('updateField', 'strokeCount', Number($event))"
      />

      <div class="basic-info-field">
        <label>JLPT Level</label>
        <BaseSelect
          :model-value="kanji.jlptLevel"
          :options="jlptOptions"
          @update:model-value="emit('updateField', 'jlptLevel', $event)"
        />
      </div>
    </div>
  </SharedSection>
</template>
```

---

## 3. List Section Pattern

### Basic List Section

For sections displaying lists of items:

```vue
<!-- KanjiSectionClassifications.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import KanjiClassificationItem from './KanjiClassificationItem.vue'
import KanjiClassificationAddDialog from './KanjiClassificationAddDialog.vue'

const props = defineProps<{
  classifications: KanjiClassificationWithType[]
  availableTypes: ClassificationType[]
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  add: [typeId: number]
  remove: [id: number]
  reorder: [ids: number[]]
}>()

const showAddDialog = ref(false)

function handleMoveUp(index: number) {
  if (index === 0) return
  const newOrder = [...props.classifications.map((c) => c.id)]
  ;[newOrder[index], newOrder[index - 1]] = [
    newOrder[index - 1],
    newOrder[index]
  ]
  emit('reorder', newOrder)
}

function handleMoveDown(index: number) {
  if (index === props.classifications.length - 1) return
  const newOrder = [...props.classifications.map((c) => c.id)]
  ;[newOrder[index], newOrder[index + 1]] = [
    newOrder[index + 1],
    newOrder[index]
  ]
  emit('reorder', newOrder)
}
</script>

<template>
  <SharedSection title="Classifications">
    <template #actions>
      <BaseButton @click="showAddDialog = true">Add</BaseButton>
    </template>

    <ul class="classification-list">
      <KanjiClassificationItem
        v-for="(classification, index) in classifications"
        :key="classification.id"
        :classification="classification"
        :can-move-up="index > 0"
        :can-move-down="index < classifications.length - 1"
        :show-delete="isDestructiveMode"
        @move-up="handleMoveUp(index)"
        @move-down="handleMoveDown(index)"
        @delete="emit('remove', classification.id)"
      />
    </ul>

    <KanjiClassificationAddDialog
      v-model:open="showAddDialog"
      :available-types="availableTypes"
      @select="emit('add', $event)"
    />
  </SharedSection>
</template>
```

### List Item Component

```vue
<!-- KanjiClassificationItem.vue -->
<script setup lang="ts">
defineProps<{
  classification: KanjiClassificationWithType
  canMoveUp: boolean
  canMoveDown: boolean
  showDelete?: boolean
}>()

defineEmits<{
  moveUp: []
  moveDown: []
  delete: []
}>()
</script>

<template>
  <li class="classification-item">
    <span class="classification-name">{{ classification.nameJapanese }}</span>
    <span class="classification-english">{{ classification.nameEnglish }}</span>

    <div class="classification-actions">
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="!canMoveUp"
        @click="$emit('moveUp')"
      >
        ↑
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="!canMoveDown"
        @click="$emit('moveDown')"
      >
        ↓
      </BaseButton>
      <BaseButton
        v-if="showDelete"
        variant="danger"
        size="sm"
        @click="$emit('delete')"
      >
        Delete
      </BaseButton>
    </div>
  </li>
</template>
```

---

## 4. Complex Section Example: Meanings

### Current Problem

`KanjiDetailMeanings.vue` is 1195 lines because it handles:

- View mode (ungrouped)
- View mode (grouped by reading)
- Edit mode for meanings
- Edit mode for reading groups
- Group member management
- Multiple dialogs

### Proposed Decomposition

```
KanjiSectionMeanings.vue (~180 lines)
├── KanjiMeaningsViewMode.vue (~150 lines)
│   └── KanjiMeaningViewItem.vue (~60 lines)
│
├── KanjiMeaningsEditMode.vue (~200 lines)
│   ├── KanjiMeaningEditItem.vue (~80 lines)
│   └── KanjiMeaningAddDialog.vue (~80 lines)
│
└── KanjiMeaningsGroupMode.vue (~200 lines)
    ├── KanjiReadingGroupItem.vue (~100 lines)
    └── KanjiGroupMemberList.vue (~80 lines)
```

### Section Orchestrator

```vue
<!-- KanjiSectionMeanings.vue (~180 lines) -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  meanings: KanjiMeaning[]
  readingGroups: KanjiMeaningReadingGroup[]
  groupMembers: KanjiMeaningGroupMember[]
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  // Meaning events
  addMeaning: [text: string, info: string | null]
  updateMeaning: [id: number, text: string, info: string | null]
  removeMeaning: [id: number]
  reorderMeanings: [ids: number[]]
  // Group events
  enableGrouping: []
  disableGrouping: []
  addGroup: []
  updateGroup: [id: number, text: string]
  removeGroup: [id: number]
  // Member events
  assignToGroup: [meaningId: number, groupId: number]
  removeFromGroup: [meaningId: number, groupId: number]
}>()

const isEditing = ref(false)
const isGroupingEnabled = computed(() => props.readingGroups.length > 0)
</script>

<template>
  <SharedSection title="Meanings">
    <template #actions>
      <BaseButton
        v-if="!isEditing"
        @click="isEditing = true"
      >
        Edit
      </BaseButton>
      <BaseButton
        v-else
        @click="isEditing = false"
      >
        Done
      </BaseButton>
    </template>

    <!-- View Mode -->
    <KanjiMeaningsViewMode
      v-if="!isEditing"
      :meanings="meanings"
      :reading-groups="readingGroups"
      :group-members="groupMembers"
    />

    <!-- Edit Mode (ungrouped) -->
    <KanjiMeaningsEditMode
      v-else-if="!isGroupingEnabled"
      :meanings="meanings"
      :is-destructive-mode="isDestructiveMode"
      @add="(text, info) => emit('addMeaning', text, info)"
      @update="(id, text, info) => emit('updateMeaning', id, text, info)"
      @remove="emit('removeMeaning', $event)"
      @reorder="emit('reorderMeanings', $event)"
      @enable-grouping="emit('enableGrouping')"
    />

    <!-- Edit Mode (grouped) -->
    <KanjiMeaningsGroupMode
      v-else
      :meanings="meanings"
      :reading-groups="readingGroups"
      :group-members="groupMembers"
      :is-destructive-mode="isDestructiveMode"
      @disable-grouping="emit('disableGrouping')"
      @add-group="emit('addGroup')"
      @update-group="(id, text) => emit('updateGroup', id, text)"
      @remove-group="emit('removeGroup', $event)"
      @assign-to-group="(m, g) => emit('assignToGroup', m, g)"
      @remove-from-group="(m, g) => emit('removeFromGroup', m, g)"
    />
  </SharedSection>
</template>
```

---

## 5. Data Flow Patterns

### Props Down, Events Up

```
Root (state + handlers)
  │
  ├──props──▶ Section (orchestration)
  │              │
  │              ├──props──▶ ViewMode (display)
  │              │
  │              └──props──▶ EditMode (input)
  │                             │
  ◀──events──────────────────────┘
```

### Event Forwarding Strategy

**Option A: Direct forwarding (simple)**

```vue
<!-- Section forwards directly -->
<EditMode @add="$emit('add', $event)" />
```

**Option B: Handler method (when processing needed)**

```vue
<script setup>
function handleAdd(data) {
  // Process or validate
  emit('add', data)
}
</script>
<EditMode @add="handleAdd" />
```

### Avoiding Prop Drilling

For deeply nested data, use provide/inject sparingly:

```typescript
// In Root
provide('destructiveMode', readonly(isDestructiveMode))

// In deeply nested UI component
const isDestructiveMode = inject('destructiveMode', false)
```

Use only for truly cross-cutting concerns (theme, destructive mode).

---

## Cross-References

- **Previous**: [2-file-size-refactoring-strategy.md](./2-file-size-refactoring-strategy.md)
- **Next**: [4-composable-restructuring-guidelines.md](./4-composable-restructuring-guidelines.md)
- **Related**: [Session 1: Current Architecture Assessment](../session-1-architecture/1-current-architecture-assessment.md)
