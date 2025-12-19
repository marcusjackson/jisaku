<script setup lang="ts">
/**
 * KanjiDetailVocabulary
 *
 * Section component for displaying vocabulary that uses this kanji.
 * Shows basic vocab info only (word, kana, short_meaning).
 * Edit mode allows adding/removing vocabulary links via BaseCombobox.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedEntitySearch from '@/shared/components/SharedEntitySearch.vue'
import SharedQuickCreateVocabulary from '@/shared/components/SharedQuickCreateVocabulary.vue'

import type { Vocabulary } from '@/shared/types/database-types'
import type { QuickCreateVocabularyData } from '@/shared/validation/quick-create-vocabulary-schema'

// Local interface matching SharedEntitySearch.EntityOption
interface EntitySearchOption {
  id: number
  character: string
  shortMeaning: string | null
  strokeCount: number | null
}

const props = defineProps<{
  /** Vocabulary using this kanji */
  vocabularyList: Vocabulary[]
  /** All vocabulary for search */
  allVocabulary: Vocabulary[]
  /** Whether destructive mode is enabled */
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  addVocabulary: [vocabularyId: number]
  createVocabulary: [data: QuickCreateVocabularyData]
  removeVocabulary: [vocabularyId: number]
}>()

// State
const isEditing = ref(false)
const showAddVocabulary = ref(false)
const showRemoveDialog = ref(false)
const removingVocabularyId = ref<number | null>(null)
const showQuickCreate = ref(false)
const quickCreateSearchTerm = ref('')

// IDs of vocabulary already linked to this kanji
const excludedVocabularyIds = computed(() =>
  props.vocabularyList.map((v) => v.id)
)

// Convert vocabulary to EntityOption format for SharedEntitySearch
const vocabularyOptions = computed<EntitySearchOption[]>(() =>
  props.allVocabulary.map((v) => ({
    id: v.id,
    character: v.word,
    shortMeaning: v.shortMeaning,
    strokeCount: null // Vocabulary doesn't have stroke count
  }))
)

// Handlers
function handleEdit() {
  isEditing.value = true
}

function handleSave() {
  isEditing.value = false
  showAddVocabulary.value = false
}

function handleCancel() {
  isEditing.value = false
  showAddVocabulary.value = false
}

function handleToggleAddVocabulary() {
  showAddVocabulary.value = !showAddVocabulary.value
}

function handleSelectVocabulary(entity: EntitySearchOption) {
  emit('addVocabulary', entity.id)
  // Don't hide the add vocabulary UI to allow adding more
}

function handleCreateNewVocabulary(searchTerm: string) {
  quickCreateSearchTerm.value = searchTerm
  showQuickCreate.value = true
}

function handleQuickCreate(data: QuickCreateVocabularyData) {
  emit('createVocabulary', data)
  showQuickCreate.value = false
  showAddVocabulary.value = false
}

function handleQuickCreateCancel() {
  showQuickCreate.value = false
}

function handleRemoveClick(vocabularyId: number) {
  removingVocabularyId.value = vocabularyId
  showRemoveDialog.value = true
}

function handleRemoveConfirm() {
  if (removingVocabularyId.value !== null) {
    emit('removeVocabulary', removingVocabularyId.value)
  }
  showRemoveDialog.value = false
  removingVocabularyId.value = null
}

function handleRemoveCancel() {
  showRemoveDialog.value = false
  removingVocabularyId.value = null
}
</script>

