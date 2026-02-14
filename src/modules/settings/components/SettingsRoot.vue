<script setup lang="ts">
/**
 * SettingsRoot
 *
 * Root component for the Settings page.
 * Handles all data fetching and orchestrates section components.
 */

import { useDatabaseExport } from '@/shared/composables/use-database-export'
import { useSeedData } from '@/shared/composables/use-seed-data'
import { useTheme } from '@/shared/composables/use-theme'

import SettingsSectionAppearance from './SettingsSectionAppearance.vue'
import SettingsSectionClassificationTypes from './SettingsSectionClassificationTypes.vue'
import SettingsSectionDatabase from './SettingsSectionDatabase.vue'
import SettingsSectionDevTools from './SettingsSectionDevTools.vue'
import SettingsSectionPositionTypes from './SettingsSectionPositionTypes.vue'

const isDev = import.meta.env.DEV

// Composables for appearance
const { theme, toggleTheme } = useTheme()

// Composables for database
const {
  clearDatabase,
  exportDatabase,
  importDatabase,
  isClearing: isDatabaseClearing,
  isExporting,
  isImporting,
  validateDatabaseFile
} = useDatabaseExport()

// Composables for dev tools
const {
  clear: clearDevData,
  isClearing: isDevClearing,
  isSeeding,
  seed
} = useSeedData()

// Event handlers
function handleThemeToggle(): void {
  toggleTheme()
}

function handleExportDatabase(): void {
  exportDatabase()
}

async function handleImportDatabase(file: File): Promise<boolean> {
  return await importDatabase(file)
}

async function handleValidateDatabase(file: File): Promise<boolean> {
  return await validateDatabaseFile(file)
}

async function handleClearDatabase(): Promise<void> {
  await clearDatabase()
}

async function handleSeedData(): Promise<void> {
  await seed()
}

async function handleClearDevData(): Promise<void> {
  await clearDevData()
}
</script>

<template>
  <div class="settings-root">
    <h1 class="settings-root__title">Settings</h1>

    <SettingsSectionAppearance
      :theme="theme"
      @toggle-theme="handleThemeToggle"
    />

    <SettingsSectionPositionTypes />

    <SettingsSectionClassificationTypes />

    <SettingsSectionDatabase
      :is-clearing="isDatabaseClearing"
      :is-exporting="isExporting"
      :is-importing="isImporting"
      @clear-database="handleClearDatabase"
      @export-database="handleExportDatabase"
      @import-database="handleImportDatabase"
      @validate-database="handleValidateDatabase"
    />

    <SettingsSectionDevTools
      v-if="isDev"
      :is-clearing="isDevClearing"
      :is-seeding="isSeeding"
      @clear-data="handleClearDevData"
      @seed-data="handleSeedData"
    />
  </div>
</template>

<style scoped>
.settings-root {
  max-width: 800px;
  margin: 0 auto;
}

.settings-root__title {
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

/* Section spacing */
.settings-root > :deep(*:not(:last-child)) {
  margin-bottom: var(--spacing-md);
}

@media (width <= 767px) {
  .settings-root {
    max-width: 100%;
  }

  .settings-root__title {
    font-size: var(--font-size-xl);
  }
}
</style>
