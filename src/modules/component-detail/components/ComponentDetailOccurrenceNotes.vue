<script setup lang="ts">
/**
 * ComponentDetailOccurrenceNotes
 *
 * Displays analysis notes with truncation and show more/less toggle.
 * Notes longer than maxLength will be truncated with a toggle button.
 */

import { computed, ref } from 'vue'

import { BaseButton } from '@/base/components'

const props = withDefaults(
  defineProps<{
    /** Analysis notes text (nullable) */
    notes: string | null
    /** Maximum length before truncation */
    maxLength?: number
  }>(),
  {
    maxLength: 100
  }
)

const isExpanded = ref(false)

const shouldTruncate = computed(() => {
  return props.notes !== null && props.notes.length > props.maxLength
})

const displayText = computed(() => {
  if (!props.notes || props.notes.length === 0) return null
  if (!shouldTruncate.value || isExpanded.value) return props.notes
  return props.notes.slice(0, props.maxLength)
})

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div
    v-if="displayText"
    class="occurrence-notes"
  >
    <p
      class="occurrence-notes-text"
      :class="{ 'is-expanded': isExpanded }"
    >
      {{ displayText }}{{ !isExpanded && shouldTruncate ? '...' : '' }}
    </p>
    <BaseButton
      v-if="shouldTruncate"
      class="occurrence-notes-toggle"
      size="sm"
      variant="ghost"
      @click="toggleExpanded"
    >
      {{ isExpanded ? 'Show less' : 'Show more' }}
    </BaseButton>
  </div>
</template>

<style scoped>
.occurrence-notes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.occurrence-notes-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
  transition: max-height var(--transition-fast);
}

.occurrence-notes-toggle {
  align-self: flex-start;
  padding: var(--spacing-1) var(--spacing-2);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
}
</style>
