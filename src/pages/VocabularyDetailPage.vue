<script setup lang="ts">
/**
 * VocabularyDetailPage
 *
 * Page wrapper for the vocabulary detail module.
 * Provides layout structure and manages theme.
 */

import { BaseToast } from '@/base/components'

import { SharedHeader } from '@/shared/components'
import { useTheme } from '@/shared/composables'

import { VocabDetailRoot } from '@/modules/vocab-detail'

useTheme()
</script>

<template>
  <div class="vocabulary-detail-page">
    <SharedHeader />
    <main class="vocabulary-detail-page-main">
      <VocabDetailRoot />
    </main>
    <BaseToast />
  </div>
</template>

<style scoped>
.vocabulary-detail-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.vocabulary-detail-page-main {
  flex: 1;
}
</style>
