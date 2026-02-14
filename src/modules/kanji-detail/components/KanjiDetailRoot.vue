<script setup lang="ts">
/**
 * KanjiDetailRoot - Root component for kanji detail page
 */

import { ref } from 'vue'

import { BaseSpinner } from '@/base/components'

import { useKanjiDetailAllHandlers } from '../composables/use-kanji-detail-all-handlers'
import { useKanjiDetailBasicInfoHandlers } from '../composables/use-kanji-detail-basic-info-handlers'
import { useKanjiDetailComponentsHandlers } from '../composables/use-kanji-detail-components-handlers'
import { useKanjiDetailData } from '../composables/use-kanji-detail-data'
import { useKanjiDetailHandlers } from '../composables/use-kanji-detail-handlers'
import { useKanjiDetailMeaningsHandlers } from '../composables/use-kanji-detail-meanings-handlers'
import { useKanjiDetailReadingsHandlers } from '../composables/use-kanji-detail-readings-handlers'
import { useKanjiDetailVocabularyHandlers } from '../composables/use-kanji-detail-vocabulary-handlers'

import KanjiDetailSectionActions from './KanjiDetailSectionActions.vue'
import KanjiDetailSectionBasicInfo from './KanjiDetailSectionBasicInfo.vue'
import KanjiDetailSectionComponents from './KanjiDetailSectionComponents.vue'
import KanjiDetailSectionHeadline from './KanjiDetailSectionHeadline.vue'
import KanjiDetailSectionMeanings from './KanjiDetailSectionMeanings.vue'
import KanjiDetailSectionReadings from './KanjiDetailSectionReadings.vue'
import KanjiDetailSectionVocabulary from './KanjiDetailSectionVocabulary.vue'
import KanjiSectionNotesGroup from './KanjiSectionNotesGroup.vue'
import KanjiSectionSemanticNotes from './KanjiSectionSemanticNotes.vue'
import KanjiSectionStrokeOrder from './KanjiSectionStrokeOrder.vue'

const {
  allComponents,
  classificationTypes,
  classifications,
  componentOccurrences,
  componentRepo,
  groupMemberRepo,
  groupMembers,
  isLoading,
  kanji,
  kanjiClassificationRepo,
  kanjiId,
  kanjiRepo,
  kunReadingRepo,
  kunReadings,
  loadError,
  meaningRepo,
  meanings,
  onReadingRepo,
  onReadings,
  radical,
  readingGroupRepo,
  readingGroups,
  vocabulary
} = useKanjiDetailData()
const isDestructiveMode = ref(false)
const isDeleting = ref(false)

const { handleSave: saveBasicInfo } = useKanjiDetailBasicInfoHandlers(
  { kanji, radical, allComponents, classifications },
  {
    kanjiRepository: kanjiRepo,
    componentRepository: componentRepo,
    classificationRepository: kanjiClassificationRepo
  }
)
const { handleDelete, handleHeadlineSave } = useKanjiDetailHandlers(
  kanji,
  isDeleting
)
const { handleSaveReadings } = useKanjiDetailReadingsHandlers(
  { kanjiId, kunReadings, onReadings },
  { kunReadingRepo, onReadingRepo }
)
const { handleSaveMeanings } = useKanjiDetailMeaningsHandlers(
  { groupMembers, kanjiId, meanings, readingGroups },
  { groupMemberRepo, meaningRepo, readingGroupRepo }
)
const {
  allVocabulary,
  handleCreate,
  handleLink,
  handleUnlink,
  vocabularyList
} = useKanjiDetailVocabularyHandlers({ kanji, vocabulary })
const {
  allComponents: componentsForSearch,
  handleCreate: handleComponentCreate,
  handleSave: handleComponentSave,
  linkedOccurrences
} = useKanjiDetailComponentsHandlers({ kanji, componentOccurrences })
const {
  handleBasicInfoSave,
  handleEducationNotesSave,
  handleEtymologyNotesSave,
  handleMeaningsSave,
  handlePersonalNotesSave,
  handleReadingsSave,
  handleSemanticNotesSave,
  handleStrokeAnimationSave,
  handleStrokeDiagramSave
} = useKanjiDetailAllHandlers(
  kanji,
  saveBasicInfo,
  handleSaveReadings,
  handleSaveMeanings
)
</script>

<template>
  <div class="kanji-detail-root">
    <div class="kanji-detail-root-container">
      <div
        v-if="isLoading"
        class="kanji-detail-root-loading"
      >
        <BaseSpinner size="lg" />
      </div>

      <div
        v-else-if="loadError"
        class="kanji-detail-root-error"
      >
        <p>{{ loadError }}</p>
      </div>

      <template v-else-if="kanji">
        <KanjiDetailSectionHeadline
          :kanji="kanji"
          :radical="radical"
          @save="handleHeadlineSave"
        />

        <KanjiDetailSectionBasicInfo
          :all-components="allComponents"
          :classification-types="classificationTypes"
          :classifications="classifications"
          :kanji="kanji"
          :radical="radical"
          @save="handleBasicInfoSave"
        />
        <KanjiDetailSectionReadings
          :destructive-mode="isDestructiveMode"
          :kun-readings="kunReadings"
          :on-readings="onReadings"
          @save="handleReadingsSave"
        />
        <KanjiDetailSectionMeanings
          :destructive-mode="isDestructiveMode"
          :group-members="groupMembers"
          :kun-readings="kunReadings"
          :meanings="meanings"
          :on-readings="onReadings"
          :reading-groups="readingGroups"
          @save="handleMeaningsSave"
        />
        <KanjiDetailSectionComponents
          :all-components="componentsForSearch"
          :destructive-mode="isDestructiveMode"
          :linked-occurrences="linkedOccurrences"
          @create="handleComponentCreate"
          @save="handleComponentSave"
        />
        <KanjiDetailSectionVocabulary
          :all-vocabulary="allVocabulary"
          :destructive-mode="isDestructiveMode"
          :vocabulary="vocabularyList"
          @create="handleCreate"
          @link="handleLink"
          @unlink="handleUnlink"
        />
        <KanjiSectionSemanticNotes
          :notes="kanji.notesSemantic"
          @save="handleSemanticNotesSave"
        />
        <KanjiSectionStrokeOrder
          :stroke-diagram="kanji.strokeDiagramImage"
          :stroke-gif="kanji.strokeGifImage"
          @save:animation="handleStrokeAnimationSave"
          @save:diagram="handleStrokeDiagramSave"
        />
        <KanjiSectionNotesGroup
          :notes-education="kanji.notesEducationMnemonics"
          :notes-etymology="kanji.notesEtymology"
          :notes-personal="kanji.notesPersonal"
          @save:education="handleEducationNotesSave"
          @save:etymology="handleEtymologyNotesSave"
          @save:personal="handlePersonalNotesSave"
        />
        <KanjiDetailSectionActions
          v-model:destructive-mode="isDestructiveMode"
          :is-deleting="isDeleting"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.kanji-detail-root {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.kanji-detail-root-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 768px;
}

.kanji-detail-root-loading,
.kanji-detail-root-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.kanji-detail-root-error {
  color: var(--color-text-danger);
}
</style>
