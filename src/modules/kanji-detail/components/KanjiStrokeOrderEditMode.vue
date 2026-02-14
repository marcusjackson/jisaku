<script setup lang="ts">
/**
 * KanjiStrokeOrderEditMode
 *
 * Edit mode component for uploading stroke order images.
 * Provides file inputs for diagram and animation with save/cancel actions.
 */

import { ref, watch } from 'vue'

import { BaseButton, BaseFileInput } from '@/base/components'

const props = defineProps<{
  /** Initial diagram value for editing */
  strokeDiagram: Uint8Array | null
  /** Initial animation value for editing */
  strokeGif: Uint8Array | null
}>()

const emit = defineEmits<{
  /** Emitted when user saves changes */
  save: [diagram: Uint8Array | null, animation: Uint8Array | null]
  /** Emitted when user cancels editing */
  cancel: []
}>()

// Local edit state (separate from props)
const localDiagram = ref<Uint8Array | null>(props.strokeDiagram)
const localGif = ref<Uint8Array | null>(props.strokeGif)

// Reset local state when props change
watch(
  () => props.strokeDiagram,
  (newValue) => {
    localDiagram.value = newValue
  }
)

watch(
  () => props.strokeGif,
  (newValue) => {
    localGif.value = newValue
  }
)

function handleSave(): void {
  emit('save', localDiagram.value, localGif.value)
}

function handleCancel(): void {
  // Reset to original values
  localDiagram.value = props.strokeDiagram
  localGif.value = props.strokeGif
  emit('cancel')
}
</script>

<template>
  <div class="stroke-order-edit-mode">
    <div class="stroke-order-edit-mode-inputs">
      <BaseFileInput
        v-model="localDiagram"
        accept="image/*"
        label="Stroke Diagram"
      />

      <BaseFileInput
        v-model="localGif"
        accept="image/gif"
        label="Stroke Animation"
      />
    </div>

    <div class="stroke-order-edit-mode-actions">
      <BaseButton
        variant="secondary"
        @click="handleCancel"
      >
        Cancel
      </BaseButton>
      <BaseButton
        variant="primary"
        @click="handleSave"
      >
        Save
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.stroke-order-edit-mode {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.stroke-order-edit-mode-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.stroke-order-edit-mode-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
