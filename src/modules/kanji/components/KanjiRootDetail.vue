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
import { useClassificationRepository } from '@/shared/composables/use-classification-repository'
import { useComponentOccurrenceRepository } from '@/shared/composables/use-component-occurrence-repository'
import { useComponentRepository } from '@/shared/composables/use-component-repository'
import { useDatabase } from '@/shared/composables/use-database'
import { useKanjiRepository } from '@/shared/composables/use-kanji-repository'
import { useMeaningRepository } from '@/shared/composables/use-meaning-repository'
import { useRadicalRepository } from '@/shared/composables/use-radical-repository'
import { useReadingRepository } from '@/shared/composables/use-reading-repository'
import { useToast } from '@/shared/composables/use-toast'
import { useVocabKanjiRepository } from '@/shared/composables/use-vocab-kanji-repository'
import { useVocabularyRepository } from '@/shared/composables/use-vocabulary-repository'

import KanjiSectionDetail from './KanjiSectionDetail.vue'

import type {
  ClassificationType,
  Component,
  JlptLevel,
  JoyoLevel,
  Kanji,
  KanjiClassificationWithType,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  KunReading,
  OccurrenceWithComponent,
  OnReading,
  ReadingLevel,
  Vocabulary
} from '@/shared/types/database-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'
import type { QuickCreateVocabularyData } from '@/shared/validation/quick-create-vocabulary-schema'

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
const {
  createKunReading,
  createOnReading,
  getKunReadingsByKanjiId,
  getOnReadingsByKanjiId,
  removeKunReading,
  removeOnReading,
  reorderKunReadings,
  reorderOnReadings,
  updateKunReading,
  updateOnReading
} = useReadingRepository()
const {
  addMeaningToGroup,
  createMeaning,
  createReadingGroup,
  deleteEmptyGroups,
  getGroupMembersByKanjiId,
  getMeaningsByKanjiId,
  getReadingGroupsByKanjiId,
  removeAllReadingGroups,
  removeMeaning,
  removeMeaningFromGroup,
  removeReadingGroup,
  reorderMeanings,
  reorderMeaningsInGroup,
  reorderReadingGroups,
  updateMeaning,
  updateReadingGroup
} = useMeaningRepository()
const {
  createClassification,
  getAllClassificationTypes,
  getClassificationsByKanjiId,
  removeClassification,
  reorderClassifications,
  updateClassification
} = useClassificationRepository()
const {
  create: createVocabKanjiLink,
  getByKanjiIdWithVocab,
  removeByVocabAndKanji
} = useVocabKanjiRepository()
const { create: createVocabulary, getAll: getAllVocabulary } =
  useVocabularyRepository()

// Toast notifications
const { error: showError, success } = useToast()

// Local state
const kanji = ref<Kanji | null>(null)
const radical = ref<Component | null>(null)
const occurrences = ref<OccurrenceWithComponent[]>([])
const allComponents = ref<Component[]>([])
const radicalOptions = ref<Component[]>([])
const onReadings = ref<OnReading[]>([])
const kunReadings = ref<KunReading[]>([])
const meanings = ref<KanjiMeaning[]>([])
const readingGroups = ref<KanjiMeaningReadingGroup[]>([])
const groupMembers = ref<KanjiMeaningGroupMember[]>([])
const classifications = ref<KanjiClassificationWithType[]>([])
const classificationTypes = ref<ClassificationType[]>([])
const vocabularyList = ref<Vocabulary[]>([])
const allVocabulary = ref<Vocabulary[]>([])
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

    // Load readings
    onReadings.value = getOnReadingsByKanjiId(kanji.value.id)
    kunReadings.value = getKunReadingsByKanjiId(kanji.value.id)

    // Load meanings
    meanings.value = getMeaningsByKanjiId(kanji.value.id)
    readingGroups.value = getReadingGroupsByKanjiId(kanji.value.id)
    groupMembers.value = getGroupMembersByKanjiId(kanji.value.id)

    // Load classifications
    classifications.value = getClassificationsByKanjiId(kanji.value.id)
    classificationTypes.value = getAllClassificationTypes()

    // Load vocabulary that uses this kanji
    const vocabKanjiLinks = getByKanjiIdWithVocab(kanji.value.id)
    vocabularyList.value = vocabKanjiLinks.map((vk) => vk.vocabulary)
    allVocabulary.value = getAllVocabulary()
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

// =============================================================================
// Reading Handlers
// =============================================================================

async function handleAddOnReading(reading: string, level: ReadingLevel) {
  if (!kanji.value) return

  try {
    const newReading = createOnReading({
      kanjiId: kanji.value.id,
      reading,
      readingLevel: level
    })
    onReadings.value = [...onReadings.value, newReading]
    await persist()
    success('On-yomi reading added')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to add reading')
  }
}

