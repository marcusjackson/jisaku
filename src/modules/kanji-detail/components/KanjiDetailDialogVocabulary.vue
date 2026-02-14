<script setup lang="ts">
/**
 * KanjiDetailDialogVocabulary
 *
 * Dialog for managing vocabulary links to the current kanji.
 * Supports searching/linking existing vocabulary, quick-creating new entries, and unlinking.
 */

import { computed, ref } from 'vue'

import { BaseButton, BaseDialog } from '@/base/components'

import { SharedConfirmDialog } from '@/shared/components'

import KanjiDetailQuickCreateVocabulary from './KanjiDetailQuickCreateVocabulary.vue'
import KanjiDetailVocabularyItem from './KanjiDetailVocabularyItem.vue'
import KanjiDetailVocabularySearch from './KanjiDetailVocabularySearch.vue'

import type { VocabularyListItem } from '../kanji-detail-types'
import type { KanjiDetailVocabularyQuickCreateData } from '../schemas/kanji-detail-vocabulary-quick-create-schema'

const props = defineProps<{
  open: boolean
  /** All available vocabulary for searching */
  allVocabulary: VocabularyListItem[]
  /** Currently linked vocabulary (to exclude from search) */
  linkedVocabulary: VocabularyListItem[]
  /** Whether destructive mode is enabled (shows remove buttons) */
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  link: [vocabularyId: number]
  unlink: [vocabularyId: number]
  create: [data: KanjiDetailVocabularyQuickCreateData]
}>()

const isQuickCreateMode = ref(false)
const quickCreateSearchTerm = ref('')

// Confirmation dialog state
const showConfirmDialog = ref(false)
const pendingRemoveVocabId = ref<number | null>(null)

/** Get IDs of linked vocabulary to exclude from search */
const excludedIds = computed<number[]>(() =>
  props.linkedVocabulary.map((v) => v.vocabularyId)
)

/** Handle selecting vocabulary from search */
function handleSelect(vocabularyId: number): void {
  emit('link', vocabularyId)
  emit('update:open', false)
  resetToSearchMode()
}

/** Handle create button click - switch to quick-create mode */
function handleCreateClick(searchTerm: string): void {
  quickCreateSearchTerm.value = searchTerm
  isQuickCreateMode.value = true
}

/** Handle quick-create form submit */
function handleQuickCreate(data: KanjiDetailVocabularyQuickCreateData): void {
  emit('create', data)
  emit('update:open', false)
  resetToSearchMode()
}

/** Handle quick-create cancel */
function handleQuickCreateCancel(): void {
  resetToSearchMode()
}

/** Reset to search mode */
function resetToSearchMode(): void {
  isQuickCreateMode.value = false
  quickCreateSearchTerm.value = ''
}

/** Handle remove button click - show confirmation */
function handleRemoveClick(vocabularyId: number): void {
  pendingRemoveVocabId.value = vocabularyId
  showConfirmDialog.value = true
}

/** Handle remove confirmation */
function handleRemoveConfirm(): void {
  if (pendingRemoveVocabId.value !== null) {
    emit('unlink', pendingRemoveVocabId.value)
  }
  showConfirmDialog.value = false
  pendingRemoveVocabId.value = null
}

/** Handle remove cancel */
function handleRemoveCancel(): void {
  showConfirmDialog.value = false
  pendingRemoveVocabId.value = null
}
</script>

<template>
  <BaseDialog
    :open="props.open"
    title="Link Vocabulary"
    @update:open="emit('update:open', $event)"
  >
    <div class="vocabulary-dialog-content">
      <!-- Linked Vocabulary List (when destructive mode enabled) -->
      <div
        v-if="props.destructiveMode && props.linkedVocabulary.length > 0"
        class="vocabulary-dialog-section"
      >
        <h3 class="vocabulary-dialog-section-title">Linked Vocabulary</h3>
        <ul
          class="vocabulary-dialog-list"
          data-testid="linked-vocabulary-list"
        >
          <KanjiDetailVocabularyItem
            v-for="item in props.linkedVocabulary"
            :key="item.vocabularyId"
            :destructive-mode="props.destructiveMode"
            edit-mode
            :vocabulary="item"
            @remove="handleRemoveClick(item.vocabularyId)"
          />
        </ul>
      </div>

      <!-- Search Mode -->
      <div
        v-if="!isQuickCreateMode"
        class="vocabulary-dialog-section"
      >
        <h3 class="vocabulary-dialog-section-title">Add Vocabulary</h3>
        <KanjiDetailVocabularySearch
          :all-vocabulary="props.allVocabulary"
          :exclude-ids="excludedIds"
          placeholder="Search vocabulary by word, kana, or meaning..."
          @create="handleCreateClick"
          @select="handleSelect"
        />
      </div>

      <!-- Quick Create Mode -->
      <KanjiDetailQuickCreateVocabulary
        v-else
        :initial-word="quickCreateSearchTerm"
        @cancel="handleQuickCreateCancel"
        @create="handleQuickCreate"
      />

      <div
        v-if="!isQuickCreateMode"
        class="vocabulary-dialog-actions"
      >
        <BaseButton
          variant="secondary"
          @click="emit('update:open', false)"
        >
          Close
        </BaseButton>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <SharedConfirmDialog
      v-model:open="showConfirmDialog"
      confirm-label="Remove"
      description="Are you sure you want to remove this vocabulary link? The vocabulary entry will remain, only the link to this kanji will be removed."
      title="Remove Vocabulary Link"
      variant="danger"
      @cancel="handleRemoveCancel"
      @confirm="handleRemoveConfirm"
    />
  </BaseDialog>
</template>

<style scoped>
.vocabulary-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 200px;
}

.vocabulary-dialog-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.vocabulary-dialog-section-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
}

.vocabulary-dialog-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.vocabulary-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
