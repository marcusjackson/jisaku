<!--
KanjiDetailReadingGroupMeaningsList

Component for displaying and managing meanings within a reading group.
-->

<script setup lang="ts">
import { BaseButton } from '@/base/components'

import type { EditMeaning } from '../kanji-detail-types'

defineProps<{
  groupId: number
  meanings: EditMeaning[]
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  moveUp: [meaningIndex: number]
  moveDown: [meaningIndex: number]
  remove: [meaningId: number]
}>()
</script>

<template>
  <div class="group-meanings-content">
    <div class="group-meanings-label">Meanings in this group:</div>

    <div
      v-if="meanings.length === 0"
      class="group-meanings-empty"
    >
      No meanings assigned.
    </div>

    <ol
      v-else
      class="group-meanings-list"
      :start="1"
    >
      <li
        v-for="(meaning, mIndex) in meanings"
        :key="meaning.id"
        class="group-meaning-item"
      >
        <span class="group-meaning-text">
          {{ meaning.meaningText }}
        </span>
        <div class="group-meaning-actions">
          <BaseButton
            aria-label="Move up"
            :disabled="mIndex === 0"
            size="sm"
            variant="ghost"
            @click="emit('moveUp', mIndex)"
          >
            ↑
          </BaseButton>
          <BaseButton
            aria-label="Move down"
            :disabled="mIndex === meanings.length - 1"
            size="sm"
            variant="ghost"
            @click="emit('moveDown', mIndex)"
          >
            ↓
          </BaseButton>
          <BaseButton
            v-if="destructiveMode"
            aria-label="Remove from group"
            size="sm"
            variant="ghost"
            @click="emit('remove', meaning.id)"
          >
            Remove
          </BaseButton>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.group-meanings-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.group-meanings-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.group-meanings-empty {
  padding: var(--spacing-xs);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.group-meanings-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  list-style: decimal;
}

.group-meaning-item {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
}

.group-meaning-text {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-sm);
  overflow-wrap: break-word;
}

.group-meaning-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-xs);
}

/* Mobile: Stack buttons below meaning text */
@media (width <= 480px) {
  .group-meaning-item {
    flex-direction: column;
    align-items: stretch;
  }

  .group-meaning-actions {
    justify-content: flex-end;
  }
}
</style>
