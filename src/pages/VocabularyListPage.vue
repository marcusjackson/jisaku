<script setup lang="ts">
/**
 * VocabularyListPage
 *
 * Page wrapper for the vocabulary list route.
 * Applies theme, header, and layout wrapper.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import VocabListRoot from '@/modules/vocab-list/components/VocabListRoot.vue'

// Initialize theme on page load
useTheme()
</script>

<template>
  <div class="vocabulary-list-page">
    <SharedHeader />
    <main class="vocabulary-list-page-main">
      <VocabListRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.vocabulary-list-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.vocabulary-list-page-main {
  flex: 1;
}
</style>
