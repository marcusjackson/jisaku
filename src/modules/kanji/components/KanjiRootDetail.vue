<script setup lang="ts">
/**
 * KanjiRootDetail
 *
 * Root component for the kanji detail feature.
 * Handles database initialization, data fetching by ID, and loading/error states.
 * Provides field-level update handlers for inline editing.
 * Passes data down to KanjiSectionDetail.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useComponentOccurrenceRepository } from '@/shared/composables/use-component-occurrence-repository'
import { useComponentRepository } from '@/shared/composables/use-component-repository'
import { useDatabase } from '@/shared/composables/use-database'
import { useKanjiRepository } from '@/shared/composables/use-kanji-repository'
import { useRadicalRepository } from '@/shared/composables/use-radical-repository'
import { useToast } from '@/shared/composables/use-toast'

import KanjiSectionDetail from './KanjiSectionDetail.vue'

import type {
  Component,
  JlptLevel,
  JoyoLevel,
  Kanji,
  OccurrenceWithComponent
} from '@/shared/types/database-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing, persist } =
  useDatabase()

// Repository for data access
const {
  getById,
  remove,
  updateHeaderFields,
  updateJlptLevel,
  updateJoyoLevel,
  updateKenteiLevel,
  updateNotesEducation,
  updateNotesEtymology,
  updateNotesPersonal,
  updateNotesSemantic,
  updateRadicalId,
  updateStrokeCount,
  updateStrokeImages
} = useKanjiRepository()
const { getById: getRadicalById } = useRadicalRepository()
const {
  create: createOccurrence,
  getByKanjiIdWithPosition,
  remove: removeOccurrence,
  updateIsRadical
} = useComponentOccurrenceRepository()
const {
  create: createComponent,
  getAll: getAllComponents,
  getById: getComponentById
} = useComponentRepository()

// Toast notifications
const { error: showError, success } = useToast()

// Local state
const kanji = ref<Kanji | null>(null)
const radical = ref<Component | null>(null)
const occurrences = ref<OccurrenceWithComponent[]>([])
const allComponents = ref<Component[]>([])
const radicalOptions = ref<Component[]>([])
const fetchError = ref<Error | null>(null)
const isDeleting = ref(false)
const isDestructiveMode = ref(false)
const updateToastTimeout = ref<NodeJS.Timeout | null>(null)

// Computed kanji ID from route params
const kanjiId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Fetch kanji by ID
function loadKanji() {
  if (Number.isNaN(kanjiId.value)) {
    fetchError.value = new Error('Invalid kanji ID')
    return
  }

  try {
    kanji.value = getById(kanjiId.value)
    if (!kanji.value) {
      fetchError.value = new Error('Kanji not found')
      return
    }

    // Load radical if kanji has one
    if (kanji.value.radicalId) {
      radical.value = getRadicalById(kanji.value.radicalId)
    } else {
      radical.value = null
    }

    // Load component occurrences with position data
    const rawOccurrences = getByKanjiIdWithPosition(kanji.value.id)
    occurrences.value = rawOccurrences.map((occurrence) => {
      const component = getComponentById(occurrence.componentId)
      if (!component) {
        throw new Error(
          `Component with id ${String(occurrence.componentId)} not found`
        )
      }
      return {
        ...occurrence,
        component
      }
    })

    // Load all components for search and radical options
    allComponents.value = getAllComponents()

    // Use all components as radical options (any component can be a radical)
    radicalOptions.value = allComponents.value
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle delete action
async function handleDelete() {
  const kanjiToDelete = kanji.value
  if (!kanjiToDelete) return

  isDeleting.value = true
  try {
    remove(kanjiToDelete.id)
    success(`Kanji "${kanjiToDelete.character}" deleted`)
    await router.push({ name: 'kanji-list' })
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
    isDeleting.value = false
  }
}

// Handle adding an existing component to the kanji
async function handleAddComponent(componentId: number) {
  if (!kanji.value) return

  try {
    const component = getComponentById(componentId)
    if (!component) {
      showError('Component not found')
      return
    }

    // Create the occurrence link
    const newOccurrence = createOccurrence(kanji.value.id, componentId)

    // Add to local state with full component data
    occurrences.value = [
      ...occurrences.value,
      {
        ...newOccurrence,
        component,
        position: null
      }
    ]

    await persist()
    success(`Added component "${component.character}"`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to add component')
  }
}

// Handle creating a new component and adding it to the kanji
async function handleCreateComponent(data: QuickCreateComponentData) {
  if (!kanji.value) return

  try {
    // Create the new component (strokeCount is null - can be set later on detail page)
    const newComponent = createComponent({
      character: data.character,
      strokeCount: null,
      shortMeaning: data.shortMeaning ?? null,
      canBeRadical: false
    })

    // Create the occurrence link
    const newOccurrence = createOccurrence(kanji.value.id, newComponent.id)

    // Add to local state
    occurrences.value = [
      ...occurrences.value,
      {
        ...newOccurrence,
        component: newComponent,
        position: null
      }
    ]

    // Update all components list
    allComponents.value = getAllComponents()

    await persist()
    success(`Created and added component "${newComponent.character}"`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to create component')
  }
}

// Handle removing a component occurrence
async function handleRemoveComponent(occurrenceId: number) {
  if (!kanji.value) return

  try {
    // Check if this is the radical occurrence
    const occurrence = occurrences.value.find((occ) => occ.id === occurrenceId)
    const wasRadical = occurrence?.isRadical ?? false

    // Remove from database
    removeOccurrence(occurrenceId)

    // Remove from local state
    occurrences.value = occurrences.value.filter(
      (occ) => occ.id !== occurrenceId
    )

    // If we removed the radical occurrence, clear the radical reference
    if (wasRadical) {
      const updatedKanji = getById(kanji.value.id)
      if (updatedKanji) {
        kanji.value = updatedKanji
      }
      radical.value = null
    }

    await persist()
    success('Component removed from kanji')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to remove component')
  }
}

// =============================================================================
// Field-Level Update Handlers
// =============================================================================

async function handleUpdateHeader(data: {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  if (!kanji.value) return

  try {
    kanji.value = updateHeaderFields(
      kanji.value.id,
      data.character,
      data.shortMeaning,
      data.searchKeywords
    )
    await persist()
    success('Header updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update header')
  }
}

async function handleUpdateBasicInfo(
  field: string,
  value: string | number | null
) {
  if (!kanji.value) return

  try {
    switch (field) {
      case 'strokeCount':
        kanji.value = updateStrokeCount(kanji.value.id, value as number)
        break
      case 'jlptLevel':
        kanji.value = updateJlptLevel(kanji.value.id, value as JlptLevel | null)
        break
      case 'joyoLevel':
        kanji.value = updateJoyoLevel(kanji.value.id, value as JoyoLevel | null)
        break
      case 'kenteiLevel':
        kanji.value = updateKenteiLevel(kanji.value.id, value as string | null)
        break
      case 'radicalId': {
        const newRadicalId = value as number | null

        if (newRadicalId === null) {
          // Clearing the radical: find the current radical occurrence and unset it
          const currentRadical = occurrences.value.find((occ) => occ.isRadical)
          if (currentRadical) {
            updateIsRadical(currentRadical.id, false)
            // Update local state immediately for UI
            const index = occurrences.value.findIndex(
              (occ) => occ.id === currentRadical.id
            )
            if (index !== -1 && occurrences.value[index]) {
              occurrences.value[index].isRadical = false
            }
          }
          kanji.value = updateRadicalId(kanji.value.id, null)
          radical.value = null
        } else {
          // Setting a new radical: ensure component occurrence exists
          let occurrence = occurrences.value.find(
            (occ) => occ.component.id === newRadicalId
          )

          if (!occurrence) {
            // Component not linked yet - create the occurrence first
            const newOccurrence = createOccurrence(kanji.value.id, newRadicalId)
            const component = getComponentById(newRadicalId)
            if (!component) {
              throw new Error('Component not found')
            }
            occurrence = {
              ...newOccurrence,
              component,
              position: null
            }
            occurrences.value = [...occurrences.value, occurrence]
          }

          // Set this occurrence as the radical (auto-syncs kanji.radical_id)
          updateIsRadical(occurrence.id, true)
          const updatedKanji = getById(kanji.value.id)
          if (updatedKanji) {
            kanji.value = updatedKanji
          }
          radical.value = getRadicalById(newRadicalId)

          // Update the occurrence's isRadical flag in local state for immediate UI update
          const index = occurrences.value.findIndex(
            (occ) => occ.id === occurrence.id
          )
          if (index !== -1 && occurrences.value[index]) {
            occurrences.value[index].isRadical = true
          }
        }
        break
      }
    }
    await persist()

    // Debounce the success toast to avoid multiple toasts for rapid updates
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Updated successfully')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update')
  }
}

async function handleUpdateNotesEtymology(notes: string | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateNotesEtymology(kanji.value.id, notes)
    await persist()
    success('Etymology notes updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update notes')
  }
}

async function handleUpdateNotesSemantic(notes: string | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateNotesSemantic(kanji.value.id, notes)
    await persist()
    success('Semantic notes updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update notes')
  }
}

async function handleUpdateNotesEducation(notes: string | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateNotesEducation(kanji.value.id, notes)
    await persist()
    success('Education notes updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update notes')
  }
}

async function handleUpdateNotesPersonal(notes: string | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateNotesPersonal(kanji.value.id, notes)
    await persist()
    success('Personal notes updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update notes')
  }
}

async function handleUpdateStrokeDiagram(diagram: Uint8Array | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateStrokeImages(
      kanji.value.id,
      diagram,
      kanji.value.strokeGifImage
    )
    await persist()
    success('Stroke diagram updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update image')
  }
}

async function handleUpdateStrokeGif(gif: Uint8Array | null) {
  if (!kanji.value) return

  try {
    kanji.value = updateStrokeImages(
      kanji.value.id,
      kanji.value.strokeDiagramImage,
      gif
    )
    await persist()
    success('Stroke animation updated')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update image')
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadKanji()
  } catch {
    // Error is already captured in initError
  }
})

// Reload when ID changes (for navigation between kanji)
watch(kanjiId, () => {
  if (isInitialized.value) {
    fetchError.value = null
    loadKanji()
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="kanji-root-detail-loading"
  >
    <BaseSpinner
      label="Loading kanji..."
      size="lg"
    />
    <p class="kanji-root-detail-loading-text">Loading kanji...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="kanji-root-detail-error"
  >
    <p class="kanji-root-detail-error-title">Failed to load</p>
    <p class="kanji-root-detail-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <KanjiSectionDetail
    v-else-if="isInitialized && kanji"
    :all-components="allComponents"
    :is-deleting="isDeleting"
    :is-destructive-mode="isDestructiveMode"
    :kanji="kanji"
    :occurrences="occurrences"
    :radical="radical"
    :radical-options="radicalOptions"
    @add-component="handleAddComponent"
    @create-component="handleCreateComponent"
    @delete="handleDelete"
    @remove-component="handleRemoveComponent"
    @update-basic-info="handleUpdateBasicInfo"
    @update-destructive-mode="isDestructiveMode = $event"
    @update-header="handleUpdateHeader"
    @update-notes-education="handleUpdateNotesEducation"
    @update-notes-etymology="handleUpdateNotesEtymology"
    @update-notes-personal="handleUpdateNotesPersonal"
    @update-notes-semantic="handleUpdateNotesSemantic"
    @update-stroke-diagram="handleUpdateStrokeDiagram"
    @update-stroke-gif="handleUpdateStrokeGif"
  />
</template>

<style scoped>
.kanji-root-detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.kanji-root-detail-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-root-detail-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.kanji-root-detail-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-root-detail-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
