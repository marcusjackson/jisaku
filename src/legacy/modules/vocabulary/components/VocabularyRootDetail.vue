<script setup lang="ts">
/**
 * VocabularyRootDetail
 *
 * Root component for the vocabulary detail feature.
 * Handles database initialization, data fetching by ID, and loading/error states.
 * Provides field-level update handlers for inline editing.
 * Passes data down to VocabularySectionDetail.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/legacy/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/legacy/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/legacy/shared/composables/use-database'
import { useKanjiRepository } from '@/legacy/shared/composables/use-kanji-repository'
import { useToast } from '@/legacy/shared/composables/use-toast'
import { useVocabKanjiRepository } from '@/legacy/shared/composables/use-vocab-kanji-repository'
import { useVocabularyRepository } from '@/legacy/shared/composables/use-vocabulary-repository'

import VocabularySectionDetail from './VocabularySectionDetail.vue'

import type {
  Kanji,
  VocabKanjiWithKanji,
  Vocabulary
} from '@/legacy/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/legacy/shared/validation/quick-create-kanji-schema'

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing, persist } =
  useDatabase()

// Repositories
const vocabularyRepo = useVocabularyRepository()
const vocabKanjiRepo = useVocabKanjiRepository()
const kanjiRepo = useKanjiRepository()

// Toast notifications
const { error: showError, success } = useToast()

// Local state
const vocabulary = ref<Vocabulary | null>(null)
const kanjiBreakdown = ref<VocabKanjiWithKanji[]>([])
const allKanji = ref<Kanji[]>([])
const fetchError = ref<Error | null>(null)
const isDeleting = ref(false)
const isDestructiveMode = ref(false)
const updateToastTimeout = ref<NodeJS.Timeout | null>(null)

// Computed vocabulary ID from route params
const vocabularyId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Fetch vocabulary by ID
function loadVocabulary() {
  if (Number.isNaN(vocabularyId.value)) {
    fetchError.value = new Error('Invalid vocabulary ID')
    return
  }

  try {
    vocabulary.value = vocabularyRepo.getById(vocabularyId.value)
    if (!vocabulary.value) {
      fetchError.value = new Error('Vocabulary not found')
      return
    }

    // Load kanji breakdown with kanji data
    kanjiBreakdown.value = vocabKanjiRepo.getByVocabIdWithKanji(
      vocabularyId.value
    )

    // Load all kanji for search (when adding new kanji to breakdown)
    allKanji.value = kanjiRepo.getAll()
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// =============================================================================
// Header Update Handler
// =============================================================================

async function handleUpdateHeader(data: {
  word: string
  kana: string | null
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  if (!vocabulary.value) return

  try {
    vocabulary.value = vocabularyRepo.updateHeaderFields(
      vocabulary.value.id,
      data.word,
      data.kana,
      data.shortMeaning,
      data.searchKeywords
    )
    await persist()
    success('Header updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update header')
  }
}

// =============================================================================
// Basic Info Update Handler
// =============================================================================

async function handleUpdateBasicInfo(
  field: string,
  value: string | number | boolean | null
) {
  if (!vocabulary.value) return

  try {
    // Map field names to database column names
    const fieldMap: Record<string, 'jlpt_level' | 'is_common' | 'description'> =
      {
        jlptLevel: 'jlpt_level',
        isCommon: 'is_common',
        description: 'description'
      }

    const dbField = fieldMap[field]
    if (!dbField) {
      showError(`Unknown field: ${field}`)
      return
    }

    vocabulary.value = vocabularyRepo.updateBasicInfoField(
      vocabulary.value.id,
      dbField,
      value
    )
    await persist()

    // Debounce the success toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Updated successfully')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update')
  }
}

// =============================================================================
// Kanji Breakdown Handlers
// =============================================================================

async function handleAddKanji(kanjiId: number) {
  if (!vocabulary.value) return

  try {
    // Check if already linked
    const existing = kanjiBreakdown.value.find((vk) => vk.kanjiId === kanjiId)
    if (existing) {
      showError('Kanji already in breakdown')
      return
    }

    vocabKanjiRepo.create(vocabulary.value.id, kanjiId)
    await persist()
    loadVocabulary() // Reload to get updated breakdown
    success('Kanji added to breakdown')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to add kanji')
  }
}

async function handleCreateKanji(data: QuickCreateKanjiData) {
  if (!vocabulary.value) return

  try {
    // Create the kanji
    const newKanji = kanjiRepo.create({
      character: data.character,
      strokeCount: null,
      shortMeaning: data.shortMeaning ?? null,
      searchKeywords: data.searchKeywords ?? null
    })

    // Link to this vocabulary
    vocabKanjiRepo.create(vocabulary.value.id, newKanji.id)
    await persist()

    // Reload data
    allKanji.value = kanjiRepo.getAll()
    loadVocabulary()

    success(`Created "${data.character}" and added to breakdown`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to create kanji')
  }
}

async function handleRemoveKanji(vocabKanjiId: number) {
  try {
    vocabKanjiRepo.remove(vocabKanjiId)
    await persist()
    loadVocabulary() // Reload to get updated breakdown
    success('Kanji removed from breakdown')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to remove kanji')
  }
}

async function handleUpdateAnalysisNotes(
  vocabKanjiId: number,
  notes: string | null
) {
  try {
    vocabKanjiRepo.updateAnalysisNotes(vocabKanjiId, notes)
    await persist()
    loadVocabulary() // Reload to get updated breakdown
    success('Analysis notes updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update notes')
  }
}

async function handleReorderKanji(vocabKanjiIds: number[]) {
  try {
    vocabKanjiRepo.reorder(vocabKanjiIds)
    await persist()
    loadVocabulary() // Reload to get updated order

    // Debounce the success toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Order updated')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder')
  }
}

// =============================================================================
// Delete Handler
// =============================================================================

async function handleDelete() {
  const vocabToDelete = vocabulary.value
  if (!vocabToDelete) return

  isDeleting.value = true
  try {
    vocabularyRepo.remove(vocabToDelete.id)
    await persist()
    success(`Vocabulary "${vocabToDelete.word}" deleted`)
    await router.push({ name: 'legacy-vocabulary-list' })
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete')
    isDeleting.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadVocabulary()
  } catch {
    // Error is already captured in initError
  }
})

// Reload when ID changes (for navigation between vocabulary)
watch(vocabularyId, () => {
  if (isInitialized.value) {
    fetchError.value = null
    loadVocabulary()
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="vocabulary-root-detail-loading"
  >
    <BaseSpinner
      label="Loading vocabulary..."
      size="lg"
    />
    <p class="vocabulary-root-detail-loading-text">Loading vocabulary...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="vocabulary-root-detail-error"
  >
    <p class="vocabulary-root-detail-error-title">Failed to load</p>
    <p class="vocabulary-root-detail-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <VocabularySectionDetail
    v-else-if="isInitialized && vocabulary"
    :all-kanji="allKanji"
    :is-deleting="isDeleting"
    :is-destructive-mode="isDestructiveMode"
    :kanji-breakdown="kanjiBreakdown"
    :vocabulary="vocabulary"
    @add-kanji="handleAddKanji"
    @create-kanji="handleCreateKanji"
    @delete="handleDelete"
    @remove-kanji="handleRemoveKanji"
    @reorder-kanji="handleReorderKanji"
    @update-analysis-notes="handleUpdateAnalysisNotes"
    @update-basic-info="handleUpdateBasicInfo"
    @update-destructive-mode="isDestructiveMode = $event"
    @update-header="handleUpdateHeader"
  />
</template>

<style scoped>
.vocabulary-root-detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.vocabulary-root-detail-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.vocabulary-root-detail-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.vocabulary-root-detail-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.vocabulary-root-detail-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
