<script setup lang="ts">
/**
 * KanjiFormFields
 *
 * UI component containing all form fields for kanji create/edit.
 * Uses vee-validate's useField for field-level validation.
 * In create mode, shows simplified form (character, stroke count, meaning, keywords).
 * In edit mode, shows all fields.
 */

import { useField } from 'vee-validate'

import BaseComboboxMulti from '@/base/components/BaseComboboxMulti.vue'
import BaseFileInput from '@/base/components/BaseFileInput.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import type { ComboboxOption } from '@/base/components/BaseCombobox.vue'

interface Props {
  /** Available component options for the selector */
  componentOptions: ComboboxOption[]
  /** Form mode - create shows simplified form, edit shows all fields */
  mode?: 'create' | 'edit'
}

withDefaults(defineProps<Props>(), {
  mode: 'edit'
})

// Character field
const { errorMessage: characterError, value: character } =
  useField<string>('character')

// Stroke count field
const { errorMessage: strokeCountError, value: strokeCount } = useField<
  number | undefined
>('strokeCount')

// Short meaning field
const { value: shortMeaning } = useField<string | undefined>('shortMeaning')

// Search keywords field
const { value: searchKeywords } = useField<string | undefined>('searchKeywords')

// JLPT Level field
const { value: jlptLevel } = useField<string | null>('jlptLevel')

// Joyo Level field
const { value: joyoLevel } = useField<string | null>('joyoLevel')

// Kentei Level field
const { value: kenteiLevel } = useField<string | null>('kenteiLevel')

// Note fields
const { value: notesEtymology } = useField<string | undefined>('notesEtymology')
const { value: notesSemantic } = useField<string | undefined>('notesSemantic')
const { value: notesEducationMnemonics } = useField<string | undefined>(
  'notesEducationMnemonics'
)
const { value: notesPersonal } = useField<string | undefined>('notesPersonal')

// Image fields
const { value: strokeDiagramImage } = useField<Uint8Array | null>(
  'strokeDiagramImage'
)
const { value: strokeGifImage } = useField<Uint8Array | null>('strokeGifImage')

// Component IDs field (for linking kanji to components)
const { value: componentIds } = useField<number[]>('componentIds')

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

const kenteiOptions = [
  { label: '10級', value: '10級' },
  { label: '9級', value: '9級' },
  { label: '8級', value: '8級' },
  { label: '7級', value: '7級' },
  { label: '6級', value: '6級' },
  { label: '5級', value: '5級' },
  { label: '4級', value: '4級' },
  { label: '3級', value: '3級' },
  { label: '準2級', value: '準2級' },
  { label: '2級', value: '2級' },
  { label: '準1級', value: '準1級' },
  { label: '1級', value: '1級' }
]
</script>

<template>
  <div class="kanji-form-fields">
    <!-- Basic Info Section -->
    <fieldset class="kanji-form-fields-section">
      <legend class="kanji-form-fields-legend">Basic Information</legend>

      <div class="kanji-form-fields-group kanji-form-fields-group-full">
        <BaseInput
          v-model="character"
          :error="characterError"
          label="Character"
          name="character"
          required
        />
      </div>

      <div class="kanji-form-fields-group">
        <BaseInput
          v-model="shortMeaning"
          label="Short Meaning"
          name="shortMeaning"
          placeholder="e.g., bright, clear"
        />
        <p class="kanji-form-fields-help">
          Brief English meaning for display (optional).
        </p>
      </div>

      <div class="kanji-form-fields-group">
        <BaseInput
          v-model="searchKeywords"
          label="Search Keywords"
          name="searchKeywords"
          placeholder="e.g., light, illuminate, sunny"
        />
        <p class="kanji-form-fields-help">
          Additional search terms (optional, comma-separated).
        </p>
      </div>

      <!-- Extended fields only shown in edit mode -->
      <template v-if="mode === 'edit'">
        <div class="kanji-form-fields-group">
          <BaseInput
            v-model.number="strokeCount"
            :error="strokeCountError"
            label="Stroke Count"
            name="strokeCount"
            type="number"
          />
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

        <div class="kanji-form-fields-row">
          <div class="kanji-form-fields-group">
            <BaseSelect
              v-model="kenteiLevel"
              label="Kanji Kentei Level"
              name="kenteiLevel"
              :options="kenteiOptions"
              placeholder="Select level..."
            />
          </div>
        </div>
      </template>
    </fieldset>

    <!-- Extended sections only shown in edit mode -->
    <template v-if="mode === 'edit'">
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
            v-model="notesSemantic"
            label="Semantic Analysis"
            name="notesSemantic"
            placeholder="Modern usage, compounds, semantic patterns..."
            :rows="3"
          />
        </div>

        <div class="kanji-form-fields-group">
          <BaseTextarea
            v-model="notesEducationMnemonics"
            label="Education & Mnemonics"
            name="notesEducationMnemonics"
            placeholder="Japanese education context, native mnemonics, teaching methods..."
            :rows="3"
          />
        </div>

        <div class="kanji-form-fields-group">
          <BaseTextarea
            v-model="notesPersonal"
            label="Personal Notes"
            name="notesPersonal"
            placeholder="Personal observations, learning notes, custom mnemonics..."
            :rows="3"
          />
        </div>
      </fieldset>
    </template>
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
