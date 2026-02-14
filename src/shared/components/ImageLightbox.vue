<script setup lang="ts">
/**
 * ImageLightbox
 *
 * Fullscreen overlay for viewing images with zoom and pan support.
 * Uses Reka UI Dialog primitives for accessibility.
 */

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle
} from 'reka-ui'

defineProps<{
  /** Whether lightbox is open */
  open: boolean
  /** Image source URL (blob URL or regular URL) */
  src: string
  /** Alt text for accessibility */
  alt: string
}>()

const emit = defineEmits<{
  /** Emitted when lightbox should close */
  'update:open': [value: boolean]
}>()

function handleOpenChange(value: boolean): void {
  emit('update:open', value)
}
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogPortal>
      <DialogOverlay class="lightbox-overlay" />

      <DialogContent
        aria-describedby="lightbox-description"
        class="lightbox-content"
      >
        <!-- Visually hidden title for screen readers -->
        <DialogTitle class="sr-only"> Image viewer </DialogTitle>

        <DialogDescription
          id="lightbox-description"
          class="sr-only"
        >
          {{ alt }}
        </DialogDescription>

        <!-- Image container with touch support -->
        <div
          class="lightbox-image-container"
          data-testid="lightbox-image-container"
        >
          <img
            :alt="alt"
            class="lightbox-image"
            :src="src"
          />
        </div>

        <!-- Close button -->
        <DialogClose
          aria-label="Close"
          class="lightbox-close"
        >
          <svg
            aria-hidden="true"
            fill="none"
            height="24"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.lightbox-overlay {
  position: fixed;
  z-index: var(--z-modal-backdrop);
  background-color: var(--color-overlay);
  animation: fade-in 0.15s ease-out;
  inset: 0;
}

.lightbox-content {
  position: fixed;
  z-index: var(--z-modal);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-md);
  inset: 0;
}

.lightbox-content:focus {
  outline: none;
}

.lightbox-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
  overflow: auto;

  /* Enable touch zoom and pan */
  touch-action: pinch-zoom pan-x pan-y;

  /* Allow scrolling within container */
  -webkit-overflow-scrolling: touch;
}

.lightbox-image {
  /* Allow natural size, but don't exceed viewport */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;

  /* Smooth rendering */
  image-rendering: auto;
}

.lightbox-close {
  position: fixed;
  top: var(--spacing-md);
  right: var(--spacing-md);
  z-index: var(--z-modal-close);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  opacity: 0.8;
  cursor: pointer;
  transition: opacity 0.2s;
}

.lightbox-close:hover {
  opacity: 1;
}

.lightbox-close:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Screen reader only class */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
