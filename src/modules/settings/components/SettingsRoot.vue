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
import SharedSection from '@/shared/components/SharedSection.vue'
import { useDatabase } from '@/shared/composables/use-database'

import SettingsSectionAppearance from './SettingsSectionAppearance.vue'
import SettingsSectionDatabase from './SettingsSectionDatabase.vue'
import SettingsSectionDevTools from './SettingsSectionDevTools.vue'
import SettingsSectionPositionTypes from './SettingsSectionPositionTypes.vue'

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
      <!-- Appearance Section (non-collapsible, always visible) -->
      <SharedSection title="Appearance">
        <SettingsSectionAppearance />
      </SharedSection>

      <!-- Position Types Section (collapsible, collapsed by default) -->
      <SharedSection
        collapsible
        :default-open="false"
        title="Position Types"
      >
        <p class="settings-root-section-description">
          Manage position types used to classify where components appear in
          kanji (e.g., hen, tsukuri, kanmuri).
        </p>
        <SettingsSectionPositionTypes />
      </SharedSection>

      <!-- Data Management Section (collapsible) -->
      <SharedSection
        collapsible
        :default-open="false"
        title="Data Management"
      >
        <p class="settings-root-section-description">
          Export your data for backup or import a previously exported database.
        </p>
        <SettingsSectionDatabase />
      </SharedSection>

      <!-- Developer Tools Section (collapsible, dev-only) -->
      <SharedSection
        v-if="isDev"
        collapsible
        :default-open="false"
        title="Developer Tools"
      >
        <p class="settings-root-section-description">
          Tools for development and testing. Use with caution.
        </p>
        <SettingsSectionDevTools />
      </SharedSection>
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

.settings-root-section-description {
  margin: 0 0 var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
