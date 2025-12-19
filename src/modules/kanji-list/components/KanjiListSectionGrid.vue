<script setup lang="ts">
/**
 * KanjiListSectionGrid
 *
 * Section component that handles the layout and arrangement of kanji cards.
 * Displays the grid of kanji, empty state, and "Add Kanji" action button.
 * In development mode, shows a "Seed Data" button when database is empty.
 */

import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import { useSeedData } from '@/shared/composables/use-seed-data'
import { useToast } from '@/shared/composables/use-toast'

import KanjiListCard from './KanjiListCard.vue'

import type {
  Kanji,
  KanjiClassificationWithType
} from '@/shared/types/database-types'

defineProps<{
  kanjiList: Kanji[]
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean
  /** Map of kanji ID to primary classification (or null) */
  classifications?: Map<number, KanjiClassificationWithType | null>
}>()

const emit = defineEmits<{
  /** Emitted after successful seeding to trigger data refresh */
  refresh: []
}>()

// Check if running in development mode
const isDevelopment = import.meta.env.DEV

// Seed data functionality
const { isSeeding, seed } = useSeedData()
const { error: showError, success: showSuccess } = useToast()
const isLocalSeeding = ref(false)

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
</script>

<template>
  <div class="kanji-list-section-grid">
    <header class="kanji-list-section-grid-header">
      <h1 class="kanji-list-section-grid-title">Kanji List</h1>
      <RouterLink
        v-slot="{ navigate }"
        custom
        to="/kanji/new"
      >
        <BaseButton @click="navigate">Add Kanji</BaseButton>
      </RouterLink>
    </header>

    <!-- Empty state: no results from filter -->
    <div
      v-if="kanjiList.length === 0 && hasActiveFilters"
      class="kanji-list-section-grid-empty"
    >
      <p class="kanji-list-section-grid-empty-text">
        No kanji match your filters.
      </p>
    </div>

    <!-- Empty state: no kanji at all -->
    <div
      v-else-if="kanjiList.length === 0"
      class="kanji-list-section-grid-empty"
    >
      <p class="kanji-list-section-grid-empty-text">
        No kanji yet. Add your first one!
      </p>
      <RouterLink
        v-slot="{ navigate }"
        custom
        to="/kanji/new"
      >
        <BaseButton
          size="lg"
          @click="navigate"
        >
          Add Your First Kanji
        </BaseButton>
      </RouterLink>

      <!-- Quick seed button (dev only) -->
      <BaseButton
        v-if="isDevelopment"
        class="kanji-list-section-grid-seed-button"
        :disabled="getSeedingState()"
        variant="secondary"
        @click="handleSeedData"
      >
        {{ getSeedingState() ? 'Seeding...' : 'Seed Data' }}
      </BaseButton>
      <p
        v-if="isDevelopment"
        class="kanji-list-section-grid-seed-hint"
      >
        Load example kanji and components for testing
      </p>
    </div>

    <!-- Kanji grid -->
    <div
      v-else
      class="kanji-list-section-grid-grid"
    >
      <KanjiListCard
        v-for="kanji in kanjiList"
        :key="kanji.id"
        :classification="classifications?.get(kanji.id) ?? null"
        :kanji="kanji"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-list-section-grid {
  margin-top: var(--spacing-lg);
}

.kanji-list-section-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.kanji-list-section-grid-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.kanji-list-section-grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.kanji-list-section-grid-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.kanji-list-section-grid-seed-button {
  margin-top: var(--spacing-sm);
}

.kanji-list-section-grid-seed-hint {
  margin: 0;
  margin-top: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.kanji-list-section-grid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .kanji-list-section-grid-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
