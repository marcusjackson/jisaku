<script setup lang="ts">
/**
 * VocabularyDetailKanjiBreakdown
 *
 * Displays the kanji breakdown for a vocabulary entry with:
 * - Arrow button reordering (↑↓)
 * - Delete buttons visible only in destructive mode
 * - SharedEntitySearch for adding kanji
 * - SharedQuickCreateKanji for creating new kanji
 * - Individual kanji cards with analysis notes
 */

import { computed, ref } from 'vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedEntitySearch from '@/shared/components/SharedEntitySearch.vue'
import SharedQuickCreateKanji from '@/shared/components/SharedQuickCreateKanji.vue'

import VocabularyKanjiBreakdownCard from './VocabularyKanjiBreakdownCard.vue'

import type { EntityOption } from '@/shared/types/component-types'
import type { Kanji, VocabKanjiWithKanji } from '@/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/shared/validation/quick-create-kanji-schema'

const props = defineProps<{
  kanjiBreakdown: VocabKanjiWithKanji[]
  allKanji: Kanji[]
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  addKanji: [kanjiId: number]
  createKanji: [data: QuickCreateKanjiData]
  removeKanji: [vocabKanjiId: number]
  updateAnalysisNotes: [vocabKanjiId: number, notes: string | null]
  reorder: [vocabKanjiIds: number[]]
}>()

// Remove confirmation dialog state
const showRemoveDialog = ref(false)
const kanjiToRemove = ref<number | null>(null)

// Quick create dialog state
const showQuickCreate = ref(false)
const quickCreateSearchTerm = ref('')

// Get kanji IDs already in breakdown (for filtering search)
const linkedKanjiIds = computed(() =>
  props.kanjiBreakdown.map((vk) => vk.kanjiId)
)

// Convert kanji to search entity format (matching EntityOption interface)
const kanjiOptions = computed<EntityOption[]>(() =>
  props.allKanji.map((kanji) => ({
    id: kanji.id,
    character: kanji.character,
    shortMeaning: kanji.shortMeaning,
    strokeCount: kanji.strokeCount
  }))
)

// Handle adding a kanji from search
function handleAddKanji(entity: EntityOption) {
  const kanjiId = entity.id
  emit('addKanji', kanjiId)
}

// Handle "Create New" from search
function handleCreateNewKanji(searchTerm: string) {
  quickCreateSearchTerm.value = searchTerm
  showQuickCreate.value = true
}

// Handle quick create kanji
function handleQuickCreate(data: QuickCreateKanjiData) {
  emit('createKanji', data)
  showQuickCreate.value = false
}

// Handle quick create cancel
function handleQuickCreateCancel() {
  showQuickCreate.value = false
}

// Handle move up
function handleMoveUp(index: number) {
  if (index === 0) return

  const ids = props.kanjiBreakdown.map((vk) => vk.id)
  const temp = ids[index - 1]
  if (ids[index] !== undefined && temp !== undefined) {
    ids[index - 1] = ids[index]
    ids[index] = temp
  }

  emit('reorder', ids)
}

// Handle move down
function handleMoveDown(index: number) {
  if (index >= props.kanjiBreakdown.length - 1) return

  const ids = props.kanjiBreakdown.map((vk) => vk.id)
  const temp = ids[index + 1]
  if (ids[index] !== undefined && temp !== undefined) {
    ids[index + 1] = ids[index]
    ids[index] = temp
  }

  emit('reorder', ids)
}

// Handle remove click (show confirmation)
function handleRemoveClick(vocabKanjiId: number) {
  kanjiToRemove.value = vocabKanjiId
  showRemoveDialog.value = true
}

// Handle remove confirmation
function handleRemoveConfirm() {
  if (kanjiToRemove.value !== null) {
    emit('removeKanji', kanjiToRemove.value)
  }
  showRemoveDialog.value = false
  kanjiToRemove.value = null
}

// Handle remove cancel
function handleRemoveCancel() {
  showRemoveDialog.value = false
  kanjiToRemove.value = null
}

// Handle save analysis notes
function handleSaveNotes(vocabKanjiId: number, notes: string | null) {
  emit('updateAnalysisNotes', vocabKanjiId, notes)
}
</script>

<template>
  <div class="vocabulary-detail-kanji-breakdown">
    <!-- Kanji cards list -->
    <div
      v-if="props.kanjiBreakdown.length > 0"
      class="vocabulary-detail-kanji-breakdown-list"
    >
      <VocabularyKanjiBreakdownCard
        v-for="(vocabKanji, index) in props.kanjiBreakdown"
        :key="vocabKanji.id"
        :can-move-down="index < props.kanjiBreakdown.length - 1"
        :can-move-up="index > 0"
        :is-destructive-mode="props.isDestructiveMode ?? false"
        :vocab-kanji="vocabKanji"
        @move-down="handleMoveDown(index)"
        @move-up="handleMoveUp(index)"
        @remove="handleRemoveClick(vocabKanji.id)"
        @save-notes="handleSaveNotes(vocabKanji.id, $event)"
      />
    </div>

    <!-- Empty state -->
    <p
      v-else
      class="vocabulary-detail-kanji-breakdown-empty"
    >
      No kanji in breakdown. Add kanji to see character composition.
    </p>

    <!-- Add kanji search -->
    <SharedEntitySearch
      entity-type="kanji"
      :exclude-ids="linkedKanjiIds"
      label="Add Kanji"
      :options="kanjiOptions"
      placeholder="Search for kanji to add..."
      @create-new="handleCreateNewKanji"
      @select="handleAddKanji"
    />

    <!-- Quick Create Kanji Dialog -->
    <SharedQuickCreateKanji
      v-model:open="showQuickCreate"
      :initial-character="quickCreateSearchTerm"
      @cancel="handleQuickCreateCancel"
      @create="handleQuickCreate"
    />

    <!-- Remove confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Remove"
      description="Are you sure you want to remove this kanji from the breakdown? Analysis notes will be lost."
      :is-open="showRemoveDialog"
      title="Remove Kanji"
      variant="danger"
      @cancel="handleRemoveCancel"
      @confirm="handleRemoveConfirm"
    />
  </div>
</template>

<style scoped>
.vocabulary-detail-kanji-breakdown {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocabulary-detail-kanji-breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vocabulary-detail-kanji-breakdown-empty {
  margin: 0;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background: var(--color-surface-secondary);
  color: var(--color-text-muted);
  font-style: italic;
  text-align: center;
}
</style>
