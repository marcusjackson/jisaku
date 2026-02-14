<script setup lang="ts">
import { BaseButton } from '@/base/components'
import { BaseSelect } from '@/base/components'

import {
  ANALYSIS_FIELD_LABELS,
  ANALYSIS_THRESHOLD_LABELS,
  type AnalysisFieldFilter,
  type AnalysisFieldName,
  type AnalysisLengthThreshold
} from '../kanji-list-types'

const props = defineProps<{
  modelValue: AnalysisFieldFilter[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: AnalysisFieldFilter[]]
}>()

const NONE_VALUE = '__none__'

const fieldOptions = [
  { value: NONE_VALUE, label: 'Select field...' },
  ...Object.entries(ANALYSIS_FIELD_LABELS).map(([value, label]) => ({
    value,
    label
  }))
]

const thresholdOptions = Object.entries(ANALYSIS_THRESHOLD_LABELS).map(
  ([value, label]) => ({ value, label })
)

function addFilter(field: string | null | undefined): void {
  if (!field || field === NONE_VALUE) return
  const existing = props.modelValue.find((f) => f.field === field)
  if (existing) return

  emit('update:modelValue', [
    ...props.modelValue,
    { field: field as AnalysisFieldName, threshold: 'empty' }
  ])
}

function updateThreshold(
  field: AnalysisFieldName,
  threshold: string | null | undefined
): void {
  if (!threshold) return
  const updated = props.modelValue.map((f) =>
    f.field === field
      ? { ...f, threshold: threshold as AnalysisLengthThreshold }
      : f
  )
  emit('update:modelValue', updated)
}

function removeFilter(field: AnalysisFieldName): void {
  emit(
    'update:modelValue',
    props.modelValue.filter((f) => f.field !== field)
  )
}
</script>

<template>
  <div class="kanji-list-filter-analysis">
    <span class="kanji-list-filter-analysis-label">Analysis Field</span>

    <!-- Active filters -->
    <div
      v-if="modelValue.length > 0"
      class="kanji-list-filter-analysis-active"
    >
      <div
        v-for="filter in modelValue"
        :key="filter.field"
        class="kanji-list-filter-analysis-item"
      >
        <span class="kanji-list-filter-analysis-field">
          {{ ANALYSIS_FIELD_LABELS[filter.field] }}
        </span>
        <BaseSelect
          :model-value="filter.threshold"
          :options="thresholdOptions"
          @update:model-value="updateThreshold(filter.field, $event)"
        />
        <BaseButton
          size="sm"
          variant="ghost"
          @click="removeFilter(filter.field)"
        >
          ×
        </BaseButton>
      </div>
    </div>

    <!-- Add new filter -->
    <BaseSelect
      :model-value="NONE_VALUE"
      :options="fieldOptions"
      placeholder="Add field..."
      @update:model-value="addFilter"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-analysis {
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  gap: var(--spacing-sm);
  min-width: 200px;
}

.kanji-list-filter-analysis-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-list-filter-analysis-active {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-list-filter-analysis-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-variant);
}

.kanji-list-filter-analysis-item :deep(.base-select) {
  min-width: 180px;
}

.kanji-list-filter-analysis-field {
  min-width: 60px;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

@media (width <= 640px) {
  .kanji-list-filter-analysis {
    min-width: 100%;
  }

  .kanji-list-filter-analysis-item {
    flex-wrap: wrap;
  }

  .kanji-list-filter-analysis-item :deep(.base-select) {
    min-width: calc(100% - 4.5rem);
  }

  .kanji-list-filter-analysis-field {
    width: 100%;
  }
}
</style>
