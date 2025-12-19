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
import { useComponentFormRepository } from '@/shared/composables/use-component-form-repository'
import { useComponentGroupingRepository } from '@/shared/composables/use-component-grouping-repository'
import { useComponentOccurrenceRepository } from '@/shared/composables/use-component-occurrence-repository'
import { useComponentRepository } from '@/shared/composables/use-component-repository'
import { useDatabase } from '@/shared/composables/use-database'
import { useKanjiRepository } from '@/shared/composables/use-kanji-repository'
import { useToast } from '@/shared/composables/use-toast'

import ComponentSectionDetail from './ComponentSectionDetail.vue'

import type {
  Component,
  ComponentForm,
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
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
const { getById, getLinkedKanjiCount, remove, update } =
  useComponentRepository()
const {
  create: createKanji,
  getAll: getAllKanji,
  getById: getKanjiById
} = useKanjiRepository()
const {
  create: createOccurrence,
  getByComponentIdWithPosition,
  remove: removeOccurrence,
  reorderOccurrences: reorderOccurrenceIds,
  updateAnalysisNotes,
  updateFormAssignment,
  updateIsRadical,
  updatePosition
} = useComponentOccurrenceRepository()
const {
  create: createForm,
  getByComponentId: getFormsByComponentId,
  remove: removeFormById,
  reorder: reorderFormIds,
  update: updateFormById
} = useComponentFormRepository()
const {
  addMember: addGroupingMember,
  create: createGrouping,
  getByComponentId: getGroupingsByComponentId,
  getMembers: getGroupingMembers,
  remove: removeGroupingById,
  removeMember: removeGroupingMember,
  reorder: reorderGroupingIds,
  update: updateGroupingById
} = useComponentGroupingRepository()

// Database persistence
const { persist } = useDatabase()

// Toast notifications
const { success } = useToast()

// Local state
const component = ref<Component | null>(null)
const sourceKanji = ref<Kanji | null>(null)
const linkedKanjiCount = ref(0)
const occurrences = ref<OccurrenceWithKanji[]>([])
const forms = ref<ComponentForm[]>([])
const groupings = ref<ComponentGroupingWithMembers[]>([])
const groupingMembers = ref<Map<number, ComponentGroupingMember[]>>(new Map())
const allKanji = ref<Kanji[]>([])
const fetchError = ref<Error | null>(null)
const isDeleting = ref(false)
const isDestructiveMode = ref(false)
const updateToastTimeout = ref<NodeJS.Timeout | null>(null)

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

      // Load forms (visual variants)
      forms.value = getFormsByComponentId(componentId.value)

      // Load groupings (pattern analysis groups)
      groupings.value = getGroupingsByComponentId(componentId.value)

      // Load members for each grouping
      const membersMap = new Map<number, ComponentGroupingMember[]>()
      for (const grouping of groupings.value) {
        membersMap.set(grouping.id, getGroupingMembers(grouping.id))
      }
      groupingMembers.value = membersMap

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

// Handle form assignment update
async function handleFormAssignmentUpdate(
  occurrenceId: number,
  formId: number | null
) {
  try {
    updateFormAssignment(occurrenceId, formId)
    await persist()
    // Update local state
    const occurrence = occurrences.value.find((o) => o.id === occurrenceId)
    if (occurrence) {
      occurrence.componentFormId = formId
    }
    success('Form assignment updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle occurrence reordering
async function handleReorderOccurrences(occurrenceIds: number[]) {
  try {
    reorderOccurrenceIds(occurrenceIds)
    await persist()
    // Reorder local state
    occurrences.value = occurrenceIds
      .map((id) => occurrences.value.find((o) => o.id === id))
      .filter((o): o is OccurrenceWithKanji => o !== undefined)
    success('Order updated')
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
      searchKeywords: data.searchKeywords ?? null,
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

// Handle removing kanji link
function handleRemoveKanji(occurrenceId: number) {
  try {
    const occurrence = occurrences.value.find((o) => o.id === occurrenceId)
    if (!occurrence) {
      throw new Error('Occurrence not found')
    }

    removeOccurrence(occurrenceId)

    // Remove from local state
    occurrences.value = occurrences.value.filter((o) => o.id !== occurrenceId)
    linkedKanjiCount.value -= 1

    success(`Kanji "${occurrence.kanji.character}" unlinked from component`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle destructive mode toggle
function handleDestructiveModeUpdate(enabled: boolean) {
  isDestructiveMode.value = enabled
}

// Handle header update (character, short_meaning, search_keywords)
async function handleHeaderUpdate(data: {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  if (!component.value) return

  try {
    const updated = update(component.value.id, {
      character: data.character,
      shortMeaning: data.shortMeaning,
      searchKeywords: data.searchKeywords
    })
    await persist()
    component.value = updated
    success('Header updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle basic info update (individual field)
async function handleBasicInfoUpdate(
  field: string,
  value: string | number | boolean | null
) {
  if (!component.value) return

  try {
    const updateData: Record<string, unknown> = { [field]: value }
    const updated = update(component.value.id, updateData)
    await persist()
    component.value = updated

    // Update source kanji reference if sourceKanjiId changed
    if (field === 'sourceKanjiId') {
      sourceKanji.value = typeof value === 'number' ? getKanjiById(value) : null
    }

    // Debounce the success toast to avoid multiple toasts for rapid updates
    if (updateToastTimeout.value) clearTimeout(updateToastTimeout.value)
    updateToastTimeout.value = setTimeout(() => {
      success('Basic info updated')
      updateToastTimeout.value = null
    }, 500)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle description update
async function handleDescriptionUpdate(description: string | null) {
  if (!component.value) return

  try {
    const updated = update(component.value.id, { description })
    await persist()
    component.value = updated
    success('Description updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle adding a new form
async function handleAddForm(data: {
  formCharacter: string
  formName: string | null
  strokeCount: number | null
  usageNotes: string | null
}) {
  if (!component.value) return

  try {
    const newForm = createForm({
      componentId: component.value.id,
      formCharacter: data.formCharacter,
      formName: data.formName,
      strokeCount: data.strokeCount,
      usageNotes: data.usageNotes
    })
    await persist()
    forms.value.push(newForm)
    success(`Form "${data.formCharacter}" added`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle updating a form
async function handleUpdateForm(
  id: number,
  data: {
    formName: string | null
    strokeCount: number | null
    usageNotes: string | null
  }
) {
  try {
    updateFormById(id, data)
    await persist()
    // Update local state
    const formIndex = forms.value.findIndex((f) => f.id === id)
    if (formIndex !== -1) {
      const existingForm = forms.value[formIndex]
      if (existingForm) {
        forms.value[formIndex] = {
          ...existingForm,
          formName: data.formName,
          strokeCount: data.strokeCount,
          usageNotes: data.usageNotes
        }
      }
    }
    success('Form updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle removing a form
async function handleRemoveForm(id: number) {
  try {
    const form = forms.value.find((f) => f.id === id)
    removeFormById(id)
    await persist()
    forms.value = forms.value.filter((f) => f.id !== id)
    success(`Form "${form?.formCharacter ?? ''}" removed`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle reordering forms
async function handleReorderForms(formIds: number[]) {
  try {
    reorderFormIds(formIds)
    await persist()
    // Reorder local state
    forms.value = formIds
      .map((id) => forms.value.find((f) => f.id === id))
      .filter((f): f is ComponentForm => f !== undefined)
    success('Forms reordered')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle adding a new grouping
async function handleAddGrouping(data: {
  name: string
  description: string | null
}) {
  if (!component.value) return

  try {
    const newGrouping = createGrouping({
      componentId: component.value.id,
      name: data.name,
      description: data.description
    })
    await persist()
    groupings.value.push({
      ...newGrouping,
      occurrenceCount: 0
    })
    groupingMembers.value.set(newGrouping.id, [])
    success(`Grouping "${data.name}" created`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle updating a grouping
async function handleUpdateGrouping(
  id: number,
  data: { name: string; description: string | null }
) {
  try {
    updateGroupingById(id, data)
    await persist()
    // Update local state
    const groupingIndex = groupings.value.findIndex((g) => g.id === id)
    if (groupingIndex !== -1) {
      const existingGrouping = groupings.value[groupingIndex]
      if (existingGrouping) {
        groupings.value[groupingIndex] = {
          ...existingGrouping,
          name: data.name,
          description: data.description
        }
      }
    }
    success('Grouping updated')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle removing a grouping
async function handleRemoveGrouping(id: number) {
  try {
    const grouping = groupings.value.find((g) => g.id === id)
    removeGroupingById(id)
    await persist()
    groupings.value = groupings.value.filter((g) => g.id !== id)
    groupingMembers.value.delete(id)
    success(`Grouping "${grouping?.name ?? ''}" removed`)
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle reordering groupings
async function handleReorderGroupings(groupingIds: number[]) {
  try {
    reorderGroupingIds(groupingIds)
    await persist()
    // Reorder local state
    groupings.value = groupingIds
      .map((id) => groupings.value.find((g) => g.id === id))
      .filter((g): g is ComponentGroupingWithMembers => g !== undefined)
    success('Groupings reordered')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle adding a member to a grouping
async function handleAddGroupingMember(
  groupingId: number,
  occurrenceId: number
) {
  try {
    addGroupingMember(groupingId, occurrenceId)
    await persist()

    // Update local state
    const members = groupingMembers.value.get(groupingId) ?? []
    const newMember: ComponentGroupingMember = {
      id: Date.now(), // Temporary ID
      groupingId,
      occurrenceId,
      displayOrder: members.length
    }
    groupingMembers.value.set(groupingId, [...members, newMember])

    // Update occurrence count
    const grouping = groupings.value.find((g) => g.id === groupingId)
    if (grouping) {
      grouping.occurrenceCount += 1
    }

    success('Kanji added to grouping')
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle removing a member from a grouping
async function handleRemoveGroupingMember(
  groupingId: number,
  occurrenceId: number
) {
  try {
    removeGroupingMember(groupingId, occurrenceId)
    await persist()

    // Update local state
    const members = groupingMembers.value.get(groupingId) ?? []
    groupingMembers.value.set(
      groupingId,
      members.filter((m) => m.occurrenceId !== occurrenceId)
    )

    // Update occurrence count
    const grouping = groupings.value.find((g) => g.id === groupingId)
    if (grouping) {
      grouping.occurrenceCount -= 1
    }

    success('Kanji removed from grouping')
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
    :forms="forms"
    :grouping-members="groupingMembers"
    :groupings="groupings"
    :is-deleting="isDeleting"
    :is-destructive-mode="isDestructiveMode"
    :linked-kanji-count="linkedKanjiCount"
    :occurrences="occurrences"
    :source-kanji="sourceKanji"
    @add-form="handleAddForm"
    @add-grouping="handleAddGrouping"
    @add-grouping-member="handleAddGroupingMember"
    @add-kanji="handleAddKanji"
    @create-kanji="handleCreateKanji"
    @delete="handleDelete"
    @remove-form="handleRemoveForm"
    @remove-grouping="handleRemoveGrouping"
    @remove-grouping-member="handleRemoveGroupingMember"
    @remove-kanji="handleRemoveKanji"
    @reorder-forms="handleReorderForms"
    @reorder-groupings="handleReorderGroupings"
    @reorder-occurrences="handleReorderOccurrences"
    @update-basic-info="handleBasicInfoUpdate"
    @update-description="handleDescriptionUpdate"
    @update-destructive-mode="handleDestructiveModeUpdate"
    @update-form="handleUpdateForm"
    @update-grouping="handleUpdateGrouping"
    @update-header="handleHeaderUpdate"
    @update:analysis-notes="handleAnalysisNotesUpdate"
    @update:form="handleFormAssignmentUpdate"
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
