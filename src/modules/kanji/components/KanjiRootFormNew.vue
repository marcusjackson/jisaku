<script setup lang="ts">
/**
 * KanjiRootFormNew
 *
 * Root component for the kanji creation form.
 * Handles database initialization, form submission, and navigation.
 */

import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import { useKanjiRepository } from '@/modules/kanji-list/composables/use-kanji-repository'
import { useKanjiForm } from '../composables/use-kanji-form'

import KanjiSectionForm from './KanjiSectionForm.vue'

import type { KanjiFormData } from '../kanji-form-schema'
import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'

// Router
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing, persist } =
  useDatabase()

// Repository for data access
const { create, saveComponentLinks } = useKanjiRepository()

import { useComponentRepository } from '@/modules/components/composables/use-component-repository'
const { getAll: getAllComponents } = useComponentRepository()

// Toast notifications
const { error: showError, success: showSuccess } = useToast()

// Component options for multi-select
const componentOptions = ref<ComboboxOption[]>([])

// Load component options
function loadComponentOptions() {
  const components = getAllComponents()
  componentOptions.value = components.map((c) => ({
    label: `${c.character}${c.description ? ` — ${c.description}` : ''}`,
    value: c.id
  }))
}

// Form setup
const { isSubmitting, submitForm } = useKanjiForm({
  onSubmit: handleSubmit
})

async function handleSubmit(values: KanjiFormData) {
  try {
    const input = {
      character: values.character,
      strokeCount: values.strokeCount,
      shortMeaning: values.shortMeaning ?? null,
      ...(values.jlptLevel != null && { jlptLevel: values.jlptLevel }),
      ...(values.joyoLevel != null && { joyoLevel: values.joyoLevel }),
      ...(values.kenteiLevel != null && { kenteiLevel: values.kenteiLevel }),
      notesEtymology: values.notesEtymology ?? null,
      notesSemantic: values.notesSemantic ?? null,
      notesEducationMnemonics: values.notesEducationMnemonics ?? null,
      notesPersonal: values.notesPersonal ?? null,
      strokeDiagramImage: values.strokeDiagramImage ?? null,
      strokeGifImage: values.strokeGifImage ?? null
    }
    const kanji = create(input)

    // Save component links if any were selected
    if (values.componentIds && values.componentIds.length > 0) {
      saveComponentLinks(kanji.id, values.componentIds)
    }

    await persist()

    showSuccess(`Created kanji: ${kanji.character}`)
    await router.push(`/kanji/${String(kanji.id)}`)
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to create kanji')
  }
}

function handleCancel() {
  void router.push('/')
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadComponentOptions()
  } catch {
    // Error is already captured in initError
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="kanji-root-form-new-loading"
  >
    <BaseSpinner
      label="Loading..."
      size="lg"
    />
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError"
    class="kanji-root-form-new-error"
  >
    <p class="kanji-root-form-new-error-title">Failed to load</p>
    <p class="kanji-root-form-new-error-message">
      {{ initError.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <KanjiSectionForm
    v-else-if="isInitialized"
    back-url="/"
    :component-options="componentOptions"
    :is-submitting="isSubmitting"
    mode="create"
    @cancel="handleCancel"
    @submit="submitForm"
  />
</template>

<style scoped>
.kanji-root-form-new-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.kanji-root-form-new-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.kanji-root-form-new-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-root-form-new-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
