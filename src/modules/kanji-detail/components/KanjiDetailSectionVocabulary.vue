<script setup lang="ts">
/**
 * KanjiDetailSectionVocabulary
 *
 * Section component for kanji vocabulary.
 * Displays vocabulary list with edit dialog for linking/unlinking.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import KanjiDetailDialogVocabulary from './KanjiDetailDialogVocabulary.vue'
import KanjiDetailVocabularyDisplay from './KanjiDetailVocabularyDisplay.vue'

import type { VocabularyListItem } from '../kanji-detail-types'
import type { KanjiDetailVocabularyQuickCreateData } from '../schemas/kanji-detail-vocabulary-quick-create-schema'

defineProps<{
  vocabulary: VocabularyListItem[]
  allVocabulary: VocabularyListItem[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  link: [vocabularyId: number]
  unlink: [vocabularyId: number]
  create: [data: KanjiDetailVocabularyQuickCreateData]
}>()

const dialogOpen = ref(false)
</script>

<template>
  <SharedSection
    test-id="kanji-detail-vocabulary"
    title="Vocabulary"
  >
    <template #actions>
      <BaseButton
        data-testid="vocabulary-edit-button"
        size="sm"
        variant="secondary"
        @click="dialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <KanjiDetailVocabularyDisplay :vocabulary="vocabulary" />

    <KanjiDetailDialogVocabulary
      v-model:open="dialogOpen"
      :all-vocabulary="allVocabulary"
      :destructive-mode="destructiveMode ?? false"
      :linked-vocabulary="vocabulary"
      @create="emit('create', $event)"
      @link="emit('link', $event)"
      @unlink="emit('unlink', $event)"
    />
  </SharedSection>
</template>
