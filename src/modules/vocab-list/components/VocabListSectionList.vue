<script setup lang="ts">
/**
 * VocabListSectionList
 *
 * Section component that displays the grid of vocabulary cards.
 * Handles empty states and the "Add Vocabulary" action button.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { useSeedData } from '@/shared/composables'
import { useToast } from '@/shared/composables'

import VocabListCard from './VocabListCard.vue'

import type { Vocabulary } from '@/api/vocabulary'

defineProps<{
  vocabList: Vocabulary[]
  hasActiveFilters?: boolean
}>()

const emit = defineEmits<{
  addVocab: []
  refresh: []
}>()

// Dev-only seed functionality
const isDevelopment = import.meta.env.DEV
const { isSeeding, seed } = useSeedData()
const { error: showError, success: showSuccess } = useToast()
const isLocalSeeding = ref(false)

async function handleSeedData(): Promise<void> {
  if (isLocalSeeding.value) return
  isLocalSeeding.value = true
  try {
    await seed()
    showSuccess('Database seeded successfully!')
    emit('refresh')
  } catch (error) {
    console.error('Seed error:', error)
    showError('Failed to seed database')
  } finally {
    isLocalSeeding.value = false
  }
}

function getSeedingState(): boolean {
  return isSeeding.value || isLocalSeeding.value
}
</script>

<template>
  <div
    class="vocab-list-section-list"
    data-testid="vocab-list-section-list"
  >
    <header class="vocab-list-section-list-header">
      <h1 class="vocab-list-section-list-title">Vocabulary</h1>
      <BaseButton
        data-testid="vocab-add-button"
        @click="emit('addVocab')"
      >
        Add New
      </BaseButton>
    </header>

    <!-- Empty: no results from filter -->
    <div
      v-if="vocabList.length === 0 && hasActiveFilters"
      class="vocab-list-section-list-empty"
    >
      <p class="vocab-list-section-list-empty-text">
        No vocabulary matches your filters.
      </p>
    </div>

    <!-- Empty: no vocabulary at all -->
    <div
      v-else-if="vocabList.length === 0"
      class="vocab-list-section-list-empty"
    >
      <p class="vocab-list-section-list-empty-text">
        No vocabulary yet. Add your first one!
      </p>
      <BaseButton
        size="lg"
        @click="emit('addVocab')"
      >
        Add First Vocabulary
      </BaseButton>

      <template v-if="isDevelopment">
        <BaseButton
          class="vocab-list-section-list-seed"
          :disabled="getSeedingState()"
          variant="secondary"
          @click="handleSeedData"
        >
          {{ getSeedingState() ? 'Seeding...' : 'Seed Data' }}
        </BaseButton>
        <p class="vocab-list-section-list-seed-hint">
          Load example data for testing
        </p>
      </template>
    </div>

    <!-- Vocabulary grid -->
    <div
      v-else
      class="vocab-list-section-list-grid"
      data-testid="vocab-list-grid"
    >
      <VocabListCard
        v-for="vocab in vocabList"
        :key="vocab.id"
        :vocabulary="vocab"
      />
    </div>
  </div>
</template>

<style scoped>
.vocab-list-section-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.vocab-list-section-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vocab-list-section-list-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.vocab-list-section-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.vocab-list-section-list-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.vocab-list-section-list-seed {
  margin-top: var(--spacing-sm);
}

.vocab-list-section-list-seed-hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocab-list-section-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .vocab-list-section-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
