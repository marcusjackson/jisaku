<script setup lang="ts">
/**
 * ComponentDetailBasicInfo
 *
 * UI component displaying basic component information with inline editing.
 * Shows: stroke count, source kanji, and radical attributes (when canBeRadical).
 *
 * Edit mode allows modifying all fields inline.
 */

import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseCheckbox from '@/base/components/BaseCheckbox.vue'
import BaseCombobox from '@/base/components/BaseCombobox.vue'
import BaseInput from '@/base/components/BaseInput.vue'

import type { Component, Kanji } from '@/shared/types/database-types'

const props = defineProps<{
  component: Component
  sourceKanji?: Kanji | null
  /** Available kanji for source kanji selection */
  kanjiOptions?: Kanji[]
}>()

const emit = defineEmits<{
  update: [field: string, value: string | number | boolean | null]
}>()

// Use '__none__' as sentinel value for "None" option
const NONE_VALUE = '__none__'

const isEditing = ref(false)

// Local edit values - use undefined for null stroke count for input compatibility
const editStrokeCount = ref<number | undefined>(
  props.component.strokeCount ?? undefined
)
const strokeCountError = ref<string | undefined>(undefined)
const editSourceKanjiIdStr = ref(
  props.component.sourceKanjiId?.toString() ?? NONE_VALUE
)
const editCanBeRadical = ref(props.component.canBeRadical)
const editKangxiNumber = ref<number | undefined>(
  props.component.kangxiNumber ?? undefined
)
const editKangxiMeaning = ref(props.component.kangxiMeaning ?? '')
const editRadicalNameJapanese = ref(props.component.radicalNameJapanese ?? '')

// Reset edit values when component changes
watch(
  () => props.component,
  (newComponent) => {
    editStrokeCount.value = newComponent.strokeCount ?? undefined
    editSourceKanjiIdStr.value =
      newComponent.sourceKanjiId?.toString() ?? NONE_VALUE
    editCanBeRadical.value = newComponent.canBeRadical
    editKangxiNumber.value = newComponent.kangxiNumber ?? undefined
    editKangxiMeaning.value = newComponent.kangxiMeaning ?? ''
    editRadicalNameJapanese.value = newComponent.radicalNameJapanese ?? ''
  }
)

// Convert kanji options to ComboboxOption format
interface KanjiComboboxOption {
  label: string
  value: string
  [key: string]: unknown
}

const kanjiComboboxOptions = computed<KanjiComboboxOption[]>(() => {
  const options: KanjiComboboxOption[] = [{ label: 'None', value: NONE_VALUE }]
  if (props.kanjiOptions) {
    props.kanjiOptions.forEach((k) => {
      options.push({
        label: `${k.character}${k.shortMeaning ? ` (${k.shortMeaning})` : ''}`,
        value: String(k.id)
      })
    })
  }
  return options
})

// Display values
const sourceKanjiDisplay = computed(() => {
  if (!props.sourceKanji) return '—'
  return `${props.sourceKanji.character}${props.sourceKanji.shortMeaning ? ` (${props.sourceKanji.shortMeaning})` : ''}`
})

function startEditing() {
  editStrokeCount.value = props.component.strokeCount ?? undefined
  editSourceKanjiIdStr.value =
    props.component.sourceKanjiId?.toString() ?? NONE_VALUE
  editCanBeRadical.value = props.component.canBeRadical
  editKangxiNumber.value = props.component.kangxiNumber ?? undefined
  editKangxiMeaning.value = props.component.kangxiMeaning ?? ''
  editRadicalNameJapanese.value = props.component.radicalNameJapanese ?? ''
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
  if (strokeCountValue !== props.component.strokeCount) {
    emit('update', 'strokeCount', strokeCountValue)
  }

  const newSourceKanjiId =
    editSourceKanjiIdStr.value === NONE_VALUE
      ? null
      : parseInt(editSourceKanjiIdStr.value, 10)
  if (newSourceKanjiId !== props.component.sourceKanjiId) {
    emit('update', 'sourceKanjiId', newSourceKanjiId)
  }

  if (editCanBeRadical.value !== props.component.canBeRadical) {
    emit('update', 'canBeRadical', editCanBeRadical.value)
  }

  // Radical attributes (only save if canBeRadical is true)
  if (editCanBeRadical.value) {
    const newKangxiNumber = editKangxiNumber.value ?? null
    if (newKangxiNumber !== props.component.kangxiNumber) {
      emit('update', 'kangxiNumber', newKangxiNumber)
    }
    const newKangxiMeaning = editKangxiMeaning.value || null
    if (newKangxiMeaning !== props.component.kangxiMeaning) {
      emit('update', 'kangxiMeaning', newKangxiMeaning)
    }
    const newRadicalName = editRadicalNameJapanese.value || null
    if (newRadicalName !== props.component.radicalNameJapanese) {
      emit('update', 'radicalNameJapanese', newRadicalName)
    }
  }

  isEditing.value = false
}

