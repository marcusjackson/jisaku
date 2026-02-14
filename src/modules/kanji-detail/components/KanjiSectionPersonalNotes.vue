<script setup lang="ts">
/**
 * KanjiSectionPersonalNotes
 *
 * Section component for personal notes.
 * Uses SharedSection with collapsible layout and inline textarea editing.
 */

import { ref } from 'vue'

import { SharedSection } from '@/shared/components'

import KanjiDetailNotesTextarea from './KanjiDetailNotesTextarea.vue'

const props = defineProps<{
  /** Current notes content */
  notes: string | null
}>()

const emit = defineEmits<{
  /** Emitted when notes are saved */
  save: [value: string | null]
}>()

// Track character count from textarea
const charCount = ref(props.notes?.length ?? 0)

// Default open if content exists
const hasContent = Boolean(props.notes)

function handleCharCountUpdate(count: number): void {
  charCount.value = count
}

function handleSave(value: string | null): void {
  emit('save', value)
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="hasContent"
    test-id="kanji-detail-personal-notes"
    title="Personal Notes"
  >
    <template #header-extra>
      <span
        class="notes-char-count"
        data-testid="kanji-detail-personal-notes-char-count"
      >
        {{ charCount }}
      </span>
    </template>

    <KanjiDetailNotesTextarea
      :model-value="notes"
      placeholder="Add personal observations, insights, and notes..."
      @save="handleSave"
      @update:char-count="handleCharCountUpdate"
    />
  </SharedSection>
</template>

<style scoped>
.notes-char-count {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-normal);
}
</style>