async function handleUpdateOnReading(
  id: number,
  reading: string,
  level: ReadingLevel
) {
  if (!kanji.value) return

  try {
    const updated = updateOnReading(id, { reading, readingLevel: level })
    onReadings.value = onReadings.value.map((r) => (r.id === id ? updated : r))
    await persist()
    // Debounce toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Readings saved')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update reading')
  }
}

async function handleRemoveOnReading(id: number) {
  if (!kanji.value) return

  try {
    removeOnReading(id)
    onReadings.value = onReadings.value.filter((r) => r.id !== id)
    await persist()
    success('On-yomi reading deleted')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete reading')
  }
}

async function handleReorderOnReadings(readingIds: number[]) {
  if (!kanji.value) return

  try {
    reorderOnReadings(kanji.value.id, readingIds)
    // Reload to get updated order
    onReadings.value = getOnReadingsByKanjiId(kanji.value.id)
    await persist()
    // Debounce toast (same as update, to consolidate multiple save operations)
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Readings saved')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder readings')
  }
}

async function handleAddKunReading(
  reading: string,
  okurigana: string | null,
  level: ReadingLevel
) {
  if (!kanji.value) return

  try {
    const newReading = createKunReading({
      kanjiId: kanji.value.id,
      reading,
      okurigana,
      readingLevel: level
    })
    kunReadings.value = [...kunReadings.value, newReading]
    await persist()
    success('Kun-yomi reading added')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to add reading')
  }
}

async function handleUpdateKunReading(
  id: number,
  reading: string,
  okurigana: string | null,
  level: ReadingLevel
) {
  if (!kanji.value) return

  try {
    const updated = updateKunReading(id, {
      reading,
      okurigana,
      readingLevel: level
    })
    kunReadings.value = kunReadings.value.map((r) =>
      r.id === id ? updated : r
    )
    await persist()
    // Debounce toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Readings saved')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update reading')
  }
}

async function handleRemoveKunReading(id: number) {
  if (!kanji.value) return

  try {
    removeKunReading(id)
    kunReadings.value = kunReadings.value.filter((r) => r.id !== id)
    await persist()
    success('Kun-yomi reading deleted')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete reading')
  }
}

async function handleReorderKunReadings(readingIds: number[]) {
  if (!kanji.value) return

  try {
    reorderKunReadings(kanji.value.id, readingIds)
    // Reload to get updated order
    kunReadings.value = getKunReadingsByKanjiId(kanji.value.id)
    await persist()
    // Debounce toast (same as update, to consolidate multiple save operations)
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Readings saved')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder readings')
  }
}

// =============================================================================
// Meaning Handlers
// =============================================================================

async function handleAddMeaning(
  meaningText: string,
  additionalInfo: string | null
) {
  if (!kanji.value) return

  try {
    const newMeaning = createMeaning({
      kanjiId: kanji.value.id,
      meaningText,
      additionalInfo
    })
    meanings.value = [...meanings.value, newMeaning]
    await persist()
    success('Meaning added')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to add meaning')
  }
}

async function handleUpdateMeaning(
  id: number,
  meaningText: string,
  additionalInfo: string | null
) {
  if (!kanji.value) return

  try {
    const updated = updateMeaning(id, { meaningText, additionalInfo })
    meanings.value = meanings.value.map((m) => (m.id === id ? updated : m))
    await persist()
    // Debounce toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Meaning updated')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update meaning')
  }
}

async function handleRemoveMeaning(id: number) {
  if (!kanji.value) return

  try {
    removeMeaning(id)
    meanings.value = meanings.value.filter((m) => m.id !== id)
    // Also remove from group members
    groupMembers.value = groupMembers.value.filter((gm) => gm.meaningId !== id)
    await persist()
    success('Meaning deleted')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to delete meaning')
  }
}

async function handleReorderMeanings(meaningIds: number[]) {
  if (!kanji.value) return

  try {
    reorderMeanings(kanji.value.id, meaningIds)
    meanings.value = getMeaningsByKanjiId(kanji.value.id)
    await persist()
    success('Meanings reordered')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder meanings')
  }
}

async function handleEnableGrouping() {
  if (!kanji.value) return

  try {
    // Create first reading group
    const newGroup = createReadingGroup({
      kanjiId: kanji.value.id,
      readingText: ''
    })
    readingGroups.value = [...readingGroups.value, newGroup]
    await persist()
    success('Reading grouping enabled')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to enable grouping')
  }
}

