<script setup lang="ts">
/**
 * VocabDetailRoot
 *
 * Root component for vocabulary detail page. Orchestrates data fetching
 * and coordinates section components.
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { BaseSpinner } from '@/base/components'

import { useVocabDetailData } from '../composables/use-vocab-detail-data'
import { useVocabDetailKanjiBreakdownHandlers } from '../composables/use-vocab-detail-kanji-breakdown-handlers'
import { useVocabDetailRootHandlers } from '../composables/use-vocab-detail-root-handlers'

import VocabDetailSectionActions from './VocabDetailSectionActions.vue'
import VocabDetailSectionBasicInfo from './VocabDetailSectionBasicInfo.vue'
import VocabDetailSectionHeadline from './VocabDetailSectionHeadline.vue'
import VocabDetailSectionKanjiBreakdown from './VocabDetailSectionKanjiBreakdown.vue'

const { allKanji, isLoading, kanjiBreakdown, loadError, vocab, vocabId } =
  useVocabDetailData()

const isDestructiveMode = ref(false)
const isDeleting = ref(false)
const router = useRouter()

const {
  handleAdd,
  handleCreate,
  handleRemove,
  handleReorder,
  handleUpdateNotes
} = useVocabDetailKanjiBreakdownHandlers({
  vocabId,
  kanjiBreakdown,
  allKanji
})

const { handleBasicInfoSave, handleDelete, handleHeadlineSave } =
  useVocabDetailRootHandlers({ vocab, isDeleting, router })
</script>

<template>
  <div class="vocab-detail-root">
    <div class="vocab-detail-root-container">
      <div v-if="isLoading" class="vocab-detail-root-loading">
        <BaseSpinner size="lg" />
      </div>

      <div v-else-if="loadError" class="vocab-detail-root-error" role="alert">
        <p>{{ loadError }}</p>
      </div>

      <template v-else-if="vocab">
        <VocabDetailSectionHeadline :save="handleHeadlineSave" :vocab="vocab" />

        <VocabDetailSectionBasicInfo :save="handleBasicInfoSave" :vocab="vocab" />

        <VocabDetailSectionKanjiBreakdown
          :add="handleAdd"
          :all-kanji="allKanji"
          :create="handleCreate"
          :is-destructive-mode="isDestructiveMode"
          :kanji-breakdown="kanjiBreakdown"
          :update-notes="handleUpdateNotes"
          @remove="handleRemove"
          @reorder="handleReorder"
        />

        <VocabDetailSectionActions
          v-model:destructive-mode="isDestructiveMode"
          :is-deleting="isDeleting"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.vocab-detail-root {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.vocab-detail-root-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: var(--content-max-width);
}

.vocab-detail-root-loading,
.vocab-detail-root-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: var(--content-min-height);
}

.vocab-detail-root-error {
  color: var(--color-danger);
}
</style>
