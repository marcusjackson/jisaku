<script setup lang="ts">
/**
 * VocabDetailSectionKanjiBreakdown
 *
 * Collapsible section listing kanji in a vocabulary word.
 * Orchestrates add/edit/delete dialogs and reorder controls.
 */

import { computed, ref } from 'vue'

import { BaseButton } from '@/base/components'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import VocabDetailDialogAddKanji from './VocabDetailDialogAddKanji.vue'
import VocabDetailDialogEditKanjiNotes from './VocabDetailDialogEditKanjiNotes.vue'
import VocabDetailKanjiBreakdownItem from './VocabDetailKanjiBreakdownItem.vue'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'
import type { QuickCreateKanjiData } from '@/shared/validation'

// =============================================================================
// Props & Emits
// =============================================================================

interface Props {
  /** Kanji breakdown entries with joined kanji data */
  kanjiBreakdown: VocabKanjiWithKanji[]
  /** All kanji for search (excluding already linked) */
  allKanji: Kanji[]
  /** Whether destructive actions (delete) are enabled */
  isDestructiveMode: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** Link existing kanji */
  add: [kanjiId: number]
  /** Create new kanji and link */
  create: [data: QuickCreateKanjiData]
  /** Update analysis notes */
  'update-notes': [id: number, notes: string | null]
  /** Reorder breakdown entries */
  reorder: [ids: number[]]
  /** Remove a kanji link */
  remove: [id: number]
}>()

// =============================================================================
// State
// =============================================================================

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<VocabKanjiWithKanji | null>(null)
const deletingItem = ref<VocabKanjiWithKanji | null>(null)

// =============================================================================
// Computed
// =============================================================================

const defaultOpen = computed(() => props.kanjiBreakdown.length > 0)

const excludedKanjiIds = computed(() =>
  props.kanjiBreakdown.map((vk) => vk.kanjiId)
)

// =============================================================================
// Handlers - Add
// =============================================================================

function handleAddClick() {
  showAddDialog.value = true
}

function handleAddSelect(kanjiId: number) {
  emit('add', kanjiId)
  showAddDialog.value = false
}

function handleAddCreate(data: QuickCreateKanjiData) {
  emit('create', data)
  showAddDialog.value = false
}

// =============================================================================
// Handlers - Edit
// =============================================================================

function handleEditClick(item: VocabKanjiWithKanji) {
  editingItem.value = item
  showEditDialog.value = true
}

function handleEditSubmit(data: { id: number; notes: string | null }) {
  emit('update-notes', data.id, data.notes)
  showEditDialog.value = false
  editingItem.value = null
}

function handleEditCancel() {
  showEditDialog.value = false
  editingItem.value = null
}

// =============================================================================
// Handlers - Delete
// =============================================================================

function handleDeleteClick(item: VocabKanjiWithKanji) {
  deletingItem.value = item
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  if (deletingItem.value) {
    emit('remove', deletingItem.value.id)
  }
  showDeleteDialog.value = false
  deletingItem.value = null
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
  deletingItem.value = null
}

// =============================================================================
// Handlers - Reorder
// =============================================================================

function handleMoveUp(index: number) {
  if (index <= 0) return
  const ids = props.kanjiBreakdown.map((vk) => vk.id)
  const current = ids[index]
  const previous = ids[index - 1]
  if (current === undefined || previous === undefined) return
  ids[index - 1] = current
  ids[index] = previous
  emit('reorder', ids)
}

function handleMoveDown(index: number) {
  if (index >= props.kanjiBreakdown.length - 1) return
  const ids = props.kanjiBreakdown.map((vk) => vk.id)
  const current = ids[index]
  const next = ids[index + 1]
  if (current === undefined || next === undefined) return
  ids[index] = next
  ids[index + 1] = current
  emit('reorder', ids)
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="defaultOpen"
    test-id="vocab-detail-kanji-breakdown"
    title="Kanji Breakdown"
  >
    <template #actions="{ isOpen }">
      <BaseButton
        v-if="isOpen"
        size="sm"
        variant="secondary"
        @click="handleAddClick"
      >
        Add Kanji
      </BaseButton>
    </template>

    <div class="breakdown-content">
      <!-- Empty state -->
      <p
        v-if="kanjiBreakdown.length === 0"
        class="empty-state"
      >
        No kanji linked yet. Add kanji that make up this word.
      </p>

      <!-- Breakdown list -->
      <div
        v-else
        class="breakdown-list"
      >
        <VocabDetailKanjiBreakdownItem
          v-for="(item, index) in kanjiBreakdown"
          :key="item.id"
          :index="index"
          :is-destructive-mode="isDestructiveMode"
          :total="kanjiBreakdown.length"
          :vocab-kanji="item"
          @delete="handleDeleteClick(item)"
          @edit="handleEditClick(item)"
          @move-down="handleMoveDown(index)"
          @move-up="handleMoveUp(index)"
        />
      </div>
    </div>
  </SharedSection>

  <!-- Add Kanji Dialog -->
  <VocabDetailDialogAddKanji
    v-model:open="showAddDialog"
    :all-kanji="allKanji"
    :excluded-kanji-ids="excludedKanjiIds"
    @create="handleAddCreate"
    @select="handleAddSelect"
  />

  <!-- Edit Notes Dialog -->
  <VocabDetailDialogEditKanjiNotes
    v-model:open="showEditDialog"
    :vocab-kanji="editingItem"
    @cancel="handleEditCancel"
    @submit="handleEditSubmit"
  />

  <!-- Delete Confirmation -->
  <SharedConfirmDialog
    v-model:open="showDeleteDialog"
    confirm-label="Delete"
    :description="`Are you sure you want to unlink '${deletingItem?.kanji.character}' from this vocabulary? Any analysis notes will be lost.`"
    title="Unlink Kanji"
    variant="danger"
    @cancel="handleDeleteCancel"
    @confirm="handleDeleteConfirm"
  />
</template>

<style scoped>
.breakdown-content {
  padding: var(--spacing-md) 0;
}

.empty-state {
  margin: 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
