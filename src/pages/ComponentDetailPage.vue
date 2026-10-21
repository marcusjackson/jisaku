<script setup lang="ts">
/**
 * ComponentDetailPage
 *
 * Page wrapper for the component detail route.
 * Applies theme, header, and layout wrapper.
 */

import { useRoute } from 'vue-router'

import { SharedHeader, SharedToast } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import ComponentDetailRoot from '@/modules/component-detail/components/ComponentDetailRoot.vue'

useTheme()

const route = useRoute()
</script>

<template>
  <div class="component-detail-page">
    <SharedHeader />
    <main class="component-detail-page-main">
      <!-- Keyed on the id: stepping between components starts a fresh page, so Destructive Mode
           and open dialogs never carry over (behavior.md: Destructive Mode starts off every time). -->
      <ComponentDetailRoot :key="String(route.params['id'])" />
    </main>
    <SharedToast />
  </div>
</template>

<style scoped>
.component-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.component-detail-page-main {
  flex: 1;
}
</style>
