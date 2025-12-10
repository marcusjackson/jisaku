<script setup lang="ts">
/**
 * BaseInlineTextarea
 *
 * Inline editable textarea with save/cancel controls.
 * Displays as plain text until clicked, then shows textarea with save/cancel buttons.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from './BaseButton.vue'
import BaseTextarea from './BaseTextarea.vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isEditing = ref(false)
const editValue = ref(props.modelValue)

// Sync editValue when modelValue changes from outside
watch(
  () => props.modelValue,
  (newValue) => {
    if (!isEditing.value) {
      editValue.value = newValue
    }
  }
)

const displayValue = computed(() => {
  if (props.modelValue) return props.modelValue
  if (props.placeholder) return props.placeholder
  return 'Click to add notes...'
})

const hasContent = computed(() => Boolean(props.modelValue))

function startEditing() {
  if (props.disabled) return
  editValue.value = props.modelValue
  isEditing.value = true
}

function handleSave() {
  emit('update:modelValue', editValue.value)
  isEditing.value = false
}

function handleCancel() {
  editValue.value = props.modelValue
  isEditing.value = false
}
</script>

<template>
  <div class="base-inline-textarea">
    <!-- Display mode -->
    <button
      v-if="!isEditing"
      class="base-inline-textarea-display"
      :class="{ 'has-content': hasContent, 'is-disabled': props.disabled }"
      :disabled="props.disabled"
      type="button"
      @click="startEditing"
    >
      {{ displayValue }}
    </button>

    <!-- Edit mode -->
    <div
      v-else
      class="base-inline-textarea-edit"
    >
      <BaseTextarea
        v-model="editValue"
        :placeholder="props.placeholder || ''"
        :rows="3"
      />
      <div class="base-inline-textarea-actions">
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
  </div>
</template>

<style scoped>
.base-inline-textarea {
  width: 100%;
}

.base-inline-textarea-display {
  display: block;
  width: 100%;
  padding: var(--spacing-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.base-inline-textarea-display:hover:not(.is-disabled) {
  border-color: var(--color-border-subtle);
  background-color: var(--color-bg-secondary);
}

.base-inline-textarea-display:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-inline-textarea-display.has-content {
  color: var(--color-text-primary);
}

.base-inline-textarea-display.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-inline-textarea-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.base-inline-textarea-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-2);
}
</style>
