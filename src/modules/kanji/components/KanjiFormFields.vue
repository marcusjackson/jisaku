<script setup lang="ts">
/**
 * KanjiFormFields
 *
 * UI component containing all form fields for kanji create/edit.
 * Uses vee-validate's useField for field-level validation.
 */

import { ref } from 'vue'

import { useField } from 'vee-validate'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseCombobox from '@/base/components/BaseCombobox.vue'
import BaseComboboxMulti from '@/base/components/BaseComboboxMulti.vue'
import BaseFileInput from '@/base/components/BaseFileInput.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import RadicalFormModal from './RadicalFormModal.vue'

import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'
import type { Radical } from '@/shared/types/database-types'

defineProps<{
  /** Available radical options for the selector */
  radicalOptions: ComboboxOption[]
  /** Available component options for the selector */
  componentOptions: ComboboxOption[]
}>()

const emit = defineEmits<{
  radicalCreated: [radical: Radical]
}>()

// Character field
const { errorMessage: characterError, value: character } =
  useField<string>('character')

// Stroke count field
const { errorMessage: strokeCountError, value: strokeCount } = useField<
  number | undefined
>('strokeCount')

// JLPT Level field
const { value: jlptLevel } = useField<string | null>('jlptLevel')

// Joyo Level field
const { value: joyoLevel } = useField<string | null>('joyoLevel')

// Radical field
const { value: radicalId } = useField<number | null>('radicalId')

// Note fields
const { value: notesEtymology } = useField<string | undefined>('notesEtymology')
const { value: notesCultural } = useField<string | undefined>('notesCultural')
const { value: notesPersonal } = useField<string | undefined>('notesPersonal')

// Image fields
const { value: strokeDiagramImage } = useField<Uint8Array | null>(
  'strokeDiagramImage'
)
const { value: strokeGifImage } = useField<Uint8Array | null>('strokeGifImage')

// Component IDs field (for linking kanji to components)
const { value: componentIds } = useField<number[]>('componentIds')

// Modal state
const showRadicalModal = ref(false)

// Options for selects
const jlptOptions = [
  { label: 'N5 (Beginner)', value: 'N5' },
  { label: 'N4', value: 'N4' },
  { label: 'N3', value: 'N3' },
  { label: 'N2', value: 'N2' },
  { label: 'N1 (Advanced)', value: 'N1' }
]

const joyoOptions = [
  { label: '小1 (Grade 1)', value: 'elementary1' },
  { label: '小2 (Grade 2)', value: 'elementary2' },
  { label: '小3 (Grade 3)', value: 'elementary3' },
  { label: '小4 (Grade 4)', value: 'elementary4' },
  { label: '小5 (Grade 5)', value: 'elementary5' },
  { label: '小6 (Grade 6)', value: 'elementary6' },
  { label: '中学 (Secondary)', value: 'secondary' }
]

function handleRadicalCreated(radical: Radical) {
  // Update the selected radical to the newly created one
  radicalId.value = radical.id
  // Emit event so parent can refresh radical options
  emit('radicalCreated', radical)
}
</script>