async function handleDisableGrouping() {
  if (!kanji.value) return

  try {
    removeAllReadingGroups(kanji.value.id)
    readingGroups.value = []
    groupMembers.value = []
    await persist()
    success('Reading groupings removed')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to disable grouping')
  }
}

async function handleAddReadingGroup() {
  if (!kanji.value) return

  try {
    const newGroup = createReadingGroup({
      kanjiId: kanji.value.id,
      readingText: ''
    })
    readingGroups.value = [...readingGroups.value, newGroup]
    await persist()
    success('Reading group added')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to add reading group'
    )
  }
}

async function handleUpdateReadingGroup(id: number, readingText: string) {
  if (!kanji.value) return

  try {
    const updated = updateReadingGroup(id, { readingText })
    readingGroups.value = readingGroups.value.map((g) =>
      g.id === id ? updated : g
    )
    await persist()
    // Debounce toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Reading group updated')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to update reading group'
    )
  }
}

async function handleRemoveReadingGroup(id: number) {
  if (!kanji.value) return

  try {
    removeReadingGroup(id)
    readingGroups.value = readingGroups.value.filter((g) => g.id !== id)
    // Also remove members
    groupMembers.value = groupMembers.value.filter(
      (gm) => gm.readingGroupId !== id
    )
    await persist()
    success('Reading group deleted')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to delete reading group'
    )
  }
}

async function handleReorderReadingGroups(groupIds: number[]) {
  if (!kanji.value) return

  try {
    reorderReadingGroups(kanji.value.id, groupIds)
    readingGroups.value = getReadingGroupsByKanjiId(kanji.value.id)
    await persist()
    success('Reading groups reordered')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder groups')
  }
}

async function handleAssignMeaningToGroup(meaningId: number, groupId: number) {
  if (!kanji.value) return

  try {
    const newMember = addMeaningToGroup({
      readingGroupId: groupId,
      meaningId
    })
    groupMembers.value = [...groupMembers.value, newMember]
    await persist()
    success('Meaning assigned to group')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to assign meaning')
  }
}

async function handleRemoveMeaningFromGroup(
  meaningId: number,
  groupId: number
) {
  if (!kanji.value) return

  try {
    removeMeaningFromGroup(groupId, meaningId)
    groupMembers.value = groupMembers.value.filter(
      (gm) => !(gm.readingGroupId === groupId && gm.meaningId === meaningId)
    )
    await persist()
    success('Meaning removed from group')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to remove from group'
    )
  }
}

async function handleReorderMeaningsInGroup(
  groupId: number,
  meaningIds: number[]
) {
  if (!kanji.value) return

  try {
    reorderMeaningsInGroup(groupId, meaningIds)
    // Reload group members
    groupMembers.value = getGroupMembersByKanjiId(kanji.value.id)
    await persist()
    success('Meanings reordered in group')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to reorder in group')
  }
}

async function handleSaveMeanings() {
  if (!kanji.value) return

  try {
    // Delete empty groups on save
    deleteEmptyGroups(kanji.value.id)
    // Reload to get cleaned up data
    readingGroups.value = getReadingGroupsByKanjiId(kanji.value.id)
    groupMembers.value = getGroupMembersByKanjiId(kanji.value.id)
    await persist()
    success('Meanings saved')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to save meanings')
  }
}

// =============================================================================
// Classification Handlers
// =============================================================================

async function handleAddClassification(classificationTypeId: number) {
  if (!kanji.value) return

  try {
    createClassification({
      kanjiId: kanji.value.id,
      classificationTypeId
    })
    // Reload classifications with full type data
    classifications.value = getClassificationsByKanjiId(kanji.value.id)
    await persist()
    success('Classification added')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to add classification'
    )
  }
}

async function handleUpdateClassification(
  id: number,
  classificationTypeId: number
) {
  if (!kanji.value) return

  try {
    updateClassification(id, { classificationTypeId })
    // Reload classifications with full type data
    classifications.value = getClassificationsByKanjiId(kanji.value.id)
    await persist()
    // Debounce toast
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Classification updated')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to update classification'
    )
  }
}

async function handleRemoveClassification(id: number) {
  if (!kanji.value) return

  try {
    removeClassification(id)
    classifications.value = classifications.value.filter((c) => c.id !== id)
    await persist()
    success('Classification removed')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to remove classification'
    )
  }
}

async function handleReorderClassifications(classificationIds: number[]) {
  if (!kanji.value) return

  try {
    reorderClassifications(kanji.value.id, classificationIds)
    // Reload classifications with full type data
    classifications.value = getClassificationsByKanjiId(kanji.value.id)
    await persist()
    success('Classifications reordered')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to reorder classifications'
    )
  }
}

// =============================================================================
// Vocabulary Handlers
// =============================================================================

