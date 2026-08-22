<script setup lang="ts">
/**
 * SettingsPage
 *
 * Entry point for the Settings page.
 * Thin wrapper around SettingsRoot component.
 */

import SharedHeader from '@/shared/components/SharedHeader.vue'
import SharedToast from '@/shared/components/SharedToast.vue'
import { useTheme } from '@/shared/composables'

import { SettingsRoot } from '@/modules/settings'

// Initialize theme on page load
useTheme()
</script>

<template>
  <div class="settings-page">
    <SharedHeader />
    <main class="settings-page-content">
      <SettingsRoot />
    </main>
    <SharedToast />
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.settings-page-content {
  flex: 1;
  padding: var(--spacing-md);
}

@media (width >= 768px) {
  .settings-page-content {
    padding: var(--spacing-lg);
  }
}
</style>
