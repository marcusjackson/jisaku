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

const props = defineProps<{
  vocabulary: VocabularyListItem[]
  allVocabulary: VocabularyListItem[]
  destructiveMode?: boolean
  /** Links vocabulary; returns whether it saved, so the dialog can close */
  link: (vocabularyId: number) => boolean
  /** Creates and links vocabulary; returns whether it saved */
  create: (data: KanjiDetailVocabularyQuickCreateData) => boolean
}>()

const emit = defineEmits<{
  unlink: [vocabularyId: number]
}>()

const dialogOpen = ref(false)

function handleLink(vocabularyId: number): void {
  if (props.link(vocabularyId)) dialogOpen.value = false
}

function handleCreate(data: KanjiDetailVocabularyQuickCreateData): void {
  if (props.create(data)) dialogOpen.value = false
}
</script>

<template>
  <SharedSection test-id="kanji-detail-vocabulary" title="Vocabulary">
    <template #actions>
      <BaseButton
        aria-label="Edit vocabulary"
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
      @create="handleCreate"
      @link="handleLink"
      @unlink="emit('unlink', $event)"
    />
  </SharedSection>
</template>
