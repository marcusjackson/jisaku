<script setup lang="ts">
/**
 * KanjiDetailBasicInfoClassificationsList
 *
 * UI component for managing classifications within the basic info dialog.
 */

import { computed } from 'vue'

import { BaseButton, BaseSelect } from '@/base/components'

import type { UseKanjiDetailBasicInfoClassificationsReturn } from '../composables/use-kanji-detail-basic-info-classifications'
import type { ClassificationType } from '@/api/classification/classification-types'

const props = defineProps<{
  classificationsState: UseKanjiDetailBasicInfoClassificationsReturn
  classificationTypes: ClassificationType[]
}>()

const typeOptions = computed(() =>
  props.classificationTypes.map((t) => ({
    label: t.nameJapanese ?? t.typeName,
    value: String(t.id)
  }))
)

function handleAdd(): void {
  const first = props.classificationTypes.find(
    (t) => !props.classificationsState.hasType(t.id)
  )
  if (first) props.classificationsState.add(first.id)
}

function handleTypeChange(
  index: number,
  value: string | null | undefined
): void {
  const item = props.classificationsState.items.value[index]
  if (item && value) item.classificationTypeId = Number(value)
}
</script>

<template>
  <div class="list">
    <div class="list-header">
      <span class="list-title">Classifications</span>
      <BaseButton
        size="sm"
        type="button"
        variant="ghost"
        @click="handleAdd"
        >+ Add</BaseButton
      >
    </div>

    <div
      v-if="classificationsState.items.value.length === 0"
      class="list-empty"
    >
      No classifications
    </div>

    <div
      v-else
      class="list-items"
    >
      <div
        v-for="(item, index) in classificationsState.items.value"
        :key="item.id ?? `new-${index}`"
        class="list-item"
      >
        <span class="list-order">{{ index === 0 ? '★' : index + 1 }}</span>
        <div class="list-field">
          <BaseSelect
            :model-value="String(item.classificationTypeId)"
            :options="typeOptions"
            @update:model-value="handleTypeChange(index, $event)"
          />
        </div>
        <div class="list-buttons">
          <BaseButton
            :disabled="index === 0"
            size="sm"
            type="button"
            variant="ghost"
            @click="classificationsState.moveUp(index)"
            >↑</BaseButton
          >
          <BaseButton
            :disabled="index === classificationsState.items.value.length - 1"
            size="sm"
            type="button"
            variant="ghost"
            @click="classificationsState.moveDown(index)"
            >↓</BaseButton
          >
          <BaseButton
            size="sm"
            type="button"
            variant="ghost"
            @click="classificationsState.removeAt(index)"
            >✕</BaseButton
          >
        </div>
      </div>
    </div>

    <p class="list-hint">★ = Primary classification</p>
  </div>
</template>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.list-empty {
  padding: var(--spacing-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.list-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.list-order {
  flex-shrink: 0;
  width: 24px;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}

.list-field {
  flex: 1;
  min-width: 0;
}

.list-buttons {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-0-5);
}

.list-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
}
</style>
