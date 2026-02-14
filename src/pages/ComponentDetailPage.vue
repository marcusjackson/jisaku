<script setup lang="ts">
/**
 * ComponentDetailPage
 *
 * Page wrapper for the component detail route.
 * Applies theme, header, and layout wrapper.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import ComponentDetailRoot from '@/modules/component-detail/components/ComponentDetailRoot.vue'

useTheme()
</script>

<template>
  <div class="component-detail-page">
    <SharedHeader />
    <main class="component-detail-page-main">
      <ComponentDetailRoot />
    </main>
    <BaseToast />
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
