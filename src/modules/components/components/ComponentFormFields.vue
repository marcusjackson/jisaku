<script setup lang="ts">
/**
 * ComponentFormFields
 *
 * UI component containing all form fields for component create/edit.
 * Uses vee-validate's useField for field-level validation.
 */

import { useField } from 'vee-validate'

import BaseCombobox from '@/base/components/BaseCombobox.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'

defineProps<{
  /** Available kanji options for source kanji selector */
  kanjiOptions: ComboboxOption[]
}>()

// Character field
const { errorMessage: characterError, value: character } =
  useField<string>('character')

// Stroke count field
const { errorMessage: strokeCountError, value: strokeCount } = useField<
  number | undefined
>('strokeCount')

// Short description field
const { value: descriptionShort } = useField<string | undefined>(
  'descriptionShort'
)

// Japanese name field
const { value: japaneseName } = useField<string | undefined>('japaneseName')

// Full description field
const { value: description } = useField<string | undefined>('description')

// Source kanji field
const { value: sourceKanjiId } = useField<number | null>('sourceKanjiId')
</script>

<template>
  <div class="component-form-fields">
    <div class="component-form-fields-row">
      <div
        class="component-form-fields-group component-form-fields-group-character"
      >
        <BaseInput
          v-model="character"
          :error="characterError"
          label="Character"
          name="character"
          required
        />
      </div>

      <div
        class="component-form-fields-group component-form-fields-group-strokes"
      >
        <BaseInput
          v-model.number="strokeCount"
          :error="strokeCountError"
          label="Stroke Count"
          name="strokeCount"
          required
          type="number"
        />
      </div>
    </div>

    <div class="component-form-fields-row">
      <div class="component-form-fields-group">
        <BaseInput
          v-model="descriptionShort"
          label="Short Description"
          name="descriptionShort"
          placeholder="e.g., Person radical"
        />
      </div>

      <div class="component-form-fields-group">
        <BaseInput
          v-model="japaneseName"
          label="Japanese Name"
          name="japaneseName"
          placeholder="e.g., にんべん"
        />
      </div>
    </div>

    <div class="component-form-fields-group">
      <BaseCombobox
        v-model="sourceKanjiId"
        label="Source Kanji"
        name="sourceKanjiId"
        :options="kanjiOptions"
        placeholder="Search for kanji..."
      />
    </div>

    <div class="component-form-fields-group">
      <BaseTextarea
        v-model="description"
        label="Full Description"
        name="description"
        placeholder="Add detailed description about this component..."
        :rows="4"
      />
    </div>
  </div>
</template>

<style scoped>
.component-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-form-fields-row {
  display: flex;
  gap: var(--spacing-md);
}

.component-form-fields-group {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.component-form-fields-group-character {
  flex: 0 0 120px;
}

.component-form-fields-group-strokes {
  flex: 0 0 150px;
}

@media (width <= 640px) {
  .component-form-fields-row {
    flex-direction: column;
  }

  .component-form-fields-group-character,
  .component-form-fields-group-strokes {
    flex: 1;
  }
}
</style>
