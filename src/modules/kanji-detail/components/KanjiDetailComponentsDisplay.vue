<script setup lang="ts">
/**
 * KanjiDetailComponentsDisplay
 *
 * Renders the component occurrence grid in view mode.
 * Displays empty state when no occurrences exist.
 */

import KanjiDetailComponentItem from './KanjiDetailComponentItem.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'

const props = defineProps<{
  /** Array of component occurrences to display */
  occurrences: ComponentOccurrenceWithDetails[]
}>()
</script>

<template>
  <div class="kanji-detail-components-display">
    <div
      v-if="props.occurrences.length === 0"
      class="kanji-detail-components-display-empty"
    >
      <p>No components have been linked to this kanji yet.</p>
    </div>

    <div
      v-else
      class="kanji-detail-components-display-grid"
    >
      <KanjiDetailComponentItem
        v-for="occurrence in props.occurrences"
        :key="occurrence.id"
        :occurrence="occurrence"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-detail-components-display {
  width: 100%;
}

.kanji-detail-components-display-empty {
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  text-align: center;
}

.kanji-detail-components-display-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

/* Allow 2 cards side-by-side on mobile */
@media (width >= 320px) and (width < 768px) {
  .kanji-detail-components-display-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  }
}

/* More cards on larger screens */
@media (width >= 768px) {
  .kanji-detail-components-display-grid {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
}
</style>
