<script setup lang="ts">
/**
 * SharedKanjiCard
 *
 * Shared component for displaying kanji in cross-module contexts.
 * Used when showing kanji on component pages, vocab pages, etc.
 */

import { computed } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import type { Kanji } from '../types/database-types'

const props = defineProps<{
  kanji: Kanji
  /** Show remove button */
  showRemove?: boolean
  /** Show view button */
  showView?: boolean
  /** Additional info to display (e.g., "Radical", position badge) */
  badge?: string
  /** Small note text to display */
  note?: string
}>()

const emit = defineEmits<{
  view: []
  remove: []
}>()

const jlptBadgeClass = computed(() => {
  if (!props.kanji.jlptLevel) return ''
  return `shared-kanji-card-badge-jlpt-${props.kanji.jlptLevel.toLowerCase()}`
})
</script>

<template>
  <div class="shared-kanji-card">
    <div class="shared-kanji-card-main">
      <span class="shared-kanji-card-character">{{ kanji.character }}</span>
      <div class="shared-kanji-card-info">
        <span
          v-if="kanji.shortMeaning"
          class="shared-kanji-card-meaning"
        >
          {{ kanji.shortMeaning }}
        </span>
        <div
          v-if="kanji.jlptLevel || badge"
          class="shared-kanji-card-badges"
        >
          <span
            v-if="kanji.jlptLevel"
            class="shared-kanji-card-badge"
            :class="jlptBadgeClass"
          >
            {{ kanji.jlptLevel }}
          </span>
          <span
            v-if="badge"
            class="shared-kanji-card-badge shared-kanji-card-badge-custom"
          >
            {{ badge }}
          </span>
        </div>
        <p
          v-if="note"
          class="shared-kanji-card-note"
        >
          {{ note }}
        </p>
      </div>
    </div>

    <div
      v-if="showView || showRemove"
      class="shared-kanji-card-actions"
    >
      <BaseButton
        v-if="showView"
        size="sm"
        variant="secondary"
        @click="emit('view')"
      >
        View
      </BaseButton>
      <BaseButton
        v-if="showRemove"
        size="sm"
        variant="danger"
        @click="emit('remove')"
      >
        Remove
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.shared-kanji-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
}

.shared-kanji-card-main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.shared-kanji-card-character {
  flex-shrink: 0;
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.shared-kanji-card-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.shared-kanji-card-meaning {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-kanji-card-strokes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shared-kanji-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.shared-kanji-card-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

/* JLPT level colors */
.shared-kanji-card-badge-jlpt-n5 {
  background-color: var(--color-success-bg);
  color: var(--color-success);
}

.shared-kanji-card-badge-jlpt-n4 {
  background-color: var(--color-info-bg);
  color: var(--color-info);
}

.shared-kanji-card-badge-jlpt-n3 {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.shared-kanji-card-badge-jlpt-n2 {
  background-color: var(--color-error-bg);
  color: var(--color-primary);
}

.shared-kanji-card-badge-jlpt-n1 {
  background-color: var(--color-error-bg);
  color: var(--color-error);
}

.shared-kanji-card-badge-custom {
  background-color: var(--color-background);
  color: var(--color-text-secondary);
}

.shared-kanji-card-note {
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-kanji-card-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}
</style>
