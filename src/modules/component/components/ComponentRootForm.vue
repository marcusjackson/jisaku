<script setup lang="ts">
/**
 * ComponentRootForm
 *
 * Root component for the component create/edit form.
 * Handles database initialization, form submission, and navigation.
 * Uses mode prop to switch between create and edit functionality.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import { useKanjiRepository } from '@/modules/kanji-list/composables/use-kanji-repository'
import { useComponentForm } from '../composables/use-component-form'
import { useComponentRepository } from '../composables/use-component-repository'

import ComponentSectionForm from './ComponentSectionForm.vue'

import type { ComponentFormData } from '../component-form-schema'
import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'
import type { Component } from '@/shared/types/database-types'

interface Props {
  /** Form mode (create or edit) */
  mode: 'create' | 'edit'
}

const props = defineProps<Props>()

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing, persist } =
  useDatabase()

// Repositories
const { create, getById, update } = useComponentRepository()
const { getAll: getAllKanji } = useKanjiRepository()

// Toast notifications
const { error: showError, success: showSuccess } = useToast()

// Local state
const component = ref<Component | null>(null)
const fetchError = ref<Error | null>(null)
const kanjiOptions = ref<ComboboxOption[]>([])

// Computed component ID from route params (only for edit mode)
const componentId = computed(() => {
  if (props.mode !== 'edit') return NaN
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Back URL for navigation
const backUrl = computed(() => {
  if (props.mode === 'edit' && !Number.isNaN(componentId.value)) {
    return `/components/${String(componentId.value)}`
  }
  return '/components'
})

// Load kanji options for the combobox
function loadKanjiOptions() {
  const allKanji = getAllKanji()
  kanjiOptions.value = allKanji.map((k) => ({
    label: k.character,
    value: k.id
  }))
}

// Fetch component by ID (for edit mode)
function loadComponent() {
  if (props.mode !== 'edit') return

  if (Number.isNaN(componentId.value)) {
    fetchError.value = new Error('Invalid component ID')
    return
  }

  try {
    component.value = getById(componentId.value)
    if (!component.value) {
      fetchError.value = new Error('Component not found')
    }
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Form setup (will be initialized once component is loaded in edit mode)
const formInitialized = ref(false)

const { isSubmitting, setFieldValue, submitForm } = useComponentForm({
  onSubmit: handleSubmit
})

async function handleSubmit(values: ComponentFormData) {
  try {
    if (props.mode === 'create') {
      const input = {
        character: values.character,
        strokeCount: values.strokeCount ?? null,
        shortMeaning: values.shortMeaning ?? null,
        searchKeywords: values.searchKeywords ?? null,
        description: values.description ?? null,
        sourceKanjiId: values.sourceKanjiId ?? null,
        canBeRadical: values.canBeRadical ?? false,
        kangxiNumber: values.kangxiNumber ?? null,
        kangxiMeaning: values.kangxiMeaning ?? null,
        radicalNameJapanese: values.radicalNameJapanese ?? null
      }
      const newComponent = create(input)
      await persist()
      showSuccess(`Created component: ${newComponent.character}`)
      await router.push(`/components/${String(newComponent.id)}`)
    } else {
      if (!component.value) return
      const input = {
        character: values.character,
        strokeCount: values.strokeCount ?? null,
        shortMeaning: values.shortMeaning ?? null,
        searchKeywords: values.searchKeywords ?? null,
        description: values.description ?? null,
        sourceKanjiId: values.sourceKanjiId ?? null,
        canBeRadical: values.canBeRadical ?? false,
        kangxiNumber: values.kangxiNumber ?? null,
        kangxiMeaning: values.kangxiMeaning ?? null,
        radicalNameJapanese: values.radicalNameJapanese ?? null
      }
      const updated = update(component.value.id, input)
      showSuccess(`Updated component: ${updated.character}`)
      await router.push(`/components/${String(updated.id)}`)
    }
  } catch (err) {
    const action = props.mode === 'create' ? 'create' : 'update'
    showError(
      err instanceof Error ? err.message : `Failed to ${action} component`
    )
  }
}

function handleCancel() {
  void router.push(backUrl.value)
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadKanjiOptions()
    if (props.mode === 'edit') {
      loadComponent()
    }
  } catch {
    // Error is already captured in initError
  }
})

// Populate form fields when component data loads (edit mode only)
watch(component, (newComponent) => {
  if (newComponent && !formInitialized.value) {
    setFieldValue('character', newComponent.character)
    setFieldValue('strokeCount', newComponent.strokeCount ?? undefined)
    setFieldValue('shortMeaning', newComponent.shortMeaning ?? '')
    setFieldValue('searchKeywords', newComponent.searchKeywords ?? '')
    setFieldValue('description', newComponent.description ?? '')
    setFieldValue('sourceKanjiId', newComponent.sourceKanjiId ?? undefined)
    setFieldValue('canBeRadical', newComponent.canBeRadical)
    setFieldValue('kangxiNumber', newComponent.kangxiNumber ?? null)
    setFieldValue('kangxiMeaning', newComponent.kangxiMeaning ?? '')
    setFieldValue('radicalNameJapanese', newComponent.radicalNameJapanese ?? '')
    formInitialized.value = true
  }
})

// Show content when ready
const showContent = computed(() => {
  if (!isInitialized.value) return false
  if (props.mode === 'edit') return component.value !== null
  return true
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="component-root-form-loading"
  >
    <BaseSpinner
      label="Loading..."
      size="lg"
    />
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="component-root-form-error"
  >
    <p class="component-root-form-error-title">Failed to load</p>
    <p class="component-root-form-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <ComponentSectionForm
    v-else-if="showContent"
    :back-url="backUrl"
    :is-submitting="isSubmitting"
    :kanji-options="kanjiOptions"
    :mode="props.mode"
    @cancel="handleCancel"
    @submit="submitForm"
  />
</template>

<style scoped>
.component-root-form-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.component-root-form-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.component-root-form-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.component-root-form-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
