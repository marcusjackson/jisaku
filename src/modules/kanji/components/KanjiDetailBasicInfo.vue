<script setup lang="ts">
/**
 * KanjiDetailBasicInfo
 *
 * UI component displaying basic kanji information with inline editing.
 * Shows: stroke count, JLPT level, Joyo level, Kentei level, radical.
 *
 * Edit mode allows modifying all fields inline.
 */

import { computed, ref, watch } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseCombobox from '@/base/components/BaseCombobox.vue'
import BaseInput from '@/base/components/BaseInput.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'

import type {
  Component,
  JlptLevel,
  JoyoLevel,
  Kanji
} from '@/shared/types/database-types'

const props = defineProps<{
  kanji: Kanji
  radical?: Component | null
  /** Available components that can be radicals */
  radicalOptions?: Component[]
}>()

const emit = defineEmits<{
  update: [field: string, value: string | number | null]
}>()

// Use '__none__' as sentinel value for "None" option
// Reka UI SelectItem doesn't allow empty string values
const NONE_VALUE = '__none__'

const JLPT_OPTIONS = [
  { label: 'None', value: NONE_VALUE },
  { label: 'N5', value: 'N5' },
  { label: 'N4', value: 'N4' },
  { label: 'N3', value: 'N3' },
  { label: 'N2', value: 'N2' },
  { label: 'N1', value: 'N1' },
  { label: 'Non-JLPT', value: 'non-jlpt' }
]