<template>
  <div class="kanji-detail-vocabulary">
    <!-- View mode -->
    <div
      v-if="!isEditing"
      class="kanji-detail-vocabulary-view"
    >
      <div class="kanji-detail-vocabulary-header">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="handleEdit"
        >
          Edit
        </BaseButton>
      </div>

      <div
        v-if="props.vocabularyList.length === 0"
        class="kanji-detail-vocabulary-empty"
      >
        <p>No vocabulary using this kanji.</p>
      </div>

      <div
        v-else
        class="kanji-detail-vocabulary-list"
      >
        <RouterLink
          v-for="vocab in props.vocabularyList"
          :key="vocab.id"
          class="kanji-detail-vocabulary-item"
          :to="{ name: 'vocabulary-detail', params: { id: vocab.id } }"
        >
          <span class="kanji-detail-vocabulary-word">{{ vocab.word }}</span>
          <span
            v-if="vocab.kana"
            class="kanji-detail-vocabulary-kana"
            >({{ vocab.kana }})</span
          >
          <span class="kanji-detail-vocabulary-meaning">
            {{ vocab.shortMeaning || 'No meaning' }}
          </span>
        </RouterLink>
      </div>
    </div>

    <!-- Edit mode -->
    <div
      v-else
      class="kanji-detail-vocabulary-edit"
    >
      <div class="kanji-detail-vocabulary-header">
        <BaseButton
          size="sm"
          @click="handleSave"
        >
          Done
        </BaseButton>
        <BaseButton
          size="sm"
          variant="ghost"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
      </div>

      <!-- Add Vocabulary Search -->
      <div class="kanji-detail-vocabulary-add">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="handleToggleAddVocabulary"
        >
          {{ showAddVocabulary ? 'Cancel' : '+ Add' }}
        </BaseButton>
      </div>

      <div
        v-if="showAddVocabulary"
        class="kanji-detail-vocabulary-search"
      >
        <SharedEntitySearch
          entity-type="component"
          :exclude-ids="excludedVocabularyIds"
          label="Search and add vocabulary"
          :options="vocabularyOptions"
          placeholder="Search by word or meaning..."
          @create-new="handleCreateNewVocabulary"
          @select="handleSelectVocabulary"
        />
      </div>

      <div class="kanji-detail-vocabulary-list">
        <div
          v-for="vocab in props.vocabularyList"
          :key="vocab.id"
          class="kanji-detail-vocabulary-item-edit"
        >
          <span class="kanji-detail-vocabulary-word">{{ vocab.word }}</span>
          <span
            v-if="vocab.kana"
            class="kanji-detail-vocabulary-kana"
            >({{ vocab.kana }})</span
          >
          <span class="kanji-detail-vocabulary-meaning">
            {{ vocab.shortMeaning || 'No meaning' }}
          </span>
          <BaseButton
            v-if="props.isDestructiveMode"
            aria-label="Remove vocabulary"
            size="sm"
            variant="ghost"
            @click="handleRemoveClick(vocab.id)"
          >
            ✕
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Quick Create Vocabulary Dialog -->
    <SharedQuickCreateVocabulary
      v-model:open="showQuickCreate"
      :initial-word="quickCreateSearchTerm"
      @cancel="handleQuickCreateCancel"
      @create="handleQuickCreate"
    />

    <!-- Remove dialog -->
    <SharedConfirmDialog
      confirm-label="Remove"
      description="Remove this vocabulary link from this kanji?"
      :is-open="showRemoveDialog"
      title="Remove Vocabulary"
      variant="danger"
      @cancel="handleRemoveCancel"
      @confirm="handleRemoveConfirm"
    />
  </div>
</template>

<style scoped>
.kanji-detail-vocabulary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-vocabulary-header {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.kanji-detail-vocabulary-empty {
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
  text-align: center;
}

.kanji-detail-vocabulary-empty p {
  margin: 0;
}

.kanji-detail-vocabulary-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-vocabulary-item {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-variant);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.kanji-detail-vocabulary-item:hover {
  background-color: var(--color-surface-hover);
}

.kanji-detail-vocabulary-item-edit {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-variant);
}

.kanji-detail-vocabulary-word {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-vocabulary-kana {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-detail-vocabulary-meaning {
  flex: 1;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: right;
}

.kanji-detail-vocabulary-add {
  display: flex;
  justify-content: flex-start;
  margin-bottom: var(--spacing-sm);
}

.kanji-detail-vocabulary-search {
  margin-bottom: var(--spacing-md);
}
</style>
