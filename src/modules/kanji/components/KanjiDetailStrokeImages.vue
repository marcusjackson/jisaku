<script setup lang="ts">
/**
 * KanjiDetailStrokeImages
 *
 * UI component displaying stroke diagram and animated GIF for a kanji.
 * Converts Uint8Array image data to displayable blob URLs.
 */

import { computed, onUnmounted, ref, watch } from 'vue'

interface Props {
  strokeDiagram?: Uint8Array | null
  strokeGif?: Uint8Array | null
}

const props = withDefaults(defineProps<Props>(), {
  strokeDiagram: null,
  strokeGif: null
})

// Store blob URLs for cleanup
const diagramUrl = ref<string | null>(null)
const gifUrl = ref<string | null>(null)

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
</script>

<template>
  <section
    v-if="hasImages"
    class="kanji-detail-stroke-images"
  >
    <h3 class="kanji-detail-stroke-images-title">Stroke Order</h3>

    <div class="kanji-detail-stroke-images-grid">
      <figure
        v-if="diagramUrl"
        class="kanji-detail-stroke-images-figure"
      >
        <img
          alt="Stroke order diagram"
          class="kanji-detail-stroke-images-img"
          :src="diagramUrl"
        />
        <figcaption class="kanji-detail-stroke-images-caption">
          Stroke Diagram
        </figcaption>
      </figure>

      <figure
        v-if="gifUrl"
        class="kanji-detail-stroke-images-figure"
      >
        <img
          alt="Stroke order animation"
          class="kanji-detail-stroke-images-img"
          :src="gifUrl"
        />
        <figcaption class="kanji-detail-stroke-images-caption">
          Animation
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.kanji-detail-stroke-images {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-stroke-images-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-stroke-images-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.kanji-detail-stroke-images-figure {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin: 0;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.kanji-detail-stroke-images-img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
}

.kanji-detail-stroke-images-caption {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
