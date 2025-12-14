<script setup lang="ts">
/**
 * ComponentSectionDetail
 *
 * Section component for component detail layout.
 * Arranges UI components and coordinates actions between them.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedBackButton from '@/shared/components/SharedBackButton.vue'
import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import ComponentDetailHeader from './ComponentDetailHeader.vue'
import ComponentDetailInfo from './ComponentDetailInfo.vue'
import ComponentDetailKanjiList from './ComponentDetailKanjiList.vue'

import type {
  Component,
  Kanji,
  OccurrenceWithKanji
} from '@/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/shared/validation/quick-create-kanji-schema'

interface Props {
  component: Component
  isDeleting?: boolean
  linkedKanjiCount?: number
  occurrences?: OccurrenceWithKanji[]
  sourceKanji?: Kanji | null
  /** All available kanji for search */
  allKanji?: Kanji[]
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
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
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

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
</script>

<template>
  <article class="component-section-detail">
    <SharedBackButton
      label="Back to Component List"
      to="/components"
    />

    <ComponentDetailHeader :component="props.component" />

    <div class="component-section-detail-content">
      <ComponentDetailInfo
        :component="props.component"
        :source-kanji="props.sourceKanji"
      />

      <ComponentDetailKanjiList
        :all-kanji="props.allKanji"
        :component-id="props.component.id"
        :occurrences="props.occurrences"
        @add-kanji="handleAddKanji"
        @create-kanji="handleCreateKanji"
        @update:analysis-notes="handleAnalysisNotesUpdate"
        @update:is-radical="handleIsRadicalUpdate"
        @update:position="handlePositionUpdate"
      />
    </div>

    <div class="component-section-detail-actions">
      <RouterLink :to="`/components/${props.component.id}/edit`">
        <BaseButton variant="secondary">Edit</BaseButton>
      </RouterLink>
      <BaseButton
        :disabled="deleteDisabled"
        variant="ghost"
        @click="handleDeleteClick"
      >
        {{ deleteDisabled ? 'Deleting...' : 'Delete' }}
      </BaseButton>
    </div>

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
  gap: var(--spacing-xl);
}

.component-section-detail-actions {
  display: flex;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
