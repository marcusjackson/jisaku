<script setup lang="ts">
/**
 * KanjiRootFormEdit
 *
 * Root component for the kanji edit form.
 * Handles database initialization, data fetching, form submission, and navigation.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import { useKanjiRepository } from '@/modules/kanji-list/composables/use-kanji-repository'
import { useKanjiForm } from '../composables/use-kanji-form'
import { useRadicalRepository } from '../composables/use-radical-repository'

import KanjiSectionForm from './KanjiSectionForm.vue'

import type { KanjiFormData } from '../kanji-form-schema'
import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'
import type { Kanji } from '@/shared/types/database-types'

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Repository for data access
const { getById, getLinkedComponentIds, saveComponentLinks, update } =
  useKanjiRepository()
const { getAll: getAllRadicals } = useRadicalRepository()

import { useComponentRepository } from '@/modules/components/composables/use-component-repository'
const { getAll: getAllComponents } = useComponentRepository()

// Toast notifications
const { error: showError, success: showSuccess } = useToast()

// Local state
const kanji = ref<Kanji | null>(null)
const fetchError = ref<Error | null>(null)

// Radical options for combobox
const radicalOptions = ref<ComboboxOption[]>([])

// Component options for multi-select
const componentOptions = ref<ComboboxOption[]>([])

// Load radical options
function loadRadicalOptions() {
  const radicals = getAllRadicals()
  radicalOptions.value = radicals.map((r) => ({
    label: `${r.character} (${r.meaning ?? `#${String(r.number)}`})`,
    value: r.id
  }))
}

// Load component options
function loadComponentOptions() {
  const components = getAllComponents()
  componentOptions.value = components.map((c) => ({
    label: `${c.character}${c.descriptionShort ? ` — ${c.descriptionShort}` : ''}`,
    value: c.id
  }))
}

// Computed kanji ID from route params
const kanjiId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Back URL for navigation
const backUrl = computed(() => `/kanji/${String(kanjiId.value)}`)

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
    }
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Form setup (will be initialized once kanji is loaded)
const formInitialized = ref(false)

const { isSubmitting, setFieldValue, submitForm } = useKanjiForm({
  onSubmit: handleSubmit
})

async function handleSubmit(values: KanjiFormData) {
  if (!kanji.value) return

  try {
    const input = {
      character: values.character,
      strokeCount: values.strokeCount,
      ...(values.jlptLevel != null && { jlptLevel: values.jlptLevel }),
      ...(values.joyoLevel != null && { joyoLevel: values.joyoLevel }),
      ...(values.radicalId != null && { radicalId: values.radicalId }),
      notesEtymology: values.notesEtymology ?? null,
      notesCultural: values.notesCultural ?? null,
      notesPersonal: values.notesPersonal ?? null,
      strokeDiagramImage: values.strokeDiagramImage ?? null,
      strokeGifImage: values.strokeGifImage ?? null
    }
    const updated = update(kanji.value.id, input)

    // Save component links (replaces existing)
    saveComponentLinks(updated.id, values.componentIds ?? [])

    showSuccess(`Updated kanji: ${updated.character}`)
    await router.push(`/kanji/${String(updated.id)}`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to update kanji')
  }
}

function handleCancel() {
  void router.push(backUrl.value)
}

function handleRadicalCreated() {
  // Reload radical options to include newly created radical
  loadRadicalOptions()
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadKanji()
    loadRadicalOptions()
    loadComponentOptions()
  } catch {
    // Error is already captured in initError
  }
})

// Populate form fields when kanji data loads
watch(kanji, (newKanji) => {
  if (newKanji && !formInitialized.value) {
    setFieldValue('character', newKanji.character)
    setFieldValue('strokeCount', newKanji.strokeCount)
    setFieldValue('jlptLevel', newKanji.jlptLevel)
    setFieldValue('joyoLevel', newKanji.joyoLevel)
    setFieldValue('radicalId', newKanji.radicalId)
    setFieldValue('notesEtymology', newKanji.notesEtymology ?? '')
    setFieldValue('notesCultural', newKanji.notesCultural ?? '')
    setFieldValue('notesPersonal', newKanji.notesPersonal ?? '')
    setFieldValue('strokeDiagramImage', newKanji.strokeDiagramImage)
    setFieldValue('strokeGifImage', newKanji.strokeGifImage)

    // Load existing component links
    const linkedComponentIds = getLinkedComponentIds(newKanji.id)
    setFieldValue('componentIds', linkedComponentIds)

    formInitialized.value = true
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="kanji-root-form-edit-loading"
  >
    <BaseSpinner
      label="Loading..."
      size="lg"
    />
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="kanji-root-form-edit-error"
  >
    <p class="kanji-root-form-edit-error-title">Failed to load</p>
    <p class="kanji-root-form-edit-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <KanjiSectionForm
    v-else-if="isInitialized && kanji"
    :back-url="backUrl"
    :component-options="componentOptions"
    :is-submitting="isSubmitting"
    mode="edit"
    :radical-options="radicalOptions"
    @cancel="handleCancel"
    @radical-created="handleRadicalCreated"
    @submit="submitForm"
  />
</template>

<style scoped>
.kanji-root-form-edit-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.kanji-root-form-edit-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.kanji-root-form-edit-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-root-form-edit-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
