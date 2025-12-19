<script setup lang="ts">
/**
 * VocabularySectionDetail
 *
 * Section component for vocabulary detail layout.
 * Uses SharedSection for each content area with inline editing support.
 * Coordinates actions between UI components and parent Root component.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import SharedBackButton from '@/shared/components/SharedBackButton.vue'
import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import VocabularyDetailBasicInfo from './VocabularyDetailBasicInfo.vue'
import VocabularyDetailHeader from './VocabularyDetailHeader.vue'
import VocabularyDetailKanjiBreakdown from './VocabularyDetailKanjiBreakdown.vue'
import VocabularyHeaderEditDialog from './VocabularyHeaderEditDialog.vue'

import type {
  Kanji,
  VocabKanjiWithKanji,
  Vocabulary
} from '@/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/shared/validation/quick-create-kanji-schema'

interface Props {
  vocabulary: Vocabulary
  kanjiBreakdown: VocabKanjiWithKanji[]
  allKanji: Kanji[]
  isDeleting?: boolean
  isDestructiveMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
  isDestructiveMode: false
})

const emit = defineEmits<{
  updateHeader: [
    data: {
      word: string
      kana: string | null
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
  updateBasicInfo: [field: string, value: string | number | boolean | null]
  addKanji: [kanjiId: number]
  createKanji: [data: QuickCreateKanjiData]
  removeKanji: [vocabKanjiId: number]
  updateAnalysisNotes: [vocabKanjiId: number, notes: string | null]
  reorderKanji: [vocabKanjiIds: number[]]
  delete: []
  updateDestructiveMode: [enabled: boolean]
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Computed writable for destructive mode (emits to parent)
const destructiveMode = computed({
  get: () => props.isDestructiveMode,
  set: (value: boolean) => {
    emit('updateDestructiveMode', value)
  }
})

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

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

function handleOpenHeaderEdit() {
  showHeaderEditDialog.value = true
}

function handleSaveHeader(data: {
  word: string
  kana: string | null
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  emit('updateHeader', data)
  showHeaderEditDialog.value = false
}

function handleBasicInfoUpdate(
  field: string,
  value: string | number | boolean | null
) {
  emit('updateBasicInfo', field, value)
}
</script>

<template>
  <article class="vocabulary-section-detail">
    <!-- Top back button -->
    <SharedBackButton
      label="Back to Vocabulary List"
      to="/vocabulary"
    />

    <!-- Header with word, kana, romaji, short_meaning, search_keywords -->
    <VocabularyDetailHeader
      :vocabulary="props.vocabulary"
      @edit="handleOpenHeaderEdit"
    />

    <!-- Main content sections -->
    <div class="vocabulary-section-detail-content">
      <!-- Basic Information (not collapsible) -->
      <SharedSection title="Basic Information">
        <VocabularyDetailBasicInfo
          :vocabulary="props.vocabulary"
          @update="handleBasicInfoUpdate"
        />
      </SharedSection>

      <!-- Kanji Breakdown (not collapsible, arrow reordering) -->
      <SharedSection title="Kanji Breakdown">
        <VocabularyDetailKanjiBreakdown
          :all-kanji="props.allKanji"
          :is-destructive-mode="props.isDestructiveMode"
          :kanji-breakdown="props.kanjiBreakdown"
          @add-kanji="emit('addKanji', $event)"
          @create-kanji="emit('createKanji', $event)"
          @remove-kanji="emit('removeKanji', $event)"
          @reorder="emit('reorderKanji', $event)"
          @update-analysis-notes="
            (id, notes) => emit('updateAnalysisNotes', id, notes)
          "
        />
      </SharedSection>
    </div>

    <!-- Bottom actions -->
    <div class="vocabulary-section-detail-actions">
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
      description="Are you sure you want to delete this vocabulary entry? This action cannot be undone."
      :is-open="showDeleteDialog"
      title="Delete Vocabulary"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />

    <!-- Header edit dialog -->
    <VocabularyHeaderEditDialog
      :kana="props.vocabulary.kana"
      :open="showHeaderEditDialog"
      :search-keywords="props.vocabulary.searchKeywords"
      :short-meaning="props.vocabulary.shortMeaning"
      :word="props.vocabulary.word"
      @save="handleSaveHeader"
      @update:open="showHeaderEditDialog = $event"
    />

    <!-- Bottom back button -->
    <SharedBackButton
      label="Back to Vocabulary List"
      to="/vocabulary"
    />
  </article>
</template>

<style scoped>
.vocabulary-section-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.vocabulary-section-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocabulary-section-detail-actions {
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
