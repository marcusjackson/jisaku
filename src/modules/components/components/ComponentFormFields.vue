<script setup lang="ts">
/**
 * ComponentFormFields
 *
 * UI component containing all form fields for component create/edit.
 * Uses vee-validate's useField for field-level validation.
 */

import { computed } from 'vue'

import { useField } from 'vee-validate'

import BaseCheckbox from '@/base/components/BaseCheckbox.vue'
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

// Short meaning field
const { value: shortMeaning } = useField<string | undefined>('shortMeaning')

// Japanese name field
const { value: japaneseName } = useField<string | undefined>('japaneseName')

// Full description field
const { value: description } = useField<string | undefined>('description')

// Source kanji field
const { value: sourceKanjiId } = useField<number | null>('sourceKanjiId')

// Radical metadata fields
const { value: canBeRadical } = useField<boolean>('canBeRadical')
const { errorMessage: kangxiNumberError, value: kangxiNumberRaw } = useField<
  number | null
>('kangxiNumber')
// Convert null to undefined for BaseInput compatibility
const kangxiNumber = computed({
  get: () => kangxiNumberRaw.value ?? undefined,
  set: (val) => {
    kangxiNumberRaw.value = val ?? null
  }
})
const { value: kangxiMeaning } = useField<string | undefined>('kangxiMeaning')
const { value: radicalNameJapanese } = useField<string | undefined>(
  'radicalNameJapanese'
)
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

    <div class="component-form-fields-group">
      <BaseInput
        v-model="shortMeaning"
        label="Short Meaning"
        name="shortMeaning"
        placeholder="e.g., sun, day"
      />
      <p class="component-form-fields-help">
        Brief English meaning for search and display (optional).
      </p>
    </div>

    <div class="component-form-fields-row">
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
        label="Description"
        name="description"
        placeholder="Add detailed description about this component..."
        :rows="4"
      />
    </div>

    <!-- Radical Metadata Section -->
    <div class="component-form-fields-group">
      <BaseCheckbox
        v-model="canBeRadical"
        label="Can be used as a radical"
        name="canBeRadical"
      />
    </div>

    <div
      v-if="canBeRadical"
      class="component-form-fields-radical-section"
    >
      <div class="component-form-fields-row">
        <div
          class="component-form-fields-group component-form-fields-group-kangxi"
        >
          <BaseInput
            v-model.number="kangxiNumber"
            :error="kangxiNumberError"
            label="Kangxi Number"
            name="kangxiNumber"
            placeholder="1-214"
            type="number"
          />
        </div>

        <div class="component-form-fields-group">
          <BaseInput
            v-model="radicalNameJapanese"
            label="Radical Name (Japanese)"
            name="radicalNameJapanese"
            placeholder="e.g., にんべん"
          />
        </div>
      </div>

      <div class="component-form-fields-group">
        <BaseInput
          v-model="kangxiMeaning"
          label="Kangxi Meaning"
          name="kangxiMeaning"
          placeholder="e.g., person"
        />
      </div>
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

.component-form-fields-group-kangxi {
  flex: 0 0 150px;
}

.component-form-fields-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.component-form-fields-radical-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-surface-secondary);
}

@media (width <= 640px) {
  .component-form-fields-row {
    flex-direction: column;
  }

  .component-form-fields-group-character,
  .component-form-fields-group-strokes,
  .component-form-fields-group-kangxi {
    flex: 1;
  }
}
</style>
