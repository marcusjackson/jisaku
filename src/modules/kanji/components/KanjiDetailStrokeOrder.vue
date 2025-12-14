<script setup lang="ts">
/**
 * KanjiDetailStrokeOrder
 *
 * Collapsible section displaying stroke order diagram and animated GIF.
 * Supports inline editing to upload/remove images.
 */

import { computed, onUnmounted, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseFileInput from '@/base/components/BaseFileInput.vue'

interface Props {
  strokeDiagram?: Uint8Array | null
  strokeGif?: Uint8Array | null
}

const props = withDefaults(defineProps<Props>(), {
  strokeDiagram: null,
  strokeGif: null
})

const emit = defineEmits<{
  updateDiagram: [value: Uint8Array | null]
  updateGif: [value: Uint8Array | null]
}>()

// Store blob URLs for cleanup
const diagramUrl = ref<string | null>(null)
const gifUrl = ref<string | null>(null)

// Edit mode state
const isEditing = ref(false)

// Convert Uint8Array to blob URL
function createBlobUrl(data: Uint8Array | null): string | null {
  if (!data || data.length === 0) return null

  // Try to detect image type from magic bytes
  let mimeType = 'image/png' // Default to PNG
  if (data[0] === 0xff && data[1] === 0xd8) {
    mimeType = 'image/jpeg'
  } else if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) {
    mimeType = 'image/gif'
  } else if (
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47
  ) {
    mimeType = 'image/png'
  }

  const blob = new Blob([new Uint8Array(data)], { type: mimeType })
  return URL.createObjectURL(blob)
}

// Revoke a blob URL to free memory
function revokeBlobUrl(url: string | null) {
  if (url) {
    URL.revokeObjectURL(url)
  }
}

// Update URLs when props change
watch(
  () => props.strokeDiagram,
  (newData) => {
    revokeBlobUrl(diagramUrl.value)
    diagramUrl.value = createBlobUrl(newData ?? null)
  },
  { immediate: true }
)

watch(
  () => props.strokeGif,
  (newData) => {
    revokeBlobUrl(gifUrl.value)
    gifUrl.value = createBlobUrl(newData ?? null)
  },
  { immediate: true }
)

// Computed to check if we have any images to show
const hasImages = computed(
  () => diagramUrl.value !== null || gifUrl.value !== null
)

// Cleanup blob URLs on unmount
onUnmounted(() => {
  revokeBlobUrl(diagramUrl.value)
  revokeBlobUrl(gifUrl.value)
})

function startEditing() {
  editDiagram.value = props.strokeDiagram ?? null
  editGif.value = props.strokeGif ?? null
  isEditing.value = true
}

function handleSave() {
  // Emit updates if changed
  if (editDiagram.value !== props.strokeDiagram) {
    emit('updateDiagram', editDiagram.value)
  }
  if (editGif.value !== props.strokeGif) {
    emit('updateGif', editGif.value)
  }
  isEditing.value = false
}

function handleCancel() {
  editDiagram.value = props.strokeDiagram ?? null
  editGif.value = props.strokeGif ?? null
  isEditing.value = false
}

// Local edit state for images
const editDiagram = ref<Uint8Array | null>(null)
const editGif = ref<Uint8Array | null>(null)
</script>

<template>
  <div class="kanji-detail-stroke-order">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div
        v-if="hasImages"
        class="kanji-detail-stroke-order-grid"
      >
        <figure
          v-if="diagramUrl"
          class="kanji-detail-stroke-order-figure"
        >
          <img
            alt="Stroke order diagram"
            class="kanji-detail-stroke-order-img"
            :src="diagramUrl"
          />
          <figcaption class="kanji-detail-stroke-order-caption">
            Stroke Diagram
          </figcaption>
        </figure>

        <figure
          v-if="gifUrl"
          class="kanji-detail-stroke-order-figure"
        >
          <img
            alt="Stroke order animation"
            class="kanji-detail-stroke-order-img"
            :src="gifUrl"
          />
          <figcaption class="kanji-detail-stroke-order-caption">
            Animation
          </figcaption>
        </figure>
      </div>

      <p
        v-else
        class="kanji-detail-stroke-order-empty"
      >
        No stroke order images added yet.
      </p>

      <div class="kanji-detail-stroke-order-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="startEditing"
        >
          Edit
        </BaseButton>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="kanji-detail-stroke-order-edit">
        <div class="kanji-detail-stroke-order-edit-field">
          <BaseFileInput
            v-model="editDiagram"
            accept="image/*"
            label="Stroke Diagram"
          />
        </div>

        <div class="kanji-detail-stroke-order-edit-field">
          <BaseFileInput
            v-model="editGif"
            accept="image/gif"
            label="Stroke Animation (GIF)"
          />
        </div>
      </div>

      <div class="kanji-detail-stroke-order-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kanji-detail-stroke-order {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-stroke-order-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.kanji-detail-stroke-order-figure {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin: 0;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.kanji-detail-stroke-order-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.kanji-detail-stroke-order-caption {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.kanji-detail-stroke-order-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-detail-stroke-order-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--color-border);
}

.kanji-detail-stroke-order-edit {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-detail-stroke-order-edit-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-stroke-order-edit-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-stroke-order-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.kanji-detail-stroke-order-preview-img {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
}
</style>
