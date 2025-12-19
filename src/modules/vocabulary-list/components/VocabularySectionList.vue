<script setup lang="ts">
/**
 * VocabularySectionList
 *
 * Section component that handles the layout and arrangement of vocabulary cards.
 * Displays the grid of vocabulary, empty state, and "Add Vocabulary" action button.
 * In development mode, shows a "Seed Data" button when database is empty.
 */

import { ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import { useSeedData } from '@/shared/composables/use-seed-data'
import { useToast } from '@/shared/composables/use-toast'

import VocabularyCard from './VocabularyCard.vue'
import VocabularyQuickCreateDialog from './VocabularyQuickCreateDialog.vue'

import type { Vocabulary } from '@/shared/types/database-types'
import type { QuickCreateVocabularyData } from '@/shared/validation/quick-create-vocabulary-schema'

const { hasActiveFilters, vocabularyList } = defineProps<{
  vocabularyList: Vocabulary[]
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  /** Emitted after successful seeding to trigger data refresh */
  refresh: []
  /** Emitted when quick-create vocabulary is requested */
  createVocabulary: [data: QuickCreateVocabularyData]
}>()

// Check if running in development mode
const isDevelopment = import.meta.env.DEV

// Seed data functionality
const { isSeeding, seed } = useSeedData()
const { error: showError, success: showSuccess } = useToast()
const isLocalSeeding = ref(false)

// Quick-create dialog state
const showQuickCreateDialog = ref(false)

async function handleSeedData() {
  if (isLocalSeeding.value) return
  isLocalSeeding.value = true
  try {
    await seed()
    showSuccess('Database seeded successfully! Refresh to see data.')
    emit('refresh')
  } catch (error) {
    // useSeedData already shows detailed error toasts,
    // this is a fallback for unexpected errors
    console.error('Seed data error:', error)
    showError('Failed to seed database')
  } finally {
    isLocalSeeding.value = false
  }
}

// Combined loading state check
function getSeedingState(): boolean {
  return isSeeding.value || isLocalSeeding.value
}

function handleOpenQuickCreate() {
  showQuickCreateDialog.value = true
}

function handleCreateVocabulary(data: QuickCreateVocabularyData) {
  showQuickCreateDialog.value = false
  emit('createVocabulary', data)
}
</script>

<template>
  <div class="vocabulary-section-list">
    <header class="vocabulary-section-list-header">
      <h1 class="vocabulary-section-list-title">Vocabulary</h1>
      <BaseButton @click="handleOpenQuickCreate"> Add Vocabulary </BaseButton>
    </header>

    <!-- Empty state: no results from filter -->
    <div
      v-if="vocabularyList.length === 0 && hasActiveFilters"
      class="vocabulary-section-list-empty"
    >
      <p class="vocabulary-section-list-empty-text">
        No vocabulary matches your filters.
      </p>
    </div>

    <!-- Empty state: no vocabulary at all -->
    <div
      v-else-if="vocabularyList.length === 0"
      class="vocabulary-section-list-empty"
    >
      <p class="vocabulary-section-list-empty-text">
        No vocabulary yet. Add your first one!
      </p>
      <BaseButton
        size="lg"
        @click="handleOpenQuickCreate"
      >
        Add Your First Vocabulary
      </BaseButton>

      <!-- Quick seed button (dev only) -->
      <BaseButton
        v-if="isDevelopment"
        class="vocabulary-section-list-seed-button"
        :disabled="getSeedingState()"
        variant="secondary"
        @click="handleSeedData"
      >
        {{ getSeedingState() ? 'Seeding...' : 'Seed Data' }}
      </BaseButton>
      <p
        v-if="isDevelopment"
        class="vocabulary-section-list-seed-hint"
      >
        Load example vocabulary, kanji, and components for testing
      </p>
    </div>

    <!-- Vocabulary grid -->
    <div
      v-else
      class="vocabulary-section-list-grid"
    >
      <VocabularyCard
        v-for="vocab in vocabularyList"
        :key="vocab.id"
        :vocabulary="vocab"
      />
    </div>

    <!-- Quick-create dialog -->
    <VocabularyQuickCreateDialog
      v-model:open="showQuickCreateDialog"
      @create="handleCreateVocabulary"
    />
  </div>
</template>

<style scoped>
.vocabulary-section-list {
  margin-top: var(--spacing-lg);
}

.vocabulary-section-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.vocabulary-section-list-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.vocabulary-section-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.vocabulary-section-list-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.vocabulary-section-list-seed-button {
  margin-top: var(--spacing-sm);
}

.vocabulary-section-list-seed-hint {
  margin: 0;
  margin-top: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocabulary-section-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .vocabulary-section-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
