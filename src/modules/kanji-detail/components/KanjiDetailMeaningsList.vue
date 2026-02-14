<script setup lang="ts">
/**
 * KanjiDetailMeaningsList
 *
 * List of meaning items with add/edit/delete/reorder controls.
 * Used by KanjiDetailDialogMeanings for managing meanings.
 */

import { BaseButton } from '@/base/components'

import KanjiDetailMeaningItem from './KanjiDetailMeaningItem.vue'

import type { EditMeaning } from '../kanji-detail-types'

defineProps<{
  meanings: EditMeaning[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  add: []
  'update:meaningText': [index: number, value: string]
  'update:additionalInfo': [index: number, value: string]
  move: [index: number, direction: -1 | 1]
  delete: [index: number]
}>()
</script>

<template>
  <div class="meanings-list-section">
    <div class="meanings-list-header">
      <h3 class="meanings-list-title">Meanings</h3>
      <BaseButton
        size="sm"
        variant="ghost"
        @click="emit('add')"
      >
        + Add
      </BaseButton>
    </div>

    <div
      v-if="meanings.length === 0"
      class="meanings-empty"
    >
      No meanings
    </div>

    <div
      v-else
      class="meanings-list"
    >
      <KanjiDetailMeaningItem
        v-for="(meaning, index) in meanings"
        :key="meaning.id"
        :additional-info="meaning.additionalInfo"
        :destructive-mode="destructiveMode ?? false"
        :index="index"
        :meaning-text="meaning.meaningText"
        :total="meanings.length"
        @delete="emit('delete', index)"
        @move-down="emit('move', index, 1)"
        @move-up="emit('move', index, -1)"
        @update:additional-info="emit('update:additionalInfo', index, $event)"
        @update:meaning-text="emit('update:meaningText', index, $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.meanings-list-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.meanings-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meanings-list-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.meanings-empty {
  padding: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.meanings-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
</style>