function handleCancel() {
  editStrokeCount.value = props.component.strokeCount ?? undefined
  editSourceKanjiIdStr.value =
    props.component.sourceKanjiId?.toString() ?? NONE_VALUE
  editCanBeRadical.value = props.component.canBeRadical
  editKangxiNumber.value = props.component.kangxiNumber ?? undefined
  editKangxiMeaning.value = props.component.kangxiMeaning ?? ''
  editRadicalNameJapanese.value = props.component.radicalNameJapanese ?? ''
  isEditing.value = false
}

function handleCanBeRadicalChange(value: boolean | 'indeterminate') {
  if (value === 'indeterminate') return
  editCanBeRadical.value = value
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
  <div class="component-detail-basic-info">
    <!-- View mode -->
    <template v-if="!isEditing">
      <div class="component-detail-basic-info-section">
        <h4 class="component-detail-basic-info-section-title">
          General Attributes
        </h4>
        <div class="component-detail-basic-info-grid">
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label">Stroke Count</span>
            <span class="component-detail-basic-info-value">{{
              component.strokeCount ?? '—'
            }}</span>
          </div>
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label">Source Kanji</span>
            <span class="component-detail-basic-info-value">
              <RouterLink
                v-if="sourceKanji"
                class="component-detail-basic-info-link"
                :to="`/kanji/${sourceKanji.id}`"
              >
                {{ sourceKanjiDisplay }}
              </RouterLink>
              <span v-else>—</span>
            </span>
          </div>
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label"
              >Can be Radical</span
            >
            <span class="component-detail-basic-info-value">
              {{ component.canBeRadical ? 'Yes 🔶' : 'No' }}
            </span>
          </div>
        </div>
      </div>

      <div
        v-if="component.canBeRadical"
        class="component-detail-basic-info-section"
      >
        <h4 class="component-detail-basic-info-section-title">
          Radical Attributes
        </h4>
        <div class="component-detail-basic-info-grid">
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label">Kangxi Number</span>
            <span class="component-detail-basic-info-value">{{
              component.kangxiNumber ?? '—'
            }}</span>
          </div>
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label"
              >Kangxi Meaning</span
            >
            <span class="component-detail-basic-info-value">{{
              component.kangxiMeaning ?? '—'
            }}</span>
          </div>
          <div class="component-detail-basic-info-item">
            <span class="component-detail-basic-info-label">Radical Name</span>
            <span class="component-detail-basic-info-value">{{
              component.radicalNameJapanese ?? '—'
            }}</span>
          </div>
        </div>
      </div>

      <div class="component-detail-basic-info-actions">
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
      <div class="component-detail-basic-info-section">
        <h4 class="component-detail-basic-info-section-title">
          General Attributes
        </h4>
        <div class="component-detail-basic-info-edit-grid">
          <div class="component-detail-basic-info-edit-field">
            <BaseInput
              :error="strokeCountError"
              label="Stroke Count"
              min="1"
              :model-value="editStrokeCount"
              type="number"
              @update:model-value="handleStrokeCountInput"
            />
          </div>
          <div class="component-detail-basic-info-edit-field">
            <BaseCombobox
              v-model="editSourceKanjiIdStr"
              display-key="label"
              label="Source Kanji"
              :options="kanjiComboboxOptions"
              value-key="value"
            />
          </div>
          <div class="component-detail-basic-info-edit-field">
            <BaseCheckbox
              label="Can be Radical"
              :model-value="editCanBeRadical"
              name="canBeRadical"
              @update:model-value="handleCanBeRadicalChange"
            />
          </div>
        </div>
      </div>

      <div
        v-if="editCanBeRadical"
        class="component-detail-basic-info-section"
      >
        <h4 class="component-detail-basic-info-section-title">
          Radical Attributes
        </h4>
        <div class="component-detail-basic-info-edit-grid">
          <div class="component-detail-basic-info-edit-field">
            <BaseInput
              v-model.number="editKangxiNumber"
              label="Kangxi Number"
              max="214"
              min="1"
              type="number"
            />
          </div>
          <div class="component-detail-basic-info-edit-field">
            <BaseInput
              v-model="editKangxiMeaning"
              label="Kangxi Meaning"
              placeholder="e.g., sun, water"
            />
          </div>
          <div class="component-detail-basic-info-edit-field">
            <BaseInput
              v-model="editRadicalNameJapanese"
              label="Radical Name (Japanese)"
              placeholder="e.g., にちへん"
            />
          </div>
        </div>
      </div>

      <div class="component-detail-basic-info-actions">
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
.component-detail-basic-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.component-detail-basic-info-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-basic-info-section-title {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

.component-detail-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-basic-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.component-detail-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.component-detail-basic-info-link {
  color: var(--color-primary);
  text-decoration: none;
}

.component-detail-basic-info-link:hover {
  text-decoration: underline;
}

.component-detail-basic-info-edit-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.component-detail-basic-info-edit-field {
  display: flex;
  flex-direction: column;
}

.component-detail-basic-info-actions {
  display: flex;
  justify-content: flex-start;
  gap: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
}
</style>
