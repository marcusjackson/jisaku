<script setup lang="ts">
/**
 * KanjiDetailNotesTextarea
 *
 * Inline editable textarea for notes fields.
 * Displays text in view mode, switches to editable textarea in edit mode.
 */

import { computed, onMounted, ref, watch } from 'vue'

import { BaseButton } from '@/base/components'

const props = defineProps<{
  /** Current saved value */
  modelValue: string | null
  /** Placeholder text for empty state */
  placeholder?: string
  /** Disable editing */
  disabled?: boolean
}>()

const emit = defineEmits<{
  /** Emitted when user saves changes */
  save: [value: string | null]
  /** Emitted for character count updates */
  'update:charCount': [count: number]
}>()

// Local state
const isEditing = ref(false)
const editValue = ref('')

// Character count
const charCount = computed(() => {
  if (isEditing.value) {
    return editValue.value.length
  }
  return props.modelValue?.length ?? 0
})

// Emit character count on mount and whenever it changes
watch(
  charCount,
  (count) => {
    emit('update:charCount', count)
  },
  { immediate: true }
)

// Also emit on mount to ensure initial count is sent
onMounted(() => {
  emit('update:charCount', charCount.value)
})

// Computed display text
const displayText = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }
  return props.placeholder ?? 'No notes'
})

const isPlaceholder = computed(() => !props.modelValue)

function enterEditMode(): void {
  if (props.disabled) return
  editValue.value = props.modelValue ?? ''
  isEditing.value = true
}

function handleSave(): void {
  const value = editValue.value.trim() || null
  emit('save', value)
  isEditing.value = false
}

function handleCancel(): void {
  editValue.value = props.modelValue ?? ''
  isEditing.value = false
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    handleCancel()
  }
}
</script>

<template>
  <!-- Display mode -->
  <div
    v-if="!isEditing"
    class="notes-textarea-display"
    :class="{
      'notes-textarea-placeholder': isPlaceholder,
      'notes-textarea-disabled': disabled
    }"
    data-testid="notes-display"
    @click="enterEditMode"
  >
    {{ displayText }}
  </div>

  <!-- Edit mode -->
  <div
    v-else
    class="notes-textarea-edit"
    data-testid="notes-edit"
  >
    <textarea
      v-model="editValue"
      class="notes-textarea-input"
      rows="4"
      @keydown="handleKeydown"
    />
    <div class="notes-textarea-actions">
      <BaseButton
        size="sm"
        variant="primary"
        @click="handleSave"
      >
        Save
      </BaseButton>
      <BaseButton
        size="sm"
        variant="secondary"
        @click="handleCancel"
      >
        Cancel
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.notes-textarea-display {
  min-height: var(--spacing-lg);
  padding: var(--spacing-sm);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  white-space: pre-wrap;
  overflow-wrap: break-word;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.notes-textarea-display:hover:not(.notes-textarea-disabled) {
  border-color: var(--color-border-hover);
}

.notes-textarea-placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.notes-textarea-disabled {
  opacity: 0.6;
  cursor: default;
}

.notes-textarea-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.notes-textarea-input {
  width: 100%;
  min-height: 100px;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  resize: vertical;
}

.notes-textarea-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

.notes-textarea-actions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
