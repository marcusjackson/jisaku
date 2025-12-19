<script setup lang="ts">
/**
 * KanjiSectionDetail
 *
 * Section component for kanji detail layout.
 * Uses SharedSection for each content area with inline editing support.
 * Coordinates actions between UI components and parent Root component.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import SharedBackButton from '@/shared/components/SharedBackButton.vue'
import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import KanjiDetailBasicInfo from './KanjiDetailBasicInfo.vue'
import KanjiDetailClassifications from './KanjiDetailClassifications.vue'
import KanjiDetailComponents from './KanjiDetailComponents.vue'
import KanjiDetailHeader from './KanjiDetailHeader.vue'
import KanjiDetailMeanings from './KanjiDetailMeanings.vue'
import KanjiDetailNotesEducation from './KanjiDetailNotesEducation.vue'
import KanjiDetailNotesEtymology from './KanjiDetailNotesEtymology.vue'
import KanjiDetailNotesPersonal from './KanjiDetailNotesPersonal.vue'
import KanjiDetailNotesSemantic from './KanjiDetailNotesSemantic.vue'
import KanjiDetailReadings from './KanjiDetailReadings.vue'
import KanjiDetailStrokeOrder from './KanjiDetailStrokeOrder.vue'
import KanjiDetailVocabulary from './KanjiDetailVocabulary.vue'
import KanjiHeaderEditDialog from './KanjiHeaderEditDialog.vue'

import type {
  ClassificationType,
  Kanji,
  KanjiClassificationWithType,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  KunReading,
  OccurrenceWithComponent,
  OnReading,
  ReadingLevel,
  Vocabulary
} from '@/shared/types/database-types'
import type { Component } from '@/shared/types/database-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'
import type { QuickCreateVocabularyData } from '@/shared/validation/quick-create-vocabulary-schema'

interface Props {
  kanji: Kanji
  isDeleting?: boolean
  isDestructiveMode?: boolean
  occurrences?: OccurrenceWithComponent[]
  radical?: Component | null
  allComponents?: Component[]
  radicalOptions?: Component[]
  onReadings?: OnReading[]
  kunReadings?: KunReading[]
  meanings?: KanjiMeaning[]
  readingGroups?: KanjiMeaningReadingGroup[]
  groupMembers?: KanjiMeaningGroupMember[]
  classifications?: KanjiClassificationWithType[]
  classificationTypes?: ClassificationType[]
  vocabularyList?: Vocabulary[]
  allVocabulary?: Vocabulary[]
}

const props = withDefaults(defineProps<Props>(), {
  radical: null,
  occurrences: () => [],
  isDeleting: false,
  isDestructiveMode: false,
  allComponents: () => [],
  radicalOptions: () => [],
  onReadings: () => [],
  kunReadings: () => [],
  meanings: () => [],
  readingGroups: () => [],
  groupMembers: () => [],
  classifications: () => [],
  classificationTypes: () => [],
  vocabularyList: () => [],
  allVocabulary: () => []
})

const emit = defineEmits<{
  delete: []
  addComponent: [componentId: number]
  createComponent: [data: QuickCreateComponentData]
  removeComponent: [occurrenceId: number]
  updateDestructiveMode: [enabled: boolean]
  updateHeader: [
    data: {
      character: string
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
  updateBasicInfo: [field: string, value: string | number | null]
  updateNotesEtymology: [notes: string | null]
  updateNotesSemantic: [notes: string | null]
  updateNotesEducation: [notes: string | null]
  updateNotesPersonal: [notes: string | null]
  updateStrokeDiagram: [data: Uint8Array | null]
  updateStrokeGif: [data: Uint8Array | null]
  // Reading events
  addOnReading: [reading: string, level: ReadingLevel]
  updateOnReading: [id: number, reading: string, level: ReadingLevel]
  removeOnReading: [id: number]
  reorderOnReadings: [readingIds: number[]]
  addKunReading: [
    reading: string,
    okurigana: string | null,
    level: ReadingLevel
  ]
  updateKunReading: [
    id: number,
    reading: string,
    okurigana: string | null,
    level: ReadingLevel
  ]
  removeKunReading: [id: number]
  reorderKunReadings: [readingIds: number[]]
  // Meaning events
  addMeaning: [meaningText: string, additionalInfo: string | null]
  updateMeaning: [
    id: number,
    meaningText: string,
    additionalInfo: string | null
  ]
  removeMeaning: [id: number]
  reorderMeanings: [meaningIds: number[]]
  enableGrouping: []
  disableGrouping: []
  addReadingGroup: []
  updateReadingGroup: [id: number, readingText: string]
  removeReadingGroup: [id: number]
  reorderReadingGroups: [groupIds: number[]]
  assignMeaningToGroup: [meaningId: number, groupId: number]
  removeMeaningFromGroup: [meaningId: number, groupId: number]
  reorderMeaningsInGroup: [groupId: number, meaningIds: number[]]
  saveMeanings: []
  // Classification events
  addClassification: [classificationTypeId: number]
  updateClassification: [id: number, classificationTypeId: number]
  removeClassification: [id: number]
  reorderClassifications: [classificationIds: number[]]
  // Vocabulary events
  addVocabulary: [vocabularyId: number]
  createVocabulary: [data: QuickCreateVocabularyData]
  removeVocabulary: [vocabularyId: number]
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Computed writable for destructive mode (emits to parent)
const destructiveMode = computed({
  get: () => props.isDestructiveMode || false,
  set: (value: boolean) => {
    emit('updateDestructiveMode', value)
  }
})

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

// Remove component confirmation dialog state
const showRemoveComponentDialog = ref(false)
const componentToRemove = ref<number | null>(null)

// Header edit dialog state
const showHeaderEditDialog = ref(false)

function handleDeleteClick() {
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  showDeleteDialog.value = false
  emit('delete')
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
}

function handleAddComponent(componentId: number) {
  emit('addComponent', componentId)
}

function handleCreateComponent(data: QuickCreateComponentData) {
  emit('createComponent', data)
}

function handleRemoveComponentClick(occurrenceId: number) {
  componentToRemove.value = occurrenceId
  showRemoveComponentDialog.value = true
}

function handleRemoveComponentConfirm() {
  if (componentToRemove.value !== null) {
    emit('removeComponent', componentToRemove.value)
  }
  showRemoveComponentDialog.value = false
  componentToRemove.value = null
}

function handleRemoveComponentCancel() {
  showRemoveComponentDialog.value = false
  componentToRemove.value = null
}

function handleOpenHeaderEdit() {
  showHeaderEditDialog.value = true
}

function handleSaveHeader(data: {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  emit('updateHeader', data)
}

function handleBasicInfoUpdate(field: string, value: string | number | null) {
  emit('updateBasicInfo', field, value)
}

// Reading handlers - forward events from KanjiDetailReadings to parent
function handleUpdateOnReading(
  id: number,
  reading: string,
  level: ReadingLevel
) {
  emit('updateOnReading', id, reading, level)
}

function handleUpdateKunReading(
  id: number,
  reading: string,
  okurigana: string | null,
  level: ReadingLevel
) {
  emit('updateKunReading', id, reading, okurigana, level)
}
</script>

<template>
  <article class="kanji-section-detail">
    <!-- Top back button -->
    <SharedBackButton
      label="Back to Kanji List"
      to="/kanji"
    />

    <!-- Header with character, short_meaning, search_keywords -->
    <KanjiDetailHeader
      :kanji="props.kanji"
      :radical="props.radical"
      @edit="handleOpenHeaderEdit"
    />

    <!-- Main content sections -->
    <div class="kanji-section-detail-content">
      <!-- Basic Information (not collapsible) -->
      <SharedSection title="Basic Information">
        <KanjiDetailBasicInfo
          :kanji="props.kanji"
          :radical="props.radical"
          :radical-options="props.radicalOptions"
          @update="handleBasicInfoUpdate"
        />
      </SharedSection>

      <!-- Readings (not collapsible) - Phase 5.1 -->
      <SharedSection title="Readings">
        <KanjiDetailReadings
          :is-destructive-mode="props.isDestructiveMode"
          :kun-readings="props.kunReadings"
          :on-readings="props.onReadings"
          @add-kun-reading="
            (reading, okurigana, level) =>
              emit('addKunReading', reading, okurigana, level)
          "
          @add-on-reading="
            (reading, level) => emit('addOnReading', reading, level)
          "
          @remove-kun-reading="emit('removeKunReading', $event)"
          @remove-on-reading="emit('removeOnReading', $event)"
          @reorder-kun-readings="emit('reorderKunReadings', $event)"
          @reorder-on-readings="emit('reorderOnReadings', $event)"
          @update-kun-reading="handleUpdateKunReading"
          @update-on-reading="handleUpdateOnReading"
        />
      </SharedSection>

      <!-- Meanings (not collapsible) - Phase 5.2 -->
      <SharedSection title="Meanings">
        <KanjiDetailMeanings
          :group-members="props.groupMembers"
          :is-destructive-mode="props.isDestructiveMode"
          :meanings="props.meanings"
          :reading-groups="props.readingGroups"
          @add-meaning="(text, info) => emit('addMeaning', text, info)"
          @add-reading-group="emit('addReadingGroup')"
          @assign-meaning-to-group="
            (meaningId, groupId) =>
              emit('assignMeaningToGroup', meaningId, groupId)
          "
          @disable-grouping="emit('disableGrouping')"
          @enable-grouping="emit('enableGrouping')"
          @remove-meaning="emit('removeMeaning', $event)"
          @remove-meaning-from-group="
            (meaningId, groupId) =>
              emit('removeMeaningFromGroup', meaningId, groupId)
          "
          @remove-reading-group="emit('removeReadingGroup', $event)"
          @reorder-meanings="emit('reorderMeanings', $event)"
          @reorder-meanings-in-group="
            (groupId, meaningIds) =>
              emit('reorderMeaningsInGroup', groupId, meaningIds)
          "
          @reorder-reading-groups="emit('reorderReadingGroups', $event)"
          @save="emit('saveMeanings')"
          @update-meaning="
            (id, text, info) => emit('updateMeaning', id, text, info)
          "
          @update-reading-group="
            (id, text) => emit('updateReadingGroup', id, text)
          "
        />
      </SharedSection>

      <!-- Vocabulary (not collapsible) -->
      <SharedSection title="Vocabulary">
        <KanjiDetailVocabulary
          :all-vocabulary="props.allVocabulary"
          :is-destructive-mode="props.isDestructiveMode"
          :vocabulary-list="props.vocabularyList"
          @add-vocabulary="emit('addVocabulary', $event)"
          @create-vocabulary="emit('createVocabulary', $event)"
          @remove-vocabulary="emit('removeVocabulary', $event)"
        />
      </SharedSection>

      <!-- Semantic Analysis (collapsible) - Moved up per Phase 5.1 -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesSemantic)"
        title="Semantic Analysis"
      >
        <KanjiDetailNotesSemantic
          :notes="props.kanji.notesSemantic"
          @update="emit('updateNotesSemantic', $event)"
        />
      </SharedSection>

      <!-- Components (not collapsible) -->
      <SharedSection title="Components">
        <KanjiDetailComponents
          :all-components="props.allComponents"
          :is-destructive-mode="props.isDestructiveMode"
          :kanji-id="props.kanji.id"
          :occurrences="props.occurrences"
          @add-component="handleAddComponent"
          @create-component="handleCreateComponent"
          @remove-component="handleRemoveComponentClick"
        />
      </SharedSection>

      <!-- Classifications (not collapsible) - Phase 5.3 -->
      <SharedSection title="Classifications">
        <KanjiDetailClassifications
          :classification-types="props.classificationTypes"
          :classifications="props.classifications"
          :is-destructive-mode="props.isDestructiveMode"
          @add-classification="emit('addClassification', $event)"
          @remove-classification="emit('removeClassification', $event)"
          @reorder-classifications="emit('reorderClassifications', $event)"
          @update-classification="
            (id, typeId) => emit('updateClassification', id, typeId)
          "
        />
      </SharedSection>

      <!-- Stroke Order (collapsible) -->
      <SharedSection
        collapsible
        default-open
        title="Stroke Order"
      >
        <KanjiDetailStrokeOrder
          :stroke-diagram="props.kanji.strokeDiagramImage"
          :stroke-gif="props.kanji.strokeGifImage"
          @update-diagram="emit('updateStrokeDiagram', $event)"
          @update-gif="emit('updateStrokeGif', $event)"
        />
      </SharedSection>

      <!-- Etymology Notes (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesEtymology)"
        title="Etymology Notes"
      >
        <KanjiDetailNotesEtymology
          :notes="props.kanji.notesEtymology"
          @update="emit('updateNotesEtymology', $event)"
        />
      </SharedSection>

      <!-- Education & Mnemonics (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesEducationMnemonics)"
        title="Education & Mnemonics"
      >
        <KanjiDetailNotesEducation
          :notes="props.kanji.notesEducationMnemonics"
          @update="emit('updateNotesEducation', $event)"
        />
      </SharedSection>

      <!-- Personal Notes (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesPersonal)"
        title="Personal Notes"
      >
        <KanjiDetailNotesPersonal
          :notes="props.kanji.notesPersonal"
          @update="emit('updateNotesPersonal', $event)"
        />
      </SharedSection>
    </div>

    <!-- Bottom actions -->
    <div class="kanji-section-detail-actions">
      <!-- Destructive Mode Toggle -->
      <div class="destructive-mode-toggle">
        <label
          class="destructive-mode-label"
          for="destructive-mode-switch"
        >
          Destructive Mode
        </label>
        <BaseSwitch
          id="destructive-mode-switch"
          v-model="destructiveMode"
        />
      </div>

      <!-- Delete Button (only enabled in destructive mode) -->
      <BaseButton
        :disabled="deleteDisabled || !props.isDestructiveMode"
        variant="ghost"
        @click="handleDeleteClick"
      >
        {{ deleteDisabled ? 'Deleting...' : 'Delete' }}
      </BaseButton>
    </div>

    <!-- Delete confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      description="Are you sure you want to delete this kanji? This action cannot be undone."
      :is-open="showDeleteDialog"
      title="Delete Kanji"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />

    <!-- Header edit dialog -->
    <KanjiHeaderEditDialog
      :character="props.kanji.character"
      :open="showHeaderEditDialog"
      :search-keywords="props.kanji.searchKeywords"
      :short-meaning="props.kanji.shortMeaning"
      @save="handleSaveHeader"
      @update:open="showHeaderEditDialog = $event"
    />

    <!-- Remove component confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Remove"
      description="Are you sure you want to remove this component from the kanji? Occurrence analysis notes will be lost."
      :is-open="showRemoveComponentDialog"
      title="Remove Component"
      variant="danger"
      @cancel="handleRemoveComponentCancel"
      @confirm="handleRemoveComponentConfirm"
    />

    <!-- Bottom back button -->
    <SharedBackButton
      label="Back to Kanji List"
      to="/kanji"
    />
  </article>
</template>

<style scoped>
.kanji-section-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.kanji-section-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-section-detail-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.destructive-mode-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.destructive-mode-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
