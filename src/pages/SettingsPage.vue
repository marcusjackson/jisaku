<script setup lang="ts">
/**
 * SettingsPage
 *
 * Entry point for the Settings page.
 * Thin wrapper around SettingsRoot component.
 */

import { onMounted } from 'vue'

import { BaseToast } from '@/base/components'

import SharedHeader from '@/shared/components/SharedHeader.vue'
import { useTheme } from '@/shared/composables'

import { SettingsRoot } from '@/modules/settings'

// Initialize theme on page load
useTheme()

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<template>
  <div class="settings-page">
    <SharedHeader />
    <main class="settings-page__content">
      <SettingsRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.settings-page__content {
  flex: 1;
  padding: var(--spacing-md);
}

@media (width >= 768px) {
  .settings-page__content {
    padding: var(--spacing-lg);
  }
}
</style>
