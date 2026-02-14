<script setup lang="ts">
/**
 * SharedSection
 *
 * Generic section component with title, actions slot, and optional collapsible.
 * Used throughout the app for organizing content into sections.
 */

import { computed, ref, watch } from 'vue'

import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger
} from 'reka-ui'

import { BaseButton } from '@/base/components'

const props = defineProps<{
  /** Section title */
  title?: string
  /** Enable collapsible functionality - defaults to false */
  collapsible?: boolean
  /** Default open state (only applies when collapsible=true) - defaults to true */
  defaultOpen?: boolean
  /** Test ID for E2E testing */
  testId?: string
}>()

// Default values for optional boolean props
const isCollapsible = computed(() => props.collapsible)

// Compute the initial open value:
// - Default to open (true) unless defaultOpen is explicitly set to false
const initialOpen = props.defaultOpen
const isOpen = ref(initialOpen)

// Sync with defaultOpen prop changes
watch(
  () => props.defaultOpen,
  (val) => {
    isOpen.value = !val ? false : true
  }
)
</script>

<template>
  <!-- Non-collapsible section -->
  <section
    v-if="!isCollapsible"
    class="shared-section"
    :data-testid="testId"
  >
    <div
      v-if="title || $slots['actions'] || $slots['header-extra']"
      class="shared-section-header"
    >
      <div class="shared-section-title-row">
        <h2
          v-if="title"
          class="shared-section-title"
        >
          {{ title }}
        </h2>
        <slot name="header-extra" />
      </div>
      <div
        v-if="$slots['actions']"
        class="shared-section-actions"
      >
        <slot
          :is-open="true"
          name="actions"
        />
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
    :data-testid="testId"
    :unmount-on-hide="false"
  >
    <div class="shared-section-header">
      <CollapsibleTrigger class="shared-section-trigger">
        <h2
          v-if="title"
          class="shared-section-title"
        >
          <span class="shared-section-trigger-icon">▶</span>
          {{ title }}
        </h2>
        <slot name="header-extra" />
      </CollapsibleTrigger>

      <div
        v-if="$slots['actions']"
        class="shared-section-actions"
      >
        <slot
          :is-open="isOpen"
          name="actions"
        />
      </div>
    </div>

    <CollapsibleContent class="shared-section-collapsible-content">
      <div class="shared-section-content">
        <slot />
      </div>

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

.shared-section-title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
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
  gap: unset;
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

.shared-section-trigger-icon {
  display: inline-block;
  font-size: var(--font-size-sm);
  transition: transform var(--transition-fast);
}

[data-state='open'] .shared-section-trigger-icon {
  transform: rotate(90deg);
}

.shared-section-collapsible-content {
  overflow: hidden;
}

.shared-section-collapsible-content[data-state='open'] {
  animation: slide-down 200ms ease-out;
}

.shared-section-collapsible-content[data-state='closed'] {
  animation: slide-up 200ms ease-out;
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
