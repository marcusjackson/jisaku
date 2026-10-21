<script setup lang="ts">
/**
 * ComponentDetailGroupingMemberPreview
 *
 * Inline preview of grouping member kanji with expand/collapse.
 * Shows first N members with a "Show more" toggle when there are extras.
 */

import { computed, ref } from 'vue'

import type { OccurrenceWithKanji } from '@/api/component'

const props = defineProps<{
  /** Resolved member occurrences in display order */
  occurrences: OccurrenceWithKanji[]
}>()

/** Max members to show before requiring "Show more" */
const PREVIEW_LIMIT = 5

const isExpanded = ref(false)

const visibleOccurrences = computed(() =>
  isExpanded.value ? props.occurrences : props.occurrences.slice(0, PREVIEW_LIMIT)
)
</script>

<template>
  <div v-if="occurrences.length > 0" class="member-preview">
    <span
      v-for="occ in visibleOccurrences"
      :key="occ.id"
      class="member-kanji"
      lang="ja"
      :title="occ.kanji.shortMeaning ?? occ.kanji.character"
      >{{ occ.kanji.character }}</span
    >
    <!-- Raw <button>: inline text toggle, bare layout incompatible with BaseButton -->
    <button
      v-if="occurrences.length > PREVIEW_LIMIT"
      class="member-toggle"
      type="button"
      @click="isExpanded = !isExpanded"
    >
      {{
        isExpanded ? 'Show less' : `+${occurrences.length - PREVIEW_LIMIT} more`
      }}
    </button>
  </div>
</template>

<style scoped>
.member-preview {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.member-kanji {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 2em;
  padding: var(--spacing-1) var(--spacing-xs);
  border-radius: var(--radius-sm);
  background-color: var(--color-bg-tertiary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-base);
}

.member-toggle {
  padding: var(--spacing-1) var(--spacing-xs);
  border: none;
  background: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
}

.member-toggle:hover {
  text-decoration: underline;
}

.member-toggle:focus-visible {
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
  outline: none;
}
</style>
