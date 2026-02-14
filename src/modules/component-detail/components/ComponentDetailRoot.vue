<script setup lang="ts">
/**
 * ComponentDetailRoot
 *
 * Root component for component detail page. Orchestrates data fetching
 * and coordinates section components.
 */

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { BaseSpinner } from '@/base/components'

import {
  useComponentFormRepository,
  useComponentOccurrenceRepository,
  useComponentRepository
} from '@/api/component'
import { useKanjiRepository } from '@/api/kanji'
import { usePositionTypeRepository } from '@/api/position'

import { useToast } from '@/shared/composables'

import { ROUTES } from '@/router/routes'
import { useComponentDetailFormHandlers } from '../composables/use-component-detail-form-handlers'
import { useComponentDetailOccurrenceHandlers } from '../composables/use-component-detail-occurrence-handlers'

import ComponentDetailSectionActions from './ComponentDetailSectionActions.vue'
import ComponentDetailSectionBasicInfo from './ComponentDetailSectionBasicInfo.vue'
import ComponentDetailSectionDescription from './ComponentDetailSectionDescription.vue'
import ComponentDetailSectionForms from './ComponentDetailSectionForms.vue'
import ComponentDetailSectionHeadline from './ComponentDetailSectionHeadline.vue'
import ComponentDetailSectionOccurrences from './ComponentDetailSectionOccurrences.vue'

import type {
  BasicInfoSaveData,
  HeadlineSaveData
} from '../component-detail-types'
import type {
  Component,
  ComponentForm,
  OccurrenceWithKanji
} from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { PositionType } from '@/api/position'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const componentRepo = useComponentRepository()
const formRepo = useComponentFormRepository()
const occurrenceRepo = useComponentOccurrenceRepository()
const kanjiRepo = useKanjiRepository()
const positionTypeRepo = usePositionTypeRepository()

const component = ref<Component | null>(null)
const forms = ref<ComponentForm[]>([])
const occurrences = ref<OccurrenceWithKanji[]>([])
const positionTypes = ref<PositionType[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isDestructiveMode = ref(false)
const isDeleting = ref(false)

// Kanji data for basic info section and occurrences
const kanjiOptions = ref<Kanji[]>([])
const sourceKanji = ref<Kanji | null>(null)

const componentId = computed(() => Number(route.params['id']))
const componentIdForHandlers = computed(() =>
  component.value ? component.value.id : null
)

// ============================================================================
// Extracted Handler Composables
// ============================================================================

const { handleFormAdd, handleFormRemove, handleFormReorder, handleFormUpdate } =
  useComponentDetailFormHandlers({
    componentId: componentIdForHandlers,
    forms
  })

const {
  handleOccurrenceAdd,
  handleOccurrenceCreate,
  handleOccurrenceRemove,
  handleOccurrenceReorder,
  handleOccurrenceUpdate
} = useComponentDetailOccurrenceHandlers({
  componentId: componentIdForHandlers,
  occurrences,
  kanjiOptions
})

// ============================================================================
// Data Loading
// ============================================================================

function loadComponent(): void {
  isLoading.value = true
  loadError.value = null
  try {
    component.value = componentRepo.getById(componentId.value)
    if (!component.value) {
      loadError.value = `Component with ID ${String(componentId.value)} not found`
      return
    }
    kanjiOptions.value = kanjiRepo.getAll()
    sourceKanji.value = component.value.sourceKanjiId
      ? (kanjiRepo.getById(component.value.sourceKanjiId) ?? null)
      : null
    forms.value = formRepo.getByParentId(componentId.value)
    occurrences.value = occurrenceRepo.getByComponentIdWithKanji(
      componentId.value
    )
    positionTypes.value = positionTypeRepo.getAll()
  } catch (err) {
    loadError.value =
      err instanceof Error ? err.message : 'Failed to load component'
  } finally {
    isLoading.value = false
  }
}

watch(
  componentId,
  () => {
    loadComponent()
  },
  { immediate: true }
)

// ============================================================================
// Inline Handlers (not extracted - simple operations)
// ============================================================================

function handleHeadlineSave(data: HeadlineSaveData): void {
  if (!component.value) return
  try {
    componentRepo.update(component.value.id, data)
    component.value = { ...component.value, ...data }
    toast.success('Component updated successfully')
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to update component'
    )
  }
}

function handleBasicInfoSave(data: BasicInfoSaveData): void {
  if (!component.value) return
  try {
    const previousSourceKanjiId = component.value.sourceKanjiId
    componentRepo.update(component.value.id, data)
    component.value = { ...component.value, ...data }
    if (data.sourceKanjiId !== previousSourceKanjiId) {
      sourceKanji.value = data.sourceKanjiId
        ? (kanjiRepo.getById(data.sourceKanjiId) ?? null)
        : null
    }
    toast.success('Component updated successfully')
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to update component'
    )
  }
}

function handleDescriptionSave(value: string | null): void {
  if (!component.value) return
  try {
    componentRepo.updateField(component.value.id, 'description', value)
    component.value = { ...component.value, description: value }
    toast.success('Description saved')
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to save description'
    )
  }
}

function handleDelete(): void {
  if (!component.value) return
  isDeleting.value = true
  try {
    componentRepo.remove(component.value.id)
    toast.success('Component deleted successfully')
    void router.push(ROUTES.COMPONENT_LIST)
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to delete component'
    )
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="component-detail-root">
    <div class="component-detail-root-container">
      <div
        v-if="isLoading"
        class="component-detail-root-loading"
      >
        <BaseSpinner size="lg" />
      </div>

      <div
        v-else-if="loadError"
        class="component-detail-root-error"
      >
        <p>{{ loadError }}</p>
      </div>

      <template v-else-if="component">
        <ComponentDetailSectionHeadline
          :component="component"
          @save="handleHeadlineSave"
        />

        <ComponentDetailSectionBasicInfo
          :component="component"
          :kanji-options="kanjiOptions"
          :source-kanji="sourceKanji"
          @save="handleBasicInfoSave"
        />

        <ComponentDetailSectionDescription
          :description="component.description"
          @save="handleDescriptionSave"
        />

        <ComponentDetailSectionForms
          :component-id="component.id"
          :forms="forms"
          :is-destructive-mode="isDestructiveMode"
          @add="handleFormAdd"
          @remove="handleFormRemove"
          @reorder="handleFormReorder"
          @update="handleFormUpdate"
        />

        <ComponentDetailSectionOccurrences
          :all-kanji="kanjiOptions"
          :component-id="component.id"
          :forms="forms"
          :is-destructive-mode="isDestructiveMode"
          :occurrences="occurrences"
          :position-types="positionTypes"
          @add="handleOccurrenceAdd"
          @create="handleOccurrenceCreate"
          @remove="handleOccurrenceRemove"
          @reorder="handleOccurrenceReorder"
          @update="handleOccurrenceUpdate"
        />

        <ComponentDetailSectionActions
          v-model:destructive-mode="isDestructiveMode"
          :is-deleting="isDeleting"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.component-detail-root {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.component-detail-root-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 768px;
}

.component-detail-root-loading,
.component-detail-root-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
