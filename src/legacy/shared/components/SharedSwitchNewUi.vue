<script setup lang="ts">
/**
 * SharedSwitchNewUi
 *
 * Toggle switch for testing the new UI during refactoring.
 * Positioned in the header next to the settings icon.
 *
 * - OFF (gray) = Currently on legacy UI (/legacy/*)
 * - ON (colored) = On new UI
 *
 * This component will be removed once the refactoring is complete.
 */

import { computed } from 'vue'

import BaseSwitch from '@/legacy/base/components/BaseSwitch.vue'
import { useVersionToggle } from '@/shared/composables/use-version-toggle'

const { isLegacyMode, toggleVersion } = useVersionToggle()

/**
 * Computed state: OFF if on legacy, ON if on new UI
 */
const isNewUiMode = computed(() => !isLegacyMode.value)

/**
 * Handle toggle click
 */
async function handleToggle() {
  await toggleVersion()
}
</script>

<template>
  <div
    class="shared-switch-new-ui"
    title="Toggle between legacy and new UI"
  >
    <BaseSwitch
      :model-value="isNewUiMode"
      @click="handleToggle"
    >
      <span class="shared-switch-new-ui-label">New UI</span>
    </BaseSwitch>
  </div>
</template>

<style scoped>
.shared-switch-new-ui {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}

.shared-switch-new-ui-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/**
 * Mobile responsiveness:
 * On very small screens, hide the label to save space
 */
@media (width <= 400px) {
  .shared-switch-new-ui-label {
    display: none;
  }
}
</style>
