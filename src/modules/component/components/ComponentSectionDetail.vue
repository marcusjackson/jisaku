<script setup lang="ts">
/**
 * ComponentSectionDetail
 *
 * Section component for component detail layout.
 * Uses SharedSection for each content area with inline editing support.
 * Coordinates actions between UI components and parent Root component.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import SharedBackButton from '@/shared/components/SharedBackButton.vue'
import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import ComponentDetailBasicInfo from './ComponentDetailBasicInfo.vue'
import ComponentDetailDescription from './ComponentDetailDescription.vue'
import ComponentDetailHeader from './ComponentDetailHeader.vue'
import ComponentDetailKanjiList from './ComponentDetailKanjiList.vue'
import ComponentHeaderEditDialog from './ComponentHeaderEditDialog.vue'

import type {
  Component,
  Kanji,
  OccurrenceWithKanji
} from '@/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/shared/validation/quick-create-kanji-schema'

interface Props {
  component: Component
  isDeleting?: boolean
  isDestructiveMode?: boolean
  linkedKanjiCount?: number
  occurrences?: OccurrenceWithKanji[]
  sourceKanji?: Kanji | null
  /** All available kanji for search */
  allKanji?: Kanji[]
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
  isDestructiveMode: false,
  linkedKanjiCount: 0,
  occurrences: () => [],
  sourceKanji: null,
  allKanji: () => []
})

const emit = defineEmits<{
  delete: []
  'update:analysisNotes': [occurrenceId: number, analysisNotes: string | null]
  'update:position': [occurrenceId: number, positionTypeId: number | null]
  'update:isRadical': [occurrenceId: number, isRadical: boolean]
  addKanji: [kanjiId: number]
  createKanji: [data: QuickCreateKanjiData]
  removeKanji: [occurrenceId: number]
  updateDestructiveMode: [enabled: boolean]
  updateHeader: [
    data: {
      character: string
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
  updateBasicInfo: [field: string, value: string | number | boolean | null]
  updateDescription: [description: string | null]
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

// Remove kanji confirmation dialog state
const showRemoveKanjiDialog = ref(false)
const kanjiToRemove = ref<number | null>(null)

// Header edit dialog state
const showHeaderEditDialog = ref(false)

// Warning message if component is linked to kanji
const deleteWarning = computed(() => {
  if (props.linkedKanjiCount > 0) {
    return `This component is linked to ${String(props.linkedKanjiCount)} kanji. Deleting it will remove those links.`
  }
  return undefined
})

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

function handleAnalysisNotesUpdate(
  occurrenceId: number,
  analysisNotes: string | null
) {
  emit('update:analysisNotes', occurrenceId, analysisNotes)
}

function handlePositionUpdate(
  occurrenceId: number,
  positionTypeId: number | null
) {
  emit('update:position', occurrenceId, positionTypeId)
}

function handleIsRadicalUpdate(occurrenceId: number, isRadical: boolean) {
  emit('update:isRadical', occurrenceId, isRadical)
}

function handleAddKanji(kanjiId: number) {
  emit('addKanji', kanjiId)
}

function handleCreateKanji(data: QuickCreateKanjiData) {
  emit('createKanji', data)
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

function handleBasicInfoUpdate(
  field: string,
  value: string | number | boolean | null
) {
  emit('updateBasicInfo', field, value)
}

function handleDescriptionUpdate(description: string | null) {
  emit('updateDescription', description)
}

function handleRemoveKanjiClick(occurrenceId: number) {
  kanjiToRemove.value = occurrenceId
  showRemoveKanjiDialog.value = true
}

function handleRemoveKanjiConfirm() {
  if (kanjiToRemove.value !== null) {
    emit('removeKanji', kanjiToRemove.value)
  }
  showRemoveKanjiDialog.value = false
  kanjiToRemove.value = null
}

function handleRemoveKanjiCancel() {
  showRemoveKanjiDialog.value = false
  kanjiToRemove.value = null
}
</script>

<template>
  <article class="component-section-detail">
    <!-- Top back button -->
    <SharedBackButton
      label="Back to Component List"
      to="/components"
    />

    <!-- Header with character, short_meaning, search_keywords -->
    <ComponentDetailHeader
      :component="props.component"
      @edit="handleOpenHeaderEdit"
    />

    <!-- Main content sections -->
    <div class="component-section-detail-content">
      <!-- Basic Information (not collapsible) -->
      <SharedSection title="Basic Information">
        <ComponentDetailBasicInfo
          :component="props.component"
          :kanji-options="props.allKanji"
          :source-kanji="props.sourceKanji"
          @update="handleBasicInfoUpdate"
        />
      </SharedSection>

      <!-- Description (not collapsible) -->
      <SharedSection title="Description">
        <ComponentDetailDescription
          :description="props.component.description"
          @update="handleDescriptionUpdate"
        />
      </SharedSection>

      <!-- Appears in Kanji (collapsible) -->
      <SharedSection
        collapsible
        default-open
        :title="`Appears in Kanji (${props.occurrences.length})`"
      >
        <ComponentDetailKanjiList
          :all-kanji="props.allKanji"
          :component-id="props.component.id"
          :is-destructive-mode="props.isDestructiveMode"
          :occurrences="props.occurrences"
          @add-kanji="handleAddKanji"
          @create-kanji="handleCreateKanji"
          @remove-kanji="handleRemoveKanjiClick"
          @update:analysis-notes="handleAnalysisNotesUpdate"
          @update:is-radical="handleIsRadicalUpdate"
          @update:position="handlePositionUpdate"
        />
      </SharedSection>
    </div>

    <!-- Bottom actions -->
    <div class="component-section-detail-actions">
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
      :description="
        deleteWarning
          ? `${deleteWarning} Are you sure you want to delete this component? This action cannot be undone.`
          : 'Are you sure you want to delete this component? This action cannot be undone.'
      "
      :is-open="showDeleteDialog"
      title="Delete Component"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />

    <!-- Remove kanji confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Remove"
      description="Are you sure you want to remove this kanji from the component? Occurrence analysis notes will be lost."
      :is-open="showRemoveKanjiDialog"
      title="Remove Kanji"
      variant="danger"
      @cancel="handleRemoveKanjiCancel"
      @confirm="handleRemoveKanjiConfirm"
    />

    <!-- Header edit dialog -->
    <ComponentHeaderEditDialog
      :character="props.component.character"
      :open="showHeaderEditDialog"
      :search-keywords="props.component.searchKeywords"
      :short-meaning="props.component.shortMeaning"
      @save="handleSaveHeader"
      @update:open="showHeaderEditDialog = $event"
    />

    <!-- Bottom back button -->
    <SharedBackButton
      label="Back to Component List"
      to="/components"
    />
  </article>
</template>

<style scoped>
.component-section-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.component-section-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-section-detail-actions {
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
