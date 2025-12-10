<script setup lang="ts">
/**
 * BaseSwitch
 *
 * A toggle switch component built on Reka UI Switch primitives.
 * Supports v-model for on/off state and optional label.
 */

import { computed } from 'vue'

import { SwitchRoot, SwitchThumb } from 'reka-ui'

interface Props {
  /** Disable the switch */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Label text (alternative to slot) */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  error: '',
  label: ''
})

const checked = defineModel<boolean>({ default: false })

const hasError = computed(() => Boolean(props.error))
</script>

<template>
  <div class="base-switch">
    <div class="base-switch-wrapper">
      <SwitchRoot
        v-model="checked"
        v-bind="disabled ? { disabled: true } : {}"
        class="base-switch-root"
        :class="{
          'base-switch-root--checked': checked,
          'base-switch-root-error': hasError
        }"
      >
        <SwitchThumb class="base-switch-thumb" />
      </SwitchRoot>
      <label
        v-if="label || $slots['default']"
        class="base-switch-label"
      >
        <slot>{{ label }}</slot>
      </label>
    </div>
    <p
      v-if="hasError"
      class="base-switch-error-message"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.base-switch {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.base-switch-wrapper {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.base-switch-root {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background-color: var(--color-border-primary);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.base-switch-root:hover {
  background-color: var(--color-border-secondary);
}

.base-switch-root:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-switch-root[data-state='checked'] {
  background-color: var(--color-primary);
}

.base-switch-root[data-disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-switch-root-error {
  background-color: var(--color-error);
}

.base-switch-thumb {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 10px;
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-thumb);
  transition: transform var(--transition-fast);
  transform: translateX(2px);
}

.base-switch-root[data-state='checked'] .base-switch-thumb {
  transform: translateX(22px);
}

.base-switch-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  cursor: pointer;
  user-select: none;
}

.base-switch-root[data-disabled] ~ .base-switch-label {
  cursor: not-allowed;
}

.base-switch-error-message {
  margin: 0;
  padding-left: calc(44px + var(--spacing-2));
  color: var(--color-error);
  font-size: var(--font-size-sm);
}
</style>
