<script setup lang="ts">
/**
 * SettingsSectionAppearance
 *
 * Section component for appearance settings.
 * Displays theme toggle and app version.
 */

import BaseSwitch from '@/base/components/BaseSwitch.vue'

import SharedSection from '@/shared/components/SharedSection.vue'

import { APP_VERSION } from '../utils/constants'

interface Props {
  theme: 'light' | 'dark'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'toggle-theme': []
}>()

function handleThemeToggle(isDark: boolean): void {
  // Only emit if the state would actually change
  if ((props.theme === 'dark') !== isDark) {
    emit('toggle-theme')
  }
}
</script>

<template>
  <SharedSection
    test-id="settings-appearance"
    title="Appearance"
  >
    <div class="appearance-section">
      <div class="option">
        <div class="option-info">
          <h3 class="option-title">Theme</h3>
          <p class="option-description">Switch between light and dark mode</p>
        </div>
        <BaseSwitch
          aria-label="Toggle dark mode"
          :model-value="theme === 'dark'"
          @update:model-value="handleThemeToggle"
        />
      </div>

      <div class="option">
        <div class="option-info">
          <h3 class="option-title">App Version</h3>
          <p class="option-description">{{ APP_VERSION }}</p>
        </div>
      </div>
    </div>
  </SharedSection>
</template>

<style scoped>
.appearance-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-title {
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.option-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  overflow-wrap: break-word;
}
</style>
