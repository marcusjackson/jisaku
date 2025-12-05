<script setup lang="ts">
/**
 * SettingsRoot
 *
 * Root component for the settings page.
 * Handles database initialization and orchestrates settings sections.
 */

import { onMounted } from 'vue'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'

import SettingsSectionDatabase from './SettingsSectionDatabase.vue'
import SettingsSectionDevTools from './SettingsSectionDevTools.vue'

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Show dev tools only in development mode
const isDev = import.meta.env.DEV

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
  } catch {
    // Error is already captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="settings-root-loading"
  >
    <BaseSpinner
      label="Loading..."
      size="lg"
    />
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError"
    class="settings-root-error"
  >
    <p class="settings-root-error-title">Failed to load</p>
    <p class="settings-root-error-message">
      {{ initError.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <div
    v-else-if="isInitialized"
    class="settings-root"
  >
    <header class="settings-root-header">
      <h1 class="settings-root-title">Settings</h1>
    </header>

    <div class="settings-root-content">
      <SettingsSectionDatabase />
      <SettingsSectionDevTools v-if="isDev" />
    </div>
  </div>
</template>

<style scoped>
.settings-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.settings-root-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.settings-root-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.settings-root-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.settings-root-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.settings-root-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-root-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.settings-root-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}
</style>