const JOYO_OPTIONS = [
  { label: 'None', value: NONE_VALUE },
  { label: 'Grade 1', value: 'elementary1' },
  { label: 'Grade 2', value: 'elementary2' },
  { label: 'Grade 3', value: 'elementary3' },
  { label: 'Grade 4', value: 'elementary4' },
  { label: 'Grade 5', value: 'elementary5' },
  { label: 'Grade 6', value: 'elementary6' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Non-Joyo', value: 'non-joyo' }
]

const KENTEI_OPTIONS = [
  { label: 'None', value: NONE_VALUE },
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

const isEditing = ref(false)

// Local edit values - use NONE_VALUE sentinel for null values, convert null to undefined for inputs
const editStrokeCount = ref<number | undefined>(
  props.kanji.strokeCount ?? undefined
)
const strokeCountError = ref<string | undefined>(undefined)
const editJlptLevel = ref(props.kanji.jlptLevel ?? NONE_VALUE)
const editJoyoLevel = ref(props.kanji.joyoLevel ?? NONE_VALUE)
const editKenteiLevel = ref(props.kanji.kenteiLevel ?? NONE_VALUE)
// Use NONE_VALUE for no radical, otherwise string ID
const editRadicalIdStr = ref(props.kanji.radicalId?.toString() ?? NONE_VALUE)

// Reset edit values when kanji changes
watch(
  () => props.kanji,
  (newKanji) => {
    editStrokeCount.value = newKanji.strokeCount ?? undefined
    editJlptLevel.value = newKanji.jlptLevel ?? NONE_VALUE
    editJoyoLevel.value = newKanji.joyoLevel ?? NONE_VALUE
    editKenteiLevel.value = newKanji.kenteiLevel ?? NONE_VALUE
    editRadicalIdStr.value = newKanji.radicalId?.toString() ?? NONE_VALUE
  }
)

// Convert radical options to ComboboxOption format
interface RadicalComboboxOption {
  label: string
  value: string
  [key: string]: unknown
}
const radicalComboboxOptions = computed<RadicalComboboxOption[]>(() => {
  const options: RadicalComboboxOption[] = [
    { label: 'None', value: NONE_VALUE }
  ]
  if (props.radicalOptions) {
    props.radicalOptions.forEach((c) => {
      options.push({
        label: `${c.character}${c.kangxiMeaning ? ` (${c.kangxiMeaning})` : ''}`,
        value: String(c.id)
      })
    })
  }
  return options
})

// Display values
const jlptDisplay = computed(() => {
  if (!props.kanji.jlptLevel) return '—'
  if (props.kanji.jlptLevel === 'non-jlpt') return 'Non-JLPT'
  return props.kanji.jlptLevel
})
const joyoDisplay = computed(() => {
  if (!props.kanji.joyoLevel) return '—'
  const labels: Record<string, string> = {
    elementary1: 'Grade 1',
    elementary2: 'Grade 2',
    elementary3: 'Grade 3',
    elementary4: 'Grade 4',
    elementary5: 'Grade 5',
    elementary6: 'Grade 6',
    secondary: 'Secondary',
    'non-joyo': 'Non-Joyo'
  }
  return labels[props.kanji.joyoLevel] ?? '—'
})
const kenteiDisplay = computed(() => props.kanji.kenteiLevel ?? '—')
const radicalDisplay = computed(() => {
  if (!props.radical) return '—'
  return `${props.radical.character}${props.radical.kangxiMeaning ? ` (${props.radical.kangxiMeaning})` : ''}`
})

function startEditing() {
  editStrokeCount.value = props.kanji.strokeCount ?? undefined
  editJlptLevel.value = props.kanji.jlptLevel ?? NONE_VALUE
  editJoyoLevel.value = props.kanji.joyoLevel ?? NONE_VALUE
  editKenteiLevel.value = props.kanji.kenteiLevel ?? NONE_VALUE
  editRadicalIdStr.value = props.kanji.radicalId?.toString() ?? NONE_VALUE
  isEditing.value = true
}

function handleSave() {
  // Validate stroke count before saving
  if (!validateStrokeCount(editStrokeCount.value)) {
    return // Block save if validation fails
  }

  // Emit updates for each changed field - convert undefined or 0 to null for strokeCount
  const strokeCountValue =
    editStrokeCount.value === 0 ? null : (editStrokeCount.value ?? null)
  if (strokeCountValue !== props.kanji.strokeCount) {
    emit('update', 'strokeCount', strokeCountValue)
  }
  // Convert NONE_VALUE sentinel back to null
  const newJlpt =
    editJlptLevel.value === NONE_VALUE ? null : editJlptLevel.value
  if (newJlpt !== props.kanji.jlptLevel) {
    emit('update', 'jlptLevel', newJlpt as JlptLevel | null)
  }
  const newJoyo =
    editJoyoLevel.value === NONE_VALUE ? null : editJoyoLevel.value
  if (newJoyo !== props.kanji.joyoLevel) {
    emit('update', 'joyoLevel', newJoyo as JoyoLevel | null)
  }
  const newKentei =
    editKenteiLevel.value === NONE_VALUE ? null : editKenteiLevel.value
  if (newKentei !== props.kanji.kenteiLevel) {
    emit('update', 'kenteiLevel', newKentei)
  }
  // Convert NONE_VALUE sentinel or string radical ID back to number | null
  const newRadicalId =
    editRadicalIdStr.value === NONE_VALUE
      ? null
      : parseInt(editRadicalIdStr.value, 10)
  if (newRadicalId !== props.kanji.radicalId) {
    emit('update', 'radicalId', newRadicalId)
  }
  isEditing.value = false
}

function handleCancel() {
  editStrokeCount.value = props.kanji.strokeCount ?? undefined
  editJlptLevel.value = props.kanji.jlptLevel ?? NONE_VALUE
  editJoyoLevel.value = props.kanji.joyoLevel ?? NONE_VALUE
  editKenteiLevel.value = props.kanji.kenteiLevel ?? NONE_VALUE
  editRadicalIdStr.value = props.kanji.radicalId?.toString() ?? NONE_VALUE
  strokeCountError.value = undefined
  isEditing.value = false
}

function validateStrokeCount(value: number | undefined): boolean {
  if (value === undefined || value === 0) {
    strokeCountError.value = undefined
    return true
  }
  if (value < 0) {
    strokeCountError.value = 'Stroke count cannot be negative'
    return false
  }
  if (value > 64) {
    strokeCountError.value = 'Stroke count must be at most 64'
    return false
  }
  strokeCountError.value = undefined
  return true
}

function handleStrokeCountInput(value: string | number | undefined) {
  if (value === '' || value === undefined) {
    editStrokeCount.value = undefined
    strokeCountError.value = undefined
    return
  }
  const num = typeof value === 'number' ? value : Number(value)
  editStrokeCount.value = num
  validateStrokeCount(num)
}
</script>

<template>
  <div class="kanji-detail-basic-info">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="kanji-detail-basic-info-grid">
        <div class="kanji-detail-basic-info-item">
          <span class="kanji-detail-basic-info-label">Stroke Count</span>
          <span class="kanji-detail-basic-info-value">{{
            kanji.strokeCount ?? '—'
          }}</span>
        </div>
        <div class="kanji-detail-basic-info-item">
          <span class="kanji-detail-basic-info-label">JLPT Level</span>
          <span class="kanji-detail-basic-info-value">{{ jlptDisplay }}</span>
        </div>
        <div class="kanji-detail-basic-info-item">
          <span class="kanji-detail-basic-info-label">Jōyō Grade</span>
          <span class="kanji-detail-basic-info-value">{{ joyoDisplay }}</span>
        </div>
        <div class="kanji-detail-basic-info-item">
          <span class="kanji-detail-basic-info-label">Kentei Level</span>
          <span class="kanji-detail-basic-info-value">{{ kenteiDisplay }}</span>
        </div>
        <div class="kanji-detail-basic-info-item">
          <span class="kanji-detail-basic-info-label">Radical</span>
          <span class="kanji-detail-basic-info-value">{{
            radicalDisplay
          }}</span>
        </div>
      </div>
      <div class="kanji-detail-basic-info-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="startEditing"
        >
          Edit
        </BaseButton>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div class="kanji-detail-basic-info-edit-grid">
        <div class="kanji-detail-basic-info-edit-field">
          <BaseInput
            :error="strokeCountError"
            label="Stroke Count"
            min="1"
            :model-value="editStrokeCount"
            type="number"
            @update:model-value="handleStrokeCountInput"
          />
        </div>
        <div class="kanji-detail-basic-info-edit-field">
          <BaseSelect
            v-model="editJlptLevel"
            label="JLPT Level"
            :options="JLPT_OPTIONS"
          />
        </div>
        <div class="kanji-detail-basic-info-edit-field">
          <BaseSelect
            v-model="editJoyoLevel"
            label="Jōyō Grade"
            :options="JOYO_OPTIONS"
          />
        </div>
        <div class="kanji-detail-basic-info-edit-field">
          <BaseSelect
            v-model="editKenteiLevel"
            label="Kentei Level"
            :options="KENTEI_OPTIONS"
          />
        </div>
        <div class="kanji-detail-basic-info-edit-field">
          <BaseCombobox
            v-model="editRadicalIdStr"
            display-key="label"
            label="Radical"
            :options="radicalComboboxOptions"
            value-key="value"
          />
        </div>
      </div>
      <div class="kanji-detail-basic-info-actions">
        <BaseButton
          size="sm"
          variant="secondary"
          @click="handleCancel"
        >
          Cancel
        </BaseButton>
        <BaseButton
          size="sm"
          @click="handleSave"
        >
          Save
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kanji-detail-basic-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.kanji-detail-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-detail-basic-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-detail-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.kanji-detail-basic-info-edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.kanji-detail-basic-info-edit-field {
  display: flex;
  flex-direction: column;
}

.kanji-detail-basic-info-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}
</style>
