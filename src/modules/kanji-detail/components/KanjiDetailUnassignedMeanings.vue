<!--
KanjiDetailUnassignedMeanings

Component for displaying unassigned meanings notice.
-->

<script setup lang="ts">
import type { EditMeaning } from '../kanji-detail-types'

defineProps<{
  meanings: EditMeaning[]
}>()
</script>

<template>
  <div
    v-if="meanings.length > 0"
    class="unassigned-notice"
  >
    <div class="unassigned-notice-label">Unassigned meanings:</div>
    <ol class="unassigned-notice-list">
      <li
        v-for="meaning in meanings"
        :key="meaning.id"
      >
        {{ meaning.meaningText }}
      </li>
    </ol>
  </div>
</template>

<style scoped>
.unassigned-notice {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 1px dashed var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
}

.unassigned-notice-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.unassigned-notice-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  list-style: decimal;
}
</style>
