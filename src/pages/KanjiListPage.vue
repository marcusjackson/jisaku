<script setup lang="ts">
/**
 * KanjiListPage
 *
 * Page wrapper for the kanji list route.
 * Applies theme, header, and layout wrapper.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import KanjiListRoot from '@/modules/kanji-list/components/KanjiListRoot.vue'

// Initialize theme on page load
useTheme()
</script>

<template>
  <div class="kanji-list-page">
    <SharedHeader />
    <main class="kanji-list-page-main">
      <KanjiListRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.kanji-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.kanji-list-page-main {
  flex: 1;
}
</style>
