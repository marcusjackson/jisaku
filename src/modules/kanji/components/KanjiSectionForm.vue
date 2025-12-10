<script setup lang="ts">
/**
 * KanjiSectionForm
 *
 * Section component for kanji form layout.
 * Wraps form fields with navigation and submit actions.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import KanjiFormFields from './KanjiFormFields.vue'

import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'

interface Props {
  /** Form mode (create or edit) */
  mode: 'create' | 'edit'
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Back link URL */
  backUrl?: string
  /** Available component options */
  componentOptions?: ComboboxOption[]
}

const props = withDefaults(defineProps<Props>(), {
  backUrl: '/',
  isSubmitting: false,
  componentOptions: () => []
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const submitLabel = computed(() => {
  if (props.isSubmitting) {
    return props.mode === 'create' ? 'Creating...' : 'Saving...'
  }
  return props.mode === 'create' ? 'Create Kanji' : 'Save Changes'
})

const pageTitle = computed(() =>
  props.mode === 'create' ? 'New Kanji' : 'Edit Kanji'
)

// Computed to handle exactOptionalPropertyTypes
const isButtonDisabled = computed(() => props.isSubmitting)

function handleSubmit() {
  emit('submit')
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form
    class="kanji-section-form"
    @submit.prevent="handleSubmit"
  >
    <header class="kanji-section-form-header">
      <RouterLink
        class="kanji-section-form-back"
        :to="props.backUrl"
      >
        ← Back
      </RouterLink>
      <h1 class="kanji-section-form-title">{{ pageTitle }}</h1>
    </header>

    <div class="kanji-section-form-content">
      <KanjiFormFields :component-options="props.componentOptions" />
    </div>

    <div class="kanji-section-form-actions">
      <BaseButton
        :disabled="isButtonDisabled"
        variant="secondary"
        @click="handleCancel"
      >
        Cancel
      </BaseButton>
      <BaseButton
        :disabled="isButtonDisabled"
        :loading="isButtonDisabled"
        type="submit"
      >
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.kanji-section-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

@media (width <= 640px) {
  .kanji-section-form {
    padding: 0 var(--spacing-md) var(--spacing-md);
  }
}

.kanji-section-form-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
}

.kanji-section-form-back {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.kanji-section-form-back:hover {
  color: var(--color-primary);
}

.kanji-section-form-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.kanji-section-form-content {
  min-width: 0;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

@media (width <= 640px) {
  .kanji-section-form-content {
    padding: var(--spacing-sm);
  }
}

.kanji-section-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
