<script setup lang="ts">
/**
 * SharedSection
 *
 * Generic section component with optional collapsible functionality.
 * Used throughout the app for organizing content into sections.
 *
 * Features:
 * - Optional title and actions slot
 * - Collapsible mode using Reka UI
 * - Bottom collapse button when expanded (for long content)
 */

import { ref } from 'vue'

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger
} from 'reka-ui'

import BaseButton from '@/base/components/BaseButton.vue'

const props = defineProps<{
  /** Section title */
  title?: string
  /** Enable collapsible functionality */
  collapsible?: boolean
  /** Default open state (only applies when collapsible=true) */
  defaultOpen?: boolean
}>()

// Use model for controlling open state - defaults to true unless explicitly false
const isOpen = ref(true)

// If defaultOpen is explicitly false, set to false
if (!props.defaultOpen) {
  isOpen.value = false
}
</script>

<template>
  <!-- Non-collapsible section -->
  <section
    v-if="!collapsible"
    class="shared-section"
  >
    <div
      v-if="title || $slots['actions']"
      class="shared-section-header"
    >
      <h2
        v-if="title"
        class="shared-section-title"
      >
        {{ title }}
      </h2>
      <div
        v-if="$slots['actions']"
        class="shared-section-actions"
      >
        <slot name="actions" />
      </div>
    </div>

    <div class="shared-section-content">
      <slot />
    </div>
  </section>

  <!-- Collapsible section -->
  <CollapsibleRoot
    v-else
    v-model:open="isOpen"
    class="shared-section shared-section-collapsible"
  >
    <div class="shared-section-header">
      <CollapsibleTrigger class="shared-section-trigger">
        <h2
          v-if="title"
          class="shared-section-title"
        >
          <span class="shared-section-trigger-icon-wrapper">
            <span class="shared-section-trigger-icon">▶</span>
          </span>
          {{ title }}
        </h2>
      </CollapsibleTrigger>

      <div
        v-if="$slots['actions']"
        class="shared-section-actions"
      >
        <slot name="actions" />
      </div>
    </div>

    <CollapsibleContent class="shared-section-collapsible-content">
      <div class="shared-section-content">
        <slot />
      </div>

      <!-- Bottom collapse button for long content -->
      <div class="shared-section-bottom-action">
        <CollapsibleTrigger as-child>
          <BaseButton
            size="sm"
            variant="secondary"
          >
            Collapse
          </BaseButton>
        </CollapsibleTrigger>
      </div>
    </CollapsibleContent>
  </CollapsibleRoot>
</template>

<style scoped>
.shared-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.shared-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.shared-section-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.shared-section-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.shared-section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* Collapsible-specific styles */
.shared-section-collapsible {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

.shared-section-trigger {
  display: flex;
  flex-grow: 1;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.shared-section-trigger:hover {
  color: var(--color-primary);
}

.shared-section-trigger:focus-visible {
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
  outline: none;
}

.shared-section-trigger-icon-wrapper {
  display: inline-flex;
  transition: transform var(--transition-fast);
}

.shared-section-trigger-icon {
  display: inline-block;
  font-size: var(--font-size-sm);
}

/* Rotate icon when open */
[data-state='open'] .shared-section-trigger-icon-wrapper {
  transform: rotate(90deg);
}

.shared-section-collapsible-content {
  overflow: hidden;
}

/* Animation for collapsible content */
.shared-section-collapsible-content[data-state='open'] {
  animation: slide-down 300ms ease-out;
}

.shared-section-collapsible-content[data-state='closed'] {
  animation: slide-up 300ms ease-out;
}

@keyframes slide-down {
  from {
    height: 0;
  }

  to {
    height: var(--reka-collapsible-content-height);
  }
}

@keyframes slide-up {
  from {
    height: var(--reka-collapsible-content-height);
  }

  to {
    height: 0;
  }
}

.shared-section-bottom-action {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
