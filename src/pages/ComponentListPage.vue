<script setup lang="ts">
/**
 * ComponentListPage
 *
 * Page wrapper for the component list route.
 * Applies theme, header, and layout wrapper.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import ComponentListRoot from '@/modules/component-list/components/ComponentListRoot.vue'

// Initialize theme on page load
useTheme()
</script>

<template>
  <div class="component-list-page">
    <SharedHeader />
    <main class="component-list-page-main">
      <ComponentListRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.component-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.component-list-page-main {
  flex: 1;
}
</style>
