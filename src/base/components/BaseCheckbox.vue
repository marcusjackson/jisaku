<script setup lang="ts">
/**
 * BaseCheckbox
 *
 * A generic checkbox component with proper accessibility using Reka UI.
 * Supports v-model for checked state (boolean or 'indeterminate'), label slot.
 */

import { computed } from 'vue'

import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'

interface Props {
  /** Disable the checkbox */
  disabled?: boolean
  /** Error state */
  error?: string
  /** Label text (alternative to slot) */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: '',
  label: ''
})

const checked = defineModel<boolean | 'indeterminate'>({ default: false })

const hasError = computed(() => Boolean(props.error))
</script>

<template>
  <div class="base-checkbox">
    <div class="base-checkbox-wrapper">
      <CheckboxRoot
        v-model="checked"
        v-bind="props.disabled ? { disabled: true } : {}"
        class="base-checkbox-root"
        :class="{ 'base-checkbox-error': hasError }"
      >
        <CheckboxIndicator class="base-checkbox-indicator">
          <svg
            v-if="checked === true"
            aria-hidden="true"
            class="base-checkbox-icon"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <svg
            v-else-if="checked === 'indeterminate'"
            aria-hidden="true"
            class="base-checkbox-icon"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            viewBox="0 0 24 24"
          >
            <line
              x1="5"
              x2="19"
              y1="12"
              y2="12"
            />
          </svg>
        </CheckboxIndicator>
      </CheckboxRoot>
      <label
        v-if="label || $slots['default']"
        class="base-checkbox-label"
      >
        <slot>{{ label }}</slot>
      </label>
    </div>
    <p
      v-if="hasError"
      class="base-checkbox-error-message"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-checkbox {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.base-checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.base-checkbox-root {
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.base-checkbox-root:hover {
  border-color: var(--color-primary);
}

.base-checkbox-root:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-checkbox-root[data-state='checked'],
.base-checkbox-root[data-state='indeterminate'] {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
}

.base-checkbox-root[data-disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.base-checkbox-error {
  border-color: var(--color-error);
}

.base-checkbox-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-text-inverse);
}

.base-checkbox-icon {
  width: 14px;
  height: 14px;
}

.base-checkbox-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  cursor: pointer;
  user-select: none;
}

.base-checkbox-root[data-disabled] ~ .base-checkbox-label {
  cursor: not-allowed;
}

.base-checkbox-error-message {
  margin: 0;
  padding-left: calc(20px + var(--spacing-2));
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
