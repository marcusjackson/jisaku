<script setup lang="ts">
/**
 * KanjiSectionStrokeOrder
 *
 * Section component for stroke order images.
 * Uses SharedSection with collapsible behavior and view/edit mode toggle.
 */

import { computed, ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import KanjiStrokeOrderDisplay from './KanjiStrokeOrderDisplay.vue'
import KanjiStrokeOrderEditMode from './KanjiStrokeOrderEditMode.vue'

const props = defineProps<{
  /** Stroke diagram image data */
  strokeDiagram: Uint8Array | null
  /** Stroke animation GIF data */
  strokeGif: Uint8Array | null
}>()

const emit = defineEmits<{
  /** Emitted when diagram is saved */
  'save:diagram': [value: Uint8Array | null]
  /** Emitted when animation is saved */
  'save:animation': [value: Uint8Array | null]
}>()

// Edit mode state
const isEditMode = ref(false)

// Default open if content exists
const hasContent = computed(
  () => Boolean(props.strokeDiagram) || Boolean(props.strokeGif)
)

function handleEdit(): void {
  isEditMode.value = true
}

function handleCancel(): void {
  isEditMode.value = false
}

function handleSave(
  diagram: Uint8Array | null,
  animation: Uint8Array | null
): void {
  emit('save:diagram', diagram)
  emit('save:animation', animation)
  isEditMode.value = false
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="hasContent"
    test-id="kanji-section-stroke-order"
    title="Stroke Order"
  >
    <template #actions="{ isOpen }">
      <BaseButton
        v-if="!isEditMode && isOpen"
        data-testid="stroke-order-edit-button"
        size="sm"
        variant="secondary"
        @click="handleEdit"
      >
        Edit
      </BaseButton>
    </template>

    <KanjiStrokeOrderDisplay
      v-if="!isEditMode"
      :stroke-diagram="strokeDiagram"
      :stroke-gif="strokeGif"
    />

    <KanjiStrokeOrderEditMode
      v-else
      :stroke-diagram="strokeDiagram"
      :stroke-gif="strokeGif"
      @cancel="handleCancel"
      @save="handleSave"
    />
  </SharedSection>
</template>
