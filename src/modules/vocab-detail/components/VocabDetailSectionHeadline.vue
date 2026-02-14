<script setup lang="ts">
/**
 * VocabDetailSectionHeadline
 *
 * Section component for the vocabulary headline (top of detail page).
 * Shows: back button, word, kana, short meaning, search keywords.
 * Edit button opens dialog for editing these fields.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import {
  SharedBackButton,
  SharedSearchKeywordsIndicator
} from '@/shared/components'

import { ROUTES } from '@/router/routes'

import VocabDetailDialogHeadline from './VocabDetailDialogHeadline.vue'

import type { HeadlineSaveData } from '../vocab-detail-types'
import type { Vocabulary } from '@/api/vocabulary'

defineProps<{
  vocab: Vocabulary
}>()

const emit = defineEmits<{
  save: [data: HeadlineSaveData]
}>()

const isDialogOpen = ref(false)

function handleSave(data: HeadlineSaveData): void {
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <section
    class="vocab-detail-section-headline"
    data-testid="vocab-detail-headline"
  >
    <SharedBackButton
      label="Back to Vocabulary List"
      :to="ROUTES.VOCABULARY_LIST"
    />

    <div class="vocab-detail-section-headline-content">
      <div class="vocab-detail-section-headline-main">
        <div class="vocab-detail-section-headline-text">
          <span
            class="vocab-detail-section-headline-word"
            data-testid="vocab-word"
          >
            {{ vocab.word }}
          </span>
          <span
            class="vocab-detail-section-headline-kana"
            data-testid="vocab-kana"
          >
            {{ vocab.kana }}
          </span>
        </div>
        <div class="vocab-detail-section-headline-info">
          <div class="vocab-detail-section-headline-top">
            <span
              v-if="vocab.shortMeaning"
              class="vocab-detail-section-headline-meaning"
              data-testid="vocab-short-meaning"
            >
              {{ vocab.shortMeaning }}
            </span>
            <SharedSearchKeywordsIndicator
              :search-keywords="vocab.searchKeywords"
            />
          </div>
        </div>
      </div>
      <div class="vocab-detail-section-headline-actions">
        <BaseButton
          data-testid="headline-edit-button"
          size="sm"
          variant="secondary"
          @click="isDialogOpen = true"
        >
          Edit
        </BaseButton>
      </div>
    </div>

    <VocabDetailDialogHeadline
      v-model:open="isDialogOpen"
      :kana="vocab.kana"
      :search-keywords="vocab.searchKeywords"
      :short-meaning="vocab.shortMeaning"
      :word="vocab.word"
      @save="handleSave"
    />
  </section>
</template>

<style scoped>
.vocab-detail-section-headline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocab-detail-section-headline-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.vocab-detail-section-headline-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vocab-detail-section-headline-text {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xs);
}

.vocab-detail-section-headline-word {
  color: var(--color-text-primary);
  font-family: var(--font-family-japanese);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.vocab-detail-section-headline-kana {
  color: var(--color-text-secondary);
  font-family: var(--font-family-japanese);
  font-size: var(--font-size-xl);
  line-height: var(--line-height-normal);
}

.vocab-detail-section-headline-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.vocab-detail-section-headline-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.vocab-detail-section-headline-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-md);
  line-height: var(--line-height-normal);
}

.vocab-detail-section-headline-actions {
  display: flex;
  gap: var(--spacing-sm);
}

@media (width <= 640px) {
  .vocab-detail-section-headline-content {
    flex-direction: column;
  }

  .vocab-detail-section-headline-actions {
    align-self: flex-start;
  }
}
</style>
