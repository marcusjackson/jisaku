<script setup lang="ts">
/**
 * SharedCardSubEntity
 *
 * Generic entity card for displaying kanji, components, or vocabulary.
 * Shows character, short meaning, badges, and action buttons.
 *
 * Features:
 * - Display character with large font
 * - Short meaning and optional badges
 * - View and Remove action buttons
 * - Remove button hidden in view mode
 */

import BaseButton from '@/base/components/BaseButton.vue'

interface Props {
  /** Entity character (kanji, component, or vocab word) */
  character: string
  /** Short meaning/definition */
  shortMeaning?: string | null
  /** Badge array (e.g., JLPT level, stroke count, etc.) */
  badges?: string[]
  /** Show view button */
  showView?: boolean
  /** Show remove button */
  showRemove?: boolean
  /** Additional note text to display */
  note?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  showView: false,
  showRemove: false,
  badges: () => [],
  shortMeaning: null,
  note: null
})

defineEmits<{
  view: []
  remove: []
}>()
</script>

<template>
  <div class="shared-card-sub-entity">
    <div class="shared-card-sub-entity-main">
      <span class="shared-card-sub-entity-character">{{
        props.character
      }}</span>
      <div class="shared-card-sub-entity-info">
        <span
          v-if="props.shortMeaning"
          class="shared-card-sub-entity-meaning"
        >
          {{ props.shortMeaning }}
        </span>
        <div
          v-if="props.badges && props.badges.length > 0"
          class="shared-card-sub-entity-badges"
        >
          <span
            v-for="(badge, index) in props.badges"
            :key="index"
            class="shared-card-sub-entity-badge"
          >
            {{ badge }}
          </span>
        </div>
        <p
          v-if="props.note"
          class="shared-card-sub-entity-note"
        >
          {{ props.note }}
        </p>
      </div>
    </div>

    <div
      v-if="props.showView || props.showRemove"
      class="shared-card-sub-entity-actions"
    >
      <BaseButton
        v-if="props.showView"
        size="sm"
        variant="secondary"
        @click="$emit('view')"
      >
        View
      </BaseButton>
      <BaseButton
        v-if="props.showRemove"
        size="sm"
        variant="danger"
        @click="$emit('remove')"
      >
        Remove
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.shared-card-sub-entity {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
}

.shared-card-sub-entity-main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.shared-card-sub-entity-character {
  flex-shrink: 0;
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.shared-card-sub-entity-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.shared-card-sub-entity-meaning {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-card-sub-entity-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.shared-card-sub-entity-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.shared-card-sub-entity-note {
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-card-sub-entity-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}
</style>
