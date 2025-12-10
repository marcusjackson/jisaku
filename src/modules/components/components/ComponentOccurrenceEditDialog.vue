<script setup lang="ts">
/**
 * ComponentOccurrenceEditDialog
 *
 * Dialog for editing component occurrence metadata:
 * - Position type (hen, tsukuri, etc.)
 * - Radical flag
 * - Analysis notes
 */

import { computed, watch } from 'vue'

import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseCheckbox from '@/base/components/BaseCheckbox.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import {
  type ComponentOccurrenceEditData,
  componentOccurrenceEditSchema
} from '../component-occurrence-edit-schema'
import { useComponentOccurrenceRepository } from '../composables/use-component-occurrence-repository'
import { usePositionTypeRepository } from '../composables/use-position-type-repository'

import type {
  ComponentOccurrence,
  PositionType
} from '@/shared/types/database-types'

interface Props {
  /** The occurrence being edited */
  occurrence: ComponentOccurrence | null
  /** Component character for display */
  componentCharacter?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  save: []
}>()

const open = defineModel<boolean>('open', { default: false })

// Repositories
const occurrenceRepo = useComponentOccurrenceRepository()
const positionTypeRepo = usePositionTypeRepository()

// Get all position types for dropdown
const positionTypes = computed<PositionType[]>(() => positionTypeRepo.getAll())

// Convert position types to select options
const positionOptions = computed(() => [
  { value: '', label: 'None', disabled: false },
  ...positionTypes.value.map((pt) => ({
    value: String(pt.id),
    label: `${pt.nameJapanese ?? pt.positionName} (${pt.nameEnglish ?? pt.positionName})`,
    disabled: false
  }))
])

// Form setup
const schema = toTypedSchema(componentOccurrenceEditSchema)

const { errors, handleSubmit, resetForm, setFieldValue } = useForm({
  validationSchema: schema,
  initialValues: {
    positionTypeId: null as number | null,
    isRadical: false,
    analysisNotes: ''
  }
})

// Watch occurrence changes to update form
watch(
  () => props.occurrence,
  (newOccurrence) => {
    if (newOccurrence) {
      setFieldValue('positionTypeId', newOccurrence.positionTypeId)
      setFieldValue('isRadical', newOccurrence.isRadical)
      setFieldValue('analysisNotes', newOccurrence.analysisNotes ?? '')
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// Form fields
const positionTypeId = defineModel<string | null>('positionTypeId')
const isRadical = defineModel<boolean>('isRadical', { default: false })
const analysisNotes = defineModel<string | undefined>('analysisNotes')

// Sync v-model changes back to form state
// This ensures the form has the latest field values when submitted
watch(
  () => analysisNotes.value,
  (newValue) => {
    setFieldValue('analysisNotes', newValue ?? '')
  }
)

// Convert between string (for select) and number (for database)
const positionTypeIdString = computed({
  get: () => {
    const value = positionTypeId.value
    return value ?? ''
  },
  set: (value: string | null) => {
    positionTypeId.value = value && value !== '' ? value : null
  }
})

// Watch dialog open state to sync form with occurrence
watch(
  () => open.value,
  (isOpen) => {
    if (isOpen && props.occurrence) {
      setFieldValue('positionTypeId', props.occurrence.positionTypeId)
      setFieldValue('isRadical', props.occurrence.isRadical)
      setFieldValue('analysisNotes', props.occurrence.analysisNotes ?? '')

      positionTypeId.value = props.occurrence.positionTypeId
        ? String(props.occurrence.positionTypeId)
        : null
      isRadical.value = props.occurrence.isRadical
      analysisNotes.value = props.occurrence.analysisNotes ?? ''
    }
  }
)

const onSubmit = handleSubmit((values: ComponentOccurrenceEditData) => {
  if (!props.occurrence) {
    return
  }

  // Update occurrence in database
  occurrenceRepo.updatePosition(props.occurrence.id, values.positionTypeId)
  occurrenceRepo.updateIsRadical(props.occurrence.id, values.isRadical)
  occurrenceRepo.updateAnalysisNotes(
    props.occurrence.id,
    values.analysisNotes ?? null
  )

  // Emit save event AND close the dialog
  emit('save')
  // Explicitly close the dialog by setting the model
  open.value = false
})

function handleCancel() {
  resetForm()
  // Emit close event AND close the dialog
  emit('close')
  // Explicitly close the dialog by setting the model
  open.value = false
}

// Compute button disabled state
const isSaving = computed(() => false)
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Update position, radical status, and analysis notes for this component occurrence."
    :title="`Edit ${props.componentCharacter || 'Component'} Occurrence`"
  >
    <form
      id="component-occurrence-edit-form"
      class="component-occurrence-edit-form"
      @submit.prevent="onSubmit"
    >
      <!-- Position Type -->
      <BaseSelect
        v-model="positionTypeIdString"
        :error="errors.positionTypeId"
        label="Position"
        name="positionTypeId"
        :options="positionOptions"
        placeholder="Select position..."
      />

      <!-- Is Radical -->
      <BaseCheckbox
        v-model="isRadical"
        v-bind="errors.isRadical ? { error: errors.isRadical } : {}"
        label="Mark as radical for this kanji"
      />

      <!-- Analysis Notes -->
      <BaseTextarea
        v-model="analysisNotes"
        v-bind="errors.analysisNotes ? { error: errors.analysisNotes } : {}"
        label="Analysis Notes"
        name="analysisNotes"
        placeholder="Add notes about this component's role in the kanji..."
        :rows="4"
      />
    </form>

    <template #footer>
      <div class="component-occurrence-edit-actions">
        <BaseButton
          :disabled="isSaving"
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          :disabled="isSaving"
          form="component-occurrence-edit-form"
          :loading="isSaving"
          type="submit"
          variant="primary"
        >
          Save Changes
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.component-occurrence-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.component-occurrence-edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
