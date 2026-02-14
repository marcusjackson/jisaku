<script setup lang="ts">
/**
 * KanjiListSectionList
 *
 * Section component that displays the grid of kanji cards.
 * Handles empty states and the "Add Kanji" action button.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { useSeedData } from '@/shared/composables'
import { useToast } from '@/shared/composables'

import KanjiListCard from './KanjiListCard.vue'

import type { KanjiClassification } from '@/api/classification'
import type { Kanji } from '@/api/kanji'

defineProps<{
  kanjiList: Kanji[]
  hasActiveFilters?: boolean
  primaryClassifications?: Map<number, KanjiClassification | null>
}>()

const emit = defineEmits<{
  addKanji: []
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
    class="kanji-list-section-list"
    data-testid="kanji-list-section-list"
  >
    <header class="kanji-list-section-list-header">
      <h1 class="kanji-list-section-list-title">Kanji List</h1>
      <BaseButton
        data-testid="kanji-add-button"
        @click="emit('addKanji')"
      >
        Add New
      </BaseButton>
    </header>

    <!-- Empty: no results from filter -->
    <div
      v-if="kanjiList.length === 0 && hasActiveFilters"
      class="kanji-list-section-list-empty"
    >
      <p class="kanji-list-section-list-empty-text">
        No kanji match your filters.
      </p>
    </div>

    <!-- Empty: no kanji at all -->
    <div
      v-else-if="kanjiList.length === 0"
      class="kanji-list-section-list-empty"
    >
      <p class="kanji-list-section-list-empty-text">
        No kanji yet. Add your first one!
      </p>
      <BaseButton
        size="lg"
        @click="emit('addKanji')"
      >
        Add First Kanji
      </BaseButton>

      <template v-if="isDevelopment">
        <BaseButton
          class="kanji-list-section-list-seed"
          :disabled="getSeedingState()"
          variant="secondary"
          @click="handleSeedData"
        >
          {{ getSeedingState() ? 'Seeding...' : 'Seed Data' }}
        </BaseButton>
        <p class="kanji-list-section-list-seed-hint">
          Load example data for testing
        </p>
      </template>
    </div>

    <!-- Kanji grid -->
    <div
      v-else
      class="kanji-list-section-list-grid"
      data-testid="kanji-list-grid"
    >
      <KanjiListCard
        v-for="kanji in kanjiList"
        :key="kanji.id"
        :classification="primaryClassifications?.get(kanji.id) ?? null"
        :kanji="kanji"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-list-section-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-list-section-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kanji-list-section-list-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.kanji-list-section-list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.kanji-list-section-list-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.kanji-list-section-list-seed {
  margin-top: var(--spacing-sm);
}

.kanji-list-section-list-seed-hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.kanji-list-section-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .kanji-list-section-list-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
