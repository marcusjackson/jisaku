<script setup lang="ts">
/**
 * KanjiListFilterStrokeDiagrams
 *
 * Filter for stroke order diagram/animation presence.
 * Allows filtering for kanji that have or are missing diagrams/animations.
 */

import { BaseSelect } from '@/base/components'

import type { StrokeOrderFilterValue } from '../kanji-list-types'

defineProps<{
  diagramValue: StrokeOrderFilterValue
  animationValue: StrokeOrderFilterValue
}>()

const emit = defineEmits<{
  'update:diagramValue': [value: StrokeOrderFilterValue]
  'update:animationValue': [value: StrokeOrderFilterValue]
}>()

const NONE_VALUE = '__none__'

const options = [
  { value: NONE_VALUE, label: '指定なし' },
  { value: 'has', label: 'あり' },
  { value: 'missing', label: 'なし' }
]

function handleDiagramChange(value: string | null | undefined): void {
  emit(
    'update:diagramValue',
    value === 'has' || value === 'missing' ? value : null
  )
}

function handleAnimationChange(value: string | null | undefined): void {
  emit(
    'update:animationValue',
    value === 'has' || value === 'missing' ? value : null
  )
}
</script>

<template>
  <div class="kanji-list-filter-stroke-diagrams">
    <div class="kanji-list-filter-stroke-diagrams-item">
      <BaseSelect
        label="Stroke Order Diagram"
        :model-value="diagramValue ?? NONE_VALUE"
        :options="options"
        @update:model-value="handleDiagramChange"
      />
    </div>
    <div class="kanji-list-filter-stroke-diagrams-item">
      <BaseSelect
        label="Stroke Order Animation"
        :model-value="animationValue ?? NONE_VALUE"
        :options="options"
        @update:model-value="handleAnimationChange"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filter-stroke-diagrams {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.kanji-list-filter-stroke-diagrams-item {
  flex: 1 1 auto;
  min-width: 150px;
}

@media (width <= 640px) {
  .kanji-list-filter-stroke-diagrams-item {
    min-width: 100%;
  }
}
</style>