async function handleAddVocabulary(vocabularyId: number) {
  if (!kanji.value) return

  try {
    // Check if already linked
    const existing = vocabularyList.value.find((v) => v.id === vocabularyId)
    if (existing) {
      showError('Vocabulary already linked to this kanji')
      return
    }

    createVocabKanjiLink(vocabularyId, kanji.value.id)
    await persist()
    // Reload vocabulary list
    const vocabKanjiLinks = getByKanjiIdWithVocab(kanji.value.id)
    vocabularyList.value = vocabKanjiLinks.map((vk) => vk.vocabulary)
    success('Vocabulary linked to kanji')
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to link vocabulary')
  }
}

async function handleCreateVocabulary(data: QuickCreateVocabularyData) {
  if (!kanji.value) return

  try {
    // Create the vocabulary
    const newVocab = createVocabulary({
      word: data.word,
      kana: data.kana ?? null,
      shortMeaning: data.shortMeaning ?? null,
      searchKeywords: null
    })

    // Link to this kanji
    createVocabKanjiLink(newVocab.id, kanji.value.id)
    await persist()

    // Reload all vocabulary and linked list
    allVocabulary.value = getAllVocabulary()
    const vocabKanjiLinks = getByKanjiIdWithVocab(kanji.value.id)
    vocabularyList.value = vocabKanjiLinks.map((vk) => vk.vocabulary)

    success(`Created "${data.word}" and linked to kanji`)
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to create vocabulary'
    )
  }
}

async function handleRemoveVocabulary(vocabularyId: number) {
  if (!kanji.value) return

  try {
    removeByVocabAndKanji(vocabularyId, kanji.value.id)
    await persist()
    // Update local state
    vocabularyList.value = vocabularyList.value.filter(
      (v) => v.id !== vocabularyId
    )
    success('Vocabulary unlinked from kanji')
  } catch (err) {
    showError(
      err instanceof Error ? err.message : 'Failed to unlink vocabulary'
    )
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
    :all-vocabulary="allVocabulary"
    :classification-types="classificationTypes"
    :classifications="classifications"
    :group-members="groupMembers"
    :is-deleting="isDeleting"
    :is-destructive-mode="isDestructiveMode"
    :kanji="kanji"
    :kun-readings="kunReadings"
    :meanings="meanings"
    :occurrences="occurrences"
    :on-readings="onReadings"
    :radical="radical"
    :radical-options="radicalOptions"
    :reading-groups="readingGroups"
    :vocabulary-list="vocabularyList"
    @add-classification="handleAddClassification"
    @add-component="handleAddComponent"
    @add-kun-reading="handleAddKunReading"
    @add-meaning="handleAddMeaning"
    @add-on-reading="handleAddOnReading"
    @add-reading-group="handleAddReadingGroup"
    @add-vocabulary="handleAddVocabulary"
    @assign-meaning-to-group="handleAssignMeaningToGroup"
    @create-component="handleCreateComponent"
    @create-vocabulary="handleCreateVocabulary"
    @delete="handleDelete"
    @disable-grouping="handleDisableGrouping"
    @enable-grouping="handleEnableGrouping"
    @remove-classification="handleRemoveClassification"
    @remove-component="handleRemoveComponent"
    @remove-kun-reading="handleRemoveKunReading"
    @remove-meaning="handleRemoveMeaning"
    @remove-meaning-from-group="handleRemoveMeaningFromGroup"
    @remove-on-reading="handleRemoveOnReading"
    @remove-reading-group="handleRemoveReadingGroup"
    @remove-vocabulary="handleRemoveVocabulary"
    @reorder-classifications="handleReorderClassifications"
    @reorder-kun-readings="handleReorderKunReadings"
    @reorder-meanings="handleReorderMeanings"
    @reorder-meanings-in-group="handleReorderMeaningsInGroup"
    @reorder-on-readings="handleReorderOnReadings"
    @reorder-reading-groups="handleReorderReadingGroups"
    @save-meanings="handleSaveMeanings"
    @update-basic-info="handleUpdateBasicInfo"
    @update-classification="handleUpdateClassification"
    @update-destructive-mode="isDestructiveMode = $event"
    @update-header="handleUpdateHeader"
    @update-kun-reading="handleUpdateKunReading"
    @update-meaning="handleUpdateMeaning"
    @update-notes-education="handleUpdateNotesEducation"
    @update-notes-etymology="handleUpdateNotesEtymology"
    @update-notes-personal="handleUpdateNotesPersonal"
    @update-notes-semantic="handleUpdateNotesSemantic"
    @update-on-reading="handleUpdateOnReading"
    @update-reading-group="handleUpdateReadingGroup"
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
