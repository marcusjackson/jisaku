<script setup lang="ts">
/**
 * ComponentDetailDialogEditOccurrence
 *
 * Dialog for editing occurrence metadata: position, form, radical flag, notes.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseDialog from '@/base/components/BaseDialog.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import type { OccurrenceUpdateData } from '../component-detail-types'
import type { ComponentForm, OccurrenceWithKanji } from '@/api/component'
import type { PositionType } from '@/api/position/position-types'
import type { SelectOption } from '@/base/components/BaseSelect.vue'

const props = defineProps<{
  /** Occurrence to edit */
  occurrence: OccurrenceWithKanji | null
  /** Position type options */
  positionTypes: PositionType[]
  /** Form options for this component */
  forms: ComponentForm[]
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  submit: [data: OccurrenceUpdateData]
  cancel: []
}>()

const open = defineModel<boolean>('open', { default: false })

// Use '__none__' as sentinel value for "None" option
// Reka UI SelectItem doesn't allow empty string values
const NONE_VALUE = '__none__'

// Form state
const positionTypeId = ref<string>(NONE_VALUE)
const componentFormId = ref<string>(NONE_VALUE)
const isRadical = ref(false)
const analysisNotes = ref('')

// Build position type options with "None" option
const positionOptions = computed<SelectOption[]>(() => [
  { value: NONE_VALUE, label: 'None' },
  ...props.positionTypes.map((pt) => ({
    value: String(pt.id),
    label: pt.nameJapanese ?? pt.nameEnglish ?? pt.positionName
  }))
])

// Build form options with "None" option
const formOptions = computed<SelectOption[]>(() => [
  { value: NONE_VALUE, label: 'None' },
  ...props.forms.map((f) => ({
    value: String(f.id),
    label: f.formName ?? f.formCharacter
  }))
])

// Reset form when dialog opens with new occurrence
watch(
  () => [open.value, props.occurrence] as const,
  ([isOpen, occ]) => {
    if (isOpen && occ) {
      positionTypeId.value = occ.positionTypeId
        ? String(occ.positionTypeId)
        : NONE_VALUE
      componentFormId.value = occ.componentFormId
        ? String(occ.componentFormId)
        : NONE_VALUE
      isRadical.value = occ.isRadical
      analysisNotes.value = occ.analysisNotes ?? ''
    }
  },
  { immediate: true }
)

function handleSubmit(): void {
  const data: OccurrenceUpdateData = {
    positionTypeId:
      positionTypeId.value && positionTypeId.value !== NONE_VALUE
        ? Number(positionTypeId.value)
        : null,
    componentFormId:
      componentFormId.value && componentFormId.value !== NONE_VALUE
        ? Number(componentFormId.value)
        : null,
    isRadical: isRadical.value,
    analysisNotes: analysisNotes.value.trim() || null
  }
  emit('submit', data)
  open.value = false
}

function handleCancel(): void {
  emit('cancel')
  open.value = false
}
</script>

<template>
  <BaseDialog
    v-model:open="open"
    description="Edit the occurrence metadata for this kanji-component link."
    title="Edit Occurrence"
    @update:open="(val: boolean) => emit('update:open', val)"
  >
    <div
      v-if="occurrence"
      class="dialog-edit-occurrence-content"
    >
      <div class="dialog-edit-occurrence-kanji">
        <span class="dialog-edit-occurrence-kanji-character">
          {{ occurrence.kanji.character }}
        </span>
        <span
          v-if="occurrence.kanji.shortMeaning"
          class="dialog-edit-occurrence-kanji-meaning"
        >
          {{ occurrence.kanji.shortMeaning }}
        </span>
      </div>

      <form
        id="edit-occurrence-form"
        class="dialog-edit-occurrence-form"
        @submit.prevent="handleSubmit"
      >
        <BaseSelect
          v-model="positionTypeId"
          label="Position Type"
          name="positionType"
          :options="positionOptions"
          placeholder="Select position..."
        />

        <BaseSelect
          v-if="forms.length > 0"
          v-model="componentFormId"
          label="Component Form"
          name="componentForm"
          :options="formOptions"
          placeholder="Select form..."
        />

        <BaseSwitch
          v-model="isRadical"
          aria-label="Is Radical"
          label="Is Radical"
        />

        <BaseTextarea
          v-model="analysisNotes"
          label="Analysis Notes"
          name="analysisNotes"
          placeholder="Add notes about this occurrence..."
          :rows="3"
        />
      </form>
    </div>

    <template #footer>
      <div class="dialog-edit-occurrence-actions">
        <BaseButton
          type="button"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          form="edit-occurrence-form"
          type="submit"
          variant="primary"
        >
          Save
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

<style scoped>
.dialog-edit-occurrence-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

.dialog-edit-occurrence-kanji {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}

.dialog-edit-occurrence-kanji-character {
  font-family: var(--font-family-jp);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
}

.dialog-edit-occurrence-kanji-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.dialog-edit-occurrence-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.dialog-edit-occurrence-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
