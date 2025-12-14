<script setup lang="ts">
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import { useTheme } from '@/shared/composables/use-theme'

const { theme, toggleTheme } = useTheme()

// Get app version from package.json (injected by Vite)
// eslint-disable-next-line no-undef
const appVersion = `v${__APP_VERSION__}`

function handleThemeToggle(isDark: boolean): void {
  if ((theme.value === 'dark') !== isDark) {
    toggleTheme()
  }
}
</script>

<template>
  <div class="settings-section-appearance">
    <!-- Theme Toggle -->
    <div class="settings-section-appearance-option">
      <div class="settings-section-appearance-option-info">
        <h3 class="settings-section-appearance-option-title">Theme</h3>
        <p class="settings-section-appearance-option-description">
          Switch between light and dark mode
        </p>
      </div>
      <BaseSwitch
        aria-label="Toggle dark mode"
        :model-value="theme === 'dark'"
        @update:model-value="handleThemeToggle"
      />
    </div>

    <!-- App Version -->
    <div class="settings-section-appearance-option">
      <div class="settings-section-appearance-option-info">
        <h3 class="settings-section-appearance-option-title">Version</h3>
        <p class="settings-section-appearance-option-description">
          {{ appVersion }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-section-appearance {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.settings-section-appearance-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.settings-section-appearance-option-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.settings-section-appearance-option-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.settings-section-appearance-option-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Mobile: ensure switch doesn't shrink */
@media (width <= 640px) {
  .settings-section-appearance-option {
    gap: var(--spacing-sm);
  }
}
</style>