<template>
  <div class="kanji-form-fields">
    <!-- Basic Info Section -->
    <fieldset class="kanji-form-fields-section">
      <legend class="kanji-form-fields-legend">Basic Information</legend>

      <div class="kanji-form-fields-row">
        <div class="kanji-form-fields-group kanji-form-fields-group-character">
          <BaseInput
            v-model="character"
            :error="characterError"
            label="Character"
            name="character"
            required
          />
        </div>

        <div class="kanji-form-fields-group kanji-form-fields-group-strokes">
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

      <div class="kanji-form-fields-row">
        <div class="kanji-form-fields-group">
          <BaseSelect
            v-model="jlptLevel"
            label="JLPT Level"
            name="jlptLevel"
            :options="jlptOptions"
            placeholder="Select level..."
          />
        </div>

        <div class="kanji-form-fields-group">
          <BaseSelect
            v-model="joyoLevel"
            label="Jōyō Level"
            name="joyoLevel"
            :options="joyoOptions"
            placeholder="Select level..."
          />
        </div>
      </div>

      <div class="kanji-form-fields-row kanji-form-fields-row-radical">
        <div class="kanji-form-fields-group kanji-form-fields-group-radical">
          <BaseCombobox
            v-model="radicalId"
            label="Radical"
            name="radicalId"
            :options="radicalOptions"
            placeholder="Select radical..."
          />
        </div>
        <div class="kanji-form-fields-radical-action">
          <BaseButton
            size="sm"
            type="button"
            variant="secondary"
            @click="showRadicalModal = true"
          >
            + New
          </BaseButton>
        </div>
      </div>
    </fieldset>

    <!-- Components Section -->
    <fieldset class="kanji-form-fields-section">
      <legend class="kanji-form-fields-legend">Components</legend>

      <div class="kanji-form-fields-group">
        <BaseComboboxMulti
          v-model="componentIds"
          label="Kanji Components"
          name="componentIds"
          :options="componentOptions"
          placeholder="Search components..."
        />
        <p class="kanji-form-fields-help">
          Select the building-block components that make up this kanji.
        </p>
      </div>
    </fieldset>

    <!-- Stroke Images Section -->
    <fieldset class="kanji-form-fields-section">
      <legend class="kanji-form-fields-legend">Stroke Images</legend>

      <div class="kanji-form-fields-row">
        <div class="kanji-form-fields-group">
          <BaseFileInput
            v-model="strokeDiagramImage"
            accept="image/png,image/jpeg,image/gif"
            label="Stroke Order Diagram"
            name="strokeDiagramImage"
          />
        </div>

        <div class="kanji-form-fields-group">
          <BaseFileInput
            v-model="strokeGifImage"
            accept="image/gif,image/png"
            label="Animated Stroke Order"
            name="strokeGifImage"
          />
        </div>
      </div>
    </fieldset>

    <!-- Notes Section -->
    <fieldset class="kanji-form-fields-section">
      <legend class="kanji-form-fields-legend">Notes</legend>

      <div class="kanji-form-fields-group">
        <BaseTextarea
          v-model="notesEtymology"
          label="Etymology & Origins"
          name="notesEtymology"
          placeholder="Origins, historical development, pictographic meaning..."
          :rows="3"
        />
      </div>

      <div class="kanji-form-fields-group">
        <BaseTextarea
          v-model="notesCultural"
          label="Cultural Context"
          name="notesCultural"
          placeholder="Usage in names, cultural significance, common expressions..."
          :rows="3"
        />
      </div>

      <div class="kanji-form-fields-group">
        <BaseTextarea
          v-model="notesPersonal"
          label="Personal Notes"
          name="notesPersonal"
          placeholder="Mnemonics, personal observations, learning notes..."
          :rows="3"
        />
      </div>
    </fieldset>

    <!-- Radical Creation Modal -->
    <RadicalFormModal
      v-model:open="showRadicalModal"
      @created="handleRadicalCreated"
    />
  </div>
</template>

<style scoped>
.kanji-form-fields {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-form-fields-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  min-width: 0;
  margin: 0;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

@media (width <= 640px) {
  .kanji-form-fields-section {
    padding: var(--spacing-sm);
  }
}

.kanji-form-fields-legend {
  padding: 0 var(--spacing-2);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-form-fields-row {
  display: flex;
  gap: var(--spacing-md);
}

.kanji-form-fields-row-radical {
  align-items: flex-end;
}

.kanji-form-fields-group {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.kanji-form-fields-group-character {
  flex: 0 0 120px;
}

.kanji-form-fields-group-strokes {
  flex: 0 0 150px;
}

.kanji-form-fields-group-radical {
  flex: 1;
}

.kanji-form-fields-radical-action {
  flex-shrink: 0;
  padding-bottom: var(--spacing-1);
}

.kanji-form-fields-help {
  margin: var(--spacing-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

@media (width <= 640px) {
  .kanji-form-fields-row {
    flex-direction: column;
  }

  /* Keep character and strokes row horizontal on mobile */
  .kanji-form-fields-row:has(.kanji-form-fields-group-character) {
    flex-direction: row;
  }

  .kanji-form-fields-row-radical {
    flex-direction: row;
  }

  .kanji-form-fields-group-character {
    flex: 1;
    min-width: 80px;
  }

  .kanji-form-fields-group-strokes {
    flex: 1;
    min-width: 80px;
  }
}
</style>
