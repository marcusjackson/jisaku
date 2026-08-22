<script setup lang="ts">
/** KanjiDetailStrokeOrderDisplay - Displays stroke order images as thumbnails with lightbox */
import { computed, ref } from 'vue'

import { useBlobUrl } from '@/base/composables/use-blob-url'

import { SharedImageLightbox } from '@/shared/components'

const props = defineProps<{
  strokeDiagram: Uint8Array | null
  strokeGif: Uint8Array | null
}>()

const { url: diagramUrl } = useBlobUrl(() => props.strokeDiagram)
const { url: gifUrl } = useBlobUrl(() => props.strokeGif)
const isEmpty = computed(() => !props.strokeDiagram && !props.strokeGif)

const lightboxOpen = ref(false)
const lightboxSrc = ref('')
const lightboxAlt = ref('')

function openLightbox(src: string, alt: string): void {
  lightboxSrc.value = src
  lightboxAlt.value = alt
  lightboxOpen.value = true
}
</script>

<template>
  <div
    class="stroke-order-display"
    data-testid="stroke-order-display"
  >
    <p
      v-if="isEmpty"
      class="stroke-order-display-empty"
    >
      No stroke order images available
    </p>
    <div
      v-else
      class="stroke-order-display-grid"
    >
      <figure
        v-if="diagramUrl"
        class="stroke-order-display-figure"
      >
        <div class="stroke-order-display-image-wrapper">
          <!-- Raw <button>: image thumbnail trigger needs zero-padding layout incompatible with BaseButton -->
          <button
            aria-label="View stroke diagram"
            class="stroke-order-display-thumbnail-button"
            type="button"
            @click="openLightbox(diagramUrl, 'Stroke order diagram')"
          >
            <img
              alt="Stroke order diagram"
              class="stroke-order-display-thumbnail"
              :src="diagramUrl"
            />
          </button>
          <span
            aria-hidden="true"
            class="stroke-order-display-magnify"
            data-testid="magnify-icon"
            @click="openLightbox(diagramUrl, 'Stroke order diagram')"
            >🔍</span
          >
        </div>
        <figcaption class="stroke-order-display-caption">
          Stroke Diagram
        </figcaption>
      </figure>
      <figure
        v-if="gifUrl"
        class="stroke-order-display-figure"
      >
        <div class="stroke-order-display-image-wrapper">
          <button
            aria-label="View stroke animation"
            class="stroke-order-display-thumbnail-button"
            type="button"
            @click="openLightbox(gifUrl, 'Stroke order animation')"
          >
            <img
              alt="Stroke order animation"
              class="stroke-order-display-thumbnail"
              :src="gifUrl"
            />
          </button>
          <span
            aria-hidden="true"
            class="stroke-order-display-magnify"
            data-testid="magnify-icon"
            @click="openLightbox(gifUrl, 'Stroke order animation')"
            >🔍</span
          >
        </div>
        <figcaption class="stroke-order-display-caption">Animation</figcaption>
      </figure>
    </div>
    <SharedImageLightbox
      v-model:open="lightboxOpen"
      :alt="lightboxAlt"
      :src="lightboxSrc"
    />
  </div>
</template>

<style scoped>
.stroke-order-display {
  width: 100%;
  margin-top: var(
    --spacing-1
  ); /* Slight spacing between content start and header/edit button etc */
}

.stroke-order-display-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.stroke-order-display-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xl);
}

.stroke-order-display-figure {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 200px;
  max-width: 400px;
  margin: 0;
}

.stroke-order-display-image-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--spacing-sm);
}

.stroke-order-display-thumbnail-button {
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition:
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}

.stroke-order-display-thumbnail-button:hover {
  border-color: var(--color-border-focus);
}

.stroke-order-display-thumbnail-button:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.stroke-order-display-thumbnail {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-sm);
  object-fit: contain;
}

.stroke-order-display-magnify {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: color var(--transition-normal);
}

.stroke-order-display-image-wrapper:hover .stroke-order-display-magnify {
  color: var(--color-text-primary);
}

.stroke-order-display-caption {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
