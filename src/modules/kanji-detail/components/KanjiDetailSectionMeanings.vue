<script setup lang="ts">
/**
 * KanjiDetailSectionMeanings
 *
 * Section component for displaying and editing kanji meanings.
 * Uses SharedSection for consistent layout.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import KanjiDetailDialogMeanings from './KanjiDetailDialogMeanings.vue'
import KanjiDetailMeaningsDisplay from './KanjiDetailMeaningsDisplay.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  MeaningsSaveData
} from '../kanji-detail-types'

const props = defineProps<{
  meanings: KanjiMeaning[]
  readingGroups: KanjiMeaningReadingGroup[]
  groupMembers: KanjiMeaningGroupMember[]
  destructiveMode?: boolean
  /** Saves meanings; returns whether it saved, so the dialog can close */
  save: (data: MeaningsSaveData) => boolean
}>()

const isDialogOpen = ref(false)

function handleSave(data: MeaningsSaveData): void {
  if (props.save(data)) isDialogOpen.value = false
}
</script>

<template>
  <SharedSection test-id="kanji-detail-meanings" title="Meanings">
    <template #actions>
      <BaseButton
        aria-label="Edit meanings"
        data-testid="meanings-edit-button"
        size="sm"
        variant="secondary"
        @click="isDialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <KanjiDetailMeaningsDisplay
      :group-members="groupMembers"
      :meanings="meanings"
      :reading-groups="readingGroups"
    />

    <KanjiDetailDialogMeanings
      :destructive-mode="destructiveMode ?? false"
      :group-members="groupMembers"
      :meanings="meanings"
      :open="isDialogOpen"
      :reading-groups="readingGroups"
      @save="handleSave"
      @update:open="isDialogOpen = $event"
    />
  </SharedSection>
</template>
