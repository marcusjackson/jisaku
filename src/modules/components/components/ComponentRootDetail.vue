<script setup lang="ts">
/**
 * ComponentRootDetail
 *
 * Root component for the component detail feature.
 * Handles database initialization, data fetching by ID, and loading/error states.
 * Passes data down to ComponentSectionDetail.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import { useKanjiRepository } from '@/modules/kanji-list/composables/use-kanji-repository'
import { useComponentOccurrenceRepository } from '../composables/use-component-occurrence-repository'
import { useComponentRepository } from '../composables/use-component-repository'

import ComponentSectionDetail from './ComponentSectionDetail.vue'

import type {
  Component,
  Kanji,
  OccurrenceWithKanji
} from '@/shared/types/database-types'
import type { QuickCreateKanjiData } from '@/shared/validation/quick-create-kanji-schema'

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Repository for data access
const { getById, getLinkedKanjiCount, remove } = useComponentRepository()
const {
  create: createKanji,
  getAll: getAllKanji,
  getById: getKanjiById
} = useKanjiRepository()
const {
  create: createOccurrence,
  getByComponentIdWithPosition,
  updateAnalysisNotes,
  updateIsRadical,
  updatePosition
} = useComponentOccurrenceRepository()

// Toast notifications
const { success } = useToast()

// Local state
const component = ref<Component | null>(null)
const sourceKanji = ref<Kanji | null>(null)
const linkedKanjiCount = ref(0)
const occurrences = ref<OccurrenceWithKanji[]>([])
const allKanji = ref<Kanji[]>([])
const fetchError = ref<Error | null>(null)
const isDeleting = ref(false)

// Computed component ID from route params
const componentId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Fetch component by ID
function loadComponent() {
  if (Number.isNaN(componentId.value)) {
    fetchError.value = new Error('Invalid component ID')
    return
  }

  try {
    component.value = getById(componentId.value)
    if (!component.value) {
      fetchError.value = new Error('Component not found')
    } else {
      // Load source kanji if set
      sourceKanji.value = component.value.sourceKanjiId
        ? getKanjiById(component.value.sourceKanjiId)
        : null

      // Load occurrence information with position data
      linkedKanjiCount.value = getLinkedKanjiCount(componentId.value)
      const rawOccurrences = getByComponentIdWithPosition(componentId.value)
      occurrences.value = rawOccurrences.map((occurrence) => {
        const kanji = getKanjiById(occurrence.kanjiId)
        if (!kanji) {
          throw new Error(
            `Kanji with id ${String(occurrence.kanjiId)} not found`
          )
        }
        return {
          ...occurrence,
          kanji
        }
      })

      // Load all kanji for search
      allKanji.value = getAllKanji()
    }
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle delete action
async function handleDelete() {
  const componentToDelete = component.value
  if (!componentToDelete) return

  isDeleting.value = true
  try {
    remove(componentToDelete.id)
    success(`Component "${componentToDelete.character}" deleted`)
    await router.push({ name: 'component-list' })
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
    isDeleting.value = false
  }
}

// Handle analysis notes update
function handleAnalysisNotesUpdate(
  occurrenceId: number,
  analysisNotes: string | null
) {
  try {
    updateAnalysisNotes(occurrenceId, analysisNotes)
    // Update local state
    const occurrence = occurrences.value.find((o) => o.id === occurrenceId)
    if (occurrence) {
      occurrence.analysisNotes = analysisNotes
    }
    success('Analysis notes updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle position update
function handlePositionUpdate(
  occurrenceId: number,
  positionTypeId: number | null
) {
  try {
    updatePosition(occurrenceId, positionTypeId)
    // Update local state
    const occurrence = occurrences.value.find((o) => o.id === occurrenceId)
    if (occurrence) {
      occurrence.positionTypeId = positionTypeId
    }
    success('Position updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle radical flag update
function handleIsRadicalUpdate(occurrenceId: number, isRadical: boolean) {
  try {
    updateIsRadical(occurrenceId, isRadical)
    // Update local state
    const occurrence = occurrences.value.find((o) => o.id === occurrenceId)
    if (occurrence) {
      occurrence.isRadical = isRadical
    }
    success('Radical flag updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle adding existing kanji to this component
function handleAddKanji(kanjiId: number) {
  if (!component.value) return

  try {
    const occurrence = createOccurrence(kanjiId, component.value.id)
    const kanji = getKanjiById(kanjiId)
    if (!kanji) {
      throw new Error(`Kanji with id ${String(kanjiId)} not found`)
    }

    // Add to local state
    occurrences.value.push({
      ...occurrence,
      kanji,
      position: null
    })
    linkedKanjiCount.value += 1
    success(`Kanji "${kanji.character}" linked to component`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle creating new kanji and linking to this component
async function handleCreateKanji(data: QuickCreateKanjiData) {
  if (!component.value) return

  try {
    // Create the kanji
    const newKanji = createKanji({
      character: data.character,
      strokeCount: null,
      shortMeaning: data.shortMeaning ?? null,
      radicalId: null,
      jlptLevel: null,
      joyoLevel: null,
      kenteiLevel: null
    })

    // Link it to this component
    const occurrence = createOccurrence(newKanji.id, component.value.id)

    // Add to local state
    occurrences.value.push({
      ...occurrence,
      kanji: newKanji,
      position: null
    })
    linkedKanjiCount.value += 1

    // Refresh all kanji list
    allKanji.value = getAllKanji()

    success(`Kanji "${newKanji.character}" created and linked`)

    // Navigate to the new kanji detail page
    await router.push({ name: 'kanji-detail', params: { id: newKanji.id } })
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadComponent()
  } catch {
    // Error is already captured in initError
  }
})

// Reload when ID changes (for navigation between components)
watch(componentId, () => {
  if (isInitialized.value) {
    fetchError.value = null
    loadComponent()
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="component-root-detail-loading"
  >
    <BaseSpinner
      label="Loading component..."
      size="lg"
    />
    <p class="component-root-detail-loading-text">Loading component...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="component-root-detail-error"
  >
    <p class="component-root-detail-error-title">Failed to load</p>
    <p class="component-root-detail-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <ComponentSectionDetail
    v-else-if="isInitialized && component"
    :all-kanji="allKanji"
    :component="component"
    :is-deleting="isDeleting"
    :linked-kanji-count="linkedKanjiCount"
    :occurrences="occurrences"
    :source-kanji="sourceKanji"
    @add-kanji="handleAddKanji"
    @create-kanji="handleCreateKanji"
    @delete="handleDelete"
    @update:analysis-notes="handleAnalysisNotesUpdate"
    @update:is-radical="handleIsRadicalUpdate"
    @update:position="handlePositionUpdate"
  />
</template>

<style scoped>
.component-root-detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.component-root-detail-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.component-root-detail-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.component-root-detail-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.component-root-detail-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
