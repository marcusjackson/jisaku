<script setup lang="ts">
/**
 * ComponentDetailDescriptionTextarea
 *
 * Inline editable textarea with save-on-blur behavior.
 * Used for the component description field.
 */

import { computed, ref } from 'vue'

const props = defineProps<{
  /** Current saved value */
  modelValue: string | null
  /** Placeholder text for empty state */
  placeholder?: string
}>()

const emit = defineEmits<{
  /** Emitted when user saves changes (on blur) */
  save: [value: string | null]
}>()

// Local state
const isEditing = ref(false)
const editValue = ref('')

// Computed display text
const displayText = computed(() => {
  if (props.modelValue) {
    return props.modelValue
  }
  return props.placeholder ?? 'No description'
})

const isPlaceholder = computed(() => !props.modelValue)

function enterEditMode(): void {
  editValue.value = props.modelValue ?? ''
  isEditing.value = true
}

function handleBlur(): void {
  const trimmed = editValue.value.trim()
  const value = trimmed || null
  emit('save', value)
  isEditing.value = false
}

function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    // Cancel without saving
    isEditing.value = false
  }
}
</script>

<template>
  <!-- Display mode -->
  <div
    v-if="!isEditing"
    class="description-textarea-display"
    :class="{
      'description-textarea-placeholder': isPlaceholder
    }"
    data-testid="description-textarea"
    @click="enterEditMode"
  >
    {{ displayText }}
  </div>

  <!-- Edit mode -->
  <div
    v-else
    class="description-textarea-edit"
  >
    <textarea
      v-model="editValue"
      class="description-textarea-input"
      rows="4"
      @blur="handleBlur"
      @keydown="handleKeydown"
    />
  </div>
</template>

<style scoped>
.description-textarea-display {
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

.description-textarea-display:hover {
  border-color: var(--color-border-hover);
}

.description-textarea-placeholder {
  color: var(--color-text-muted);
  font-style: italic;
}

.description-textarea-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.description-textarea-input {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: inherit;
  line-height: 1.5;
  resize: vertical;
}

.description-textarea-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}
</style>
