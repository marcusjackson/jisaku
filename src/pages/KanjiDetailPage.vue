<script setup lang="ts">
/**
 * KanjiDetailPage
 *
 * Page wrapper for the kanji detail route.
 * Applies theme, header, and layout wrapper.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import KanjiDetailRoot from '@/modules/kanji-detail/components/KanjiDetailRoot.vue'

useTheme()
</script>

<template>
  <div class="kanji-detail-page">
    <SharedHeader />
    <main class="kanji-detail-page-main">
      <KanjiDetailRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.kanji-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.kanji-detail-page-main {
  flex: 1;
}
</style>
