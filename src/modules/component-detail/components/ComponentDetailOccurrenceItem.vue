<script setup lang="ts">
/**
 * ComponentDetailOccurrenceItem
 *
 * Displays a single occurrence with kanji character, position badge,
 * form badge, radical indicator, analysis notes, and action buttons.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/base/components'

import { SharedPositionBadge } from '@/shared/components'

import ComponentDetailOccurrenceNotes from './ComponentDetailOccurrenceNotes.vue'

import type { ComponentForm, OccurrenceWithKanji } from '@/api/component'

const props = defineProps<{
  /** Occurrence with joined kanji and position data */
  occurrence: OccurrenceWithKanji
  /** Available forms for display */
  forms: ComponentForm[]
  /** Position in list for reorder button state */
  index: number
  /** Total items count for reorder button state */
  total: number
  /** Show delete button */
  isDestructiveMode: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'move-up': []
  'move-down': []
}>()

/** Maximum length for analysis notes before truncation */
const MAX_NOTES_LENGTH = 100

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)

// Get the form name if a form is assigned
const assignedForm = computed(() => {
  if (!props.occurrence.componentFormId) return null
  return props.forms.find((f) => f.id === props.occurrence.componentFormId)
})

/** Build kanji detail route path directly (path is simpler than named route) */
const kanjiDetailRoute = computed(
  () => `/kanji/${String(props.occurrence.kanjiId)}`
)
</script>

<template>
  <div
    class="occurrence-item"
    :data-testid="`occurrence-item-${String(occurrence.id)}`"
  >
    <div class="occurrence-item-reorder">
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

    <div class="occurrence-item-content">
      <div class="occurrence-item-header">
        <RouterLink
          class="occurrence-item-kanji"
          :to="kanjiDetailRoute"
        >
          {{ occurrence.kanji.character }}
        </RouterLink>

        <span
          v-if="occurrence.kanji.shortMeaning"
          class="occurrence-item-meaning"
        >
          {{ occurrence.kanji.shortMeaning }}
        </span>

        <SharedPositionBadge
          v-if="occurrence.position"
          :position="occurrence.position"
        />

        <span
          v-if="assignedForm"
          class="occurrence-item-form-badge"
        >
          {{ assignedForm.formName || assignedForm.formCharacter }}
        </span>

        <span
          v-if="occurrence.isRadical"
          class="occurrence-item-radical-badge"
        >
          Radical
        </span>
      </div>

      <ComponentDetailOccurrenceNotes
        :max-length="MAX_NOTES_LENGTH"
        :notes="occurrence.analysisNotes"
      />
    </div>

    <div class="occurrence-item-actions">
      <BaseButton
        aria-label="Edit"
        size="sm"
        variant="secondary"
        @click="emit('edit')"
      >
        Edit
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
.occurrence-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.occurrence-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.occurrence-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
}

.occurrence-item-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.occurrence-item-kanji {
  color: var(--color-text-primary);
  font-family: var(--font-family-jp);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.occurrence-item-kanji:hover {
  color: var(--color-primary);
}

.occurrence-item-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.occurrence-item-form-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.occurrence-item-radical-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  background-color: var(--color-warning-subtle);
  color: var(--color-warning);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.occurrence-item-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}

@media (width <= 640px) {
  .occurrence-item {
    flex-direction: column;
  }

  .occurrence-item-reorder {
    flex-direction: row;
  }

  .occurrence-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
