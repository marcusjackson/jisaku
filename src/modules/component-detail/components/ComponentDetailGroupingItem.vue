<script setup lang="ts">
/**
 * ComponentDetailGroupingItem
 *
 * Displays a single grouping row with name, count badge,
 * optional description, inline member preview, and action buttons.
 */

import { computed } from 'vue'

import { BaseButton } from '@/base/components'

import ComponentDetailGroupingMemberPreview from './ComponentDetailGroupingMemberPreview.vue'

import type {
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

const props = defineProps<{
  /** The grouping to display */
  grouping: ComponentGroupingWithMembers
  /** Resolved member occurrences in display order */
  memberOccurrences: OccurrenceWithKanji[]
  /** Position in list for reorder button state */
  index: number
  /** Total groupings count for reorder button state */
  total: number
  /** Show delete button */
  isDestructiveMode: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'move-up': []
  'move-down': []
  'manage-members': []
}>()

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)
</script>

<template>
  <div
    class="grouping-item"
    :data-testid="`grouping-item-${grouping.id}`"
  >
    <div class="grouping-item-reorder">
      <BaseButton
        aria-label="Move up"
        :disabled="!canMoveUp"
        size="sm"
        variant="ghost"
        @click="emit('move-up')"
      >
        ↑
      </BaseButton>
      <BaseButton
        aria-label="Move down"
        :disabled="!canMoveDown"
        size="sm"
        variant="ghost"
        @click="emit('move-down')"
      >
        ↓
      </BaseButton>
    </div>

    <div class="grouping-item-content">
      <div class="grouping-item-header">
        <span class="grouping-item-name">{{ grouping.name }}</span>
        <span class="grouping-item-count"
          >{{ grouping.occurrenceCount }} kanji</span
        >
      </div>
      <p
        v-if="grouping.description"
        class="grouping-item-description"
      >
        {{ grouping.description }}
      </p>

      <ComponentDetailGroupingMemberPreview :occurrences="memberOccurrences" />
    </div>

    <div class="grouping-item-actions">
      <BaseButton
        aria-label="Edit"
        size="sm"
        variant="secondary"
        @click="emit('edit')"
      >
        Edit
      </BaseButton>
      <BaseButton
        aria-label="Manage Members"
        size="sm"
        variant="secondary"
        @click="emit('manage-members')"
      >
        Members
      </BaseButton>
      <BaseButton
        v-if="isDestructiveMode"
        aria-label="Delete"
        size="sm"
        variant="danger"
        @click="emit('delete')"
      >
        Delete
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.grouping-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.grouping-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.grouping-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
}

.grouping-item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.grouping-item-name {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.grouping-item-count {
  padding: var(--spacing-1) var(--spacing-xs);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.grouping-item-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

.grouping-item-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}

@media (width <= 640px) {
  .grouping-item {
    flex-direction: column;
  }

  .grouping-item-reorder {
    flex-direction: row;
  }

  .grouping-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
