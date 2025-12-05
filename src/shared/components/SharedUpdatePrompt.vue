<script setup lang="ts">
/**
 * SharedUpdatePrompt
 *
 * A prompt banner that appears when a new version of the PWA is available.
 * Users can choose to update immediately or dismiss for later.
 * Positioned at the bottom of the viewport to avoid interrupting work.
 */

import BaseButton from '@/base/components/BaseButton.vue'

import { usePwa } from '@/shared/composables/use-pwa'

const { dismissUpdate, needsUpdate, updateServiceWorker } = usePwa()

async function handleUpdate(): Promise<void> {
  await updateServiceWorker()
}

function handleDismiss(): void {
  dismissUpdate()
}
</script>

<template>
  <Transition name="slide-up">
    <div
      v-if="needsUpdate"
      aria-live="polite"
      class="update-prompt"
      role="alert"
    >
      <div class="update-prompt-content">
        <div class="update-prompt-icon">
          <svg
            aria-hidden="true"
            fill="none"
            height="20"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            viewBox="0 0 24 24"
            width="20"
          >
            <path
              d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
            />
          </svg>
        </div>

        <div class="update-prompt-text">
          <p class="update-prompt-title">Update available</p>
          <p class="update-prompt-description">
            A new version of the app is ready. Refresh to get the latest
            features.
          </p>
        </div>
      </div>

      <div class="update-prompt-actions">
        <BaseButton
          size="sm"
          variant="ghost"
          @click="handleDismiss"
        >
          Later
        </BaseButton>
        <BaseButton
          size="sm"
          variant="primary"
          @click="handleUpdate"
        >
          Update now
        </BaseButton>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.update-prompt {
  position: fixed;
  right: var(--spacing-lg);
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  z-index: var(--z-toast);
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  max-width: 480px;
  margin-right: auto;
  margin-left: auto;
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-xl);
}

.update-prompt-content {
  display: flex;
  flex: 1;
  gap: var(--spacing-3);
  min-width: 200px;
}

.update-prompt-icon {
  flex-shrink: 0;
  color: var(--color-primary);
}

.update-prompt-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.update-prompt-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.update-prompt-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.update-prompt-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform var(--transition-normal),
    opacity var(--transition-normal);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
