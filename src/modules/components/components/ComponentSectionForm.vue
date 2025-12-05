<script setup lang="ts">
/**
 * ComponentSectionForm
 *
 * Section component for component form layout.
 * Wraps form fields with navigation and submit actions.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import ComponentFormFields from './ComponentFormFields.vue'

import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'

interface Props {
  /** Form mode (create or edit) */
  mode: 'create' | 'edit'
  /** Whether form is submitting */
  isSubmitting?: boolean
  /** Back link URL */
  backUrl?: string
  /** Available kanji options for source kanji selector */
  kanjiOptions: ComboboxOption[]
}

const props = withDefaults(defineProps<Props>(), {
  backUrl: '/components',
  isSubmitting: false
})

const emit = defineEmits<{
  submit: []
  cancel: []
}>()

const submitLabel = computed(() => {
  if (props.isSubmitting) {
    return props.mode === 'create' ? 'Creating...' : 'Saving...'
  }
  return props.mode === 'create' ? 'Create Component' : 'Save Changes'
})

const pageTitle = computed(() =>
  props.mode === 'create' ? 'New Component' : 'Edit Component'
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
    class="component-section-form"
    @submit.prevent="handleSubmit"
  >
    <header class="component-section-form-header">
      <RouterLink
        class="component-section-form-back"
        :to="props.backUrl"
      >
        ← Back
      </RouterLink>
      <h1 class="component-section-form-title">{{ pageTitle }}</h1>
    </header>

    <div class="component-section-form-content">
      <ComponentFormFields :kanji-options="props.kanjiOptions" />
    </div>

    <div class="component-section-form-actions">
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
.component-section-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.component-section-form-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.component-section-form-back {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.component-section-form-back:hover {
  color: var(--color-primary);
}

.component-section-form-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.component-section-form-content {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

.component-section-form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
