<script setup lang="ts">
/**
 * KanjiDetailSectionHeadline
 *
 * Section component for the kanji headline (top of detail page).
 * Shows: back button, kanji character, display text, search keywords, radical.
 * Edit button opens dialog for editing character, display text, and keywords.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import {
  SharedBackButton,
  SharedSearchKeywordsIndicator
} from '@/shared/components'

import { ROUTES } from '@/router/routes'

import KanjiDetailDialogHeadline from './KanjiDetailDialogHeadline.vue'

import type { HeadlineSaveData } from '../kanji-detail-types'
import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'

defineProps<{
  kanji: Kanji
  radical: RadicalComponent | null
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
    class="kanji-detail-section-headline"
    data-testid="kanji-detail-headline"
  >
    <SharedBackButton
      label="Back to Kanji List"
      :to="ROUTES.KANJI_LIST"
    />

    <div class="kanji-detail-section-headline-content">
      <div class="kanji-detail-section-headline-main">
        <span
          class="kanji-detail-section-headline-character"
          data-testid="kanji-character"
        >
          {{ kanji.character }}
        </span>
        <div class="kanji-detail-section-headline-info">
          <div class="kanji-detail-section-headline-top">
            <span
              v-if="kanji.shortMeaning"
              class="kanji-detail-section-headline-display"
              data-testid="kanji-short-meaning"
            >
              {{ kanji.shortMeaning }}
            </span>
            <SharedSearchKeywordsIndicator
              :search-keywords="kanji.searchKeywords"
            />
          </div>
          <span
            v-if="radical"
            class="kanji-detail-section-headline-radical"
            data-testid="kanji-radical"
          >
            <span class="kanji-detail-section-headline-radical-label"
              >Radical:</span
            >
            <span class="kanji-detail-section-headline-radical-char">
              {{ radical.character }}
            </span>
            <span
              v-if="radical.kangxiMeaning"
              class="kanji-detail-section-headline-radical-meaning"
            >
              ({{ radical.kangxiMeaning }})
            </span>
          </span>
        </div>
      </div>
      <div class="kanji-detail-section-headline-actions">
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

    <KanjiDetailDialogHeadline
      v-model:open="isDialogOpen"
      :character="kanji.character"
      :search-keywords="kanji.searchKeywords"
      :short-meaning="kanji.shortMeaning"
      @save="handleSave"
    />
  </section>
</template>

<style scoped>
.kanji-detail-section-headline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-section-headline-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.kanji-detail-section-headline-main {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.kanji-detail-section-headline-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-tight);
}

.kanji-detail-section-headline-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-detail-section-headline-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-detail-section-headline-display {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-section-headline-radical {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.kanji-detail-section-headline-radical-label {
  color: var(--color-text-muted);
}

.kanji-detail-section-headline-radical-char {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
}

.kanji-detail-section-headline-radical-meaning {
  color: var(--color-text-secondary);
}

.kanji-detail-section-headline-actions {
  flex-shrink: 0;
}
</style>
