<script setup lang="ts">
/**
 * KanjiDetailComponentOccurrenceEditor
 *
 * Editable form for component occurrence fields (position, form, radical).
 * Analysis notes are intentionally excluded - edit them on the component detail page.
 */

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { PositionType } from '@/api/position/position-types'

const props = defineProps<{
  /** Component occurrence to edit */
  occurrence: ComponentOccurrenceWithDetails
  /** Available position types */
  positionTypes: PositionType[]
  /** Available component forms for this component */
  componentForms: {
    id: number
    formCharacter: string
    formName: string | null
  }[]
  /** Whether destructive mode is enabled (shows unlink button) */
  destructiveMode: boolean
}>()

const emit = defineEmits<{
  /** Update occurrence field */
  update: [field: string, value: number | null | boolean | string]
  /** Unlink occurrence */
  unlink: []
}>()

// Use '__none__' as sentinel value for "None" option
// Reka UI SelectItem doesn't allow empty string values
const NONE_VALUE = '__none__'

function handleFieldChange(field: string, value: unknown): void {
  emit('update', field, value as number | null | boolean | string)
}
</script>

<template>
  <div class="kanji-detail-component-occurrence-editor">
    <div class="kanji-detail-component-occurrence-editor-header">
      <span class="kanji-detail-component-occurrence-editor-character">
        {{ occurrence.component.character }}
      </span>
      <span
        v-if="occurrence.component.shortMeaning"
        class="kanji-detail-component-occurrence-editor-meaning"
      >
        {{ occurrence.component.shortMeaning }}
      </span>
      <BaseButton
        v-if="props.destructiveMode"
        size="sm"
        type="button"
        variant="danger"
        @click="emit('unlink')"
      >
        Unlink
      </BaseButton>
    </div>

    <div class="kanji-detail-component-occurrence-editor-fields">
      <BaseSelect
        label="Position"
        :model-value="occurrence.positionTypeId?.toString() ?? NONE_VALUE"
        :options="[
          { label: 'None', value: NONE_VALUE },
          ...positionTypes.map((p) => ({
            label: p.nameJapanese ?? p.nameEnglish ?? p.positionName,
            value: p.id.toString()
          }))
        ]"
        @update:model-value="
          (val: string | null | undefined) =>
            handleFieldChange(
              'positionTypeId',
              val && val !== NONE_VALUE ? Number(val) : null
            )
        "
      />

      <BaseSelect
        v-if="componentForms.length > 0"
        label="Form"
        :model-value="occurrence.componentFormId?.toString() ?? NONE_VALUE"
        :options="[
          { label: 'None', value: NONE_VALUE },
          ...componentForms.map((f) => ({
            label: f.formName
              ? `${f.formCharacter} (${f.formName})`
              : f.formCharacter,
            value: f.id.toString()
          }))
        ]"
        @update:model-value="
          (val: string | null | undefined) =>
            handleFieldChange(
              'componentFormId',
              val && val !== NONE_VALUE ? Number(val) : null
            )
        "
      />

      <BaseSwitch
        label="Is Radical"
        :model-value="occurrence.isRadical"
        @update:model-value="
          (val: boolean) => handleFieldChange('isRadical', val)
        "
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-detail-component-occurrence-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-secondary);
}

.kanji-detail-component-occurrence-editor-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-detail-component-occurrence-editor-character {
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-normal);
}

.kanji-detail-component-occurrence-editor-meaning {
  flex: 1;
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanji-detail-component-occurrence-editor-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
