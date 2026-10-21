<script setup lang="ts">
/**
 * KanjiDetailSectionNotes
 *
 * Collapsible notes section with inline textarea editing. The four kanji notes
 * sections (etymology, semantic, education, personal) differ only in the title,
 * test id and placeholder they pass here.
 */

import { computed, ref } from 'vue'

import { SharedSection } from '@/shared/components'

import KanjiDetailNotesTextarea from './KanjiDetailNotesTextarea.vue'

const props = defineProps<{
  /** Current notes content */
  notes: string | null
  /** Section title */
  title: string
  /** Test id of the section; the character count appends `-char-count` */
  testId: string
  /** Placeholder shown while the notes are empty */
  placeholder: string
}>()

const emit = defineEmits<{
  /** Emitted when notes are saved */
  save: [value: string | null]
}>()

// Track character count from textarea
const charCount = ref(props.notes?.length ?? 0)

// Open while content exists, closed once it is cleared
const hasContent = computed(() => Boolean(props.notes))

function handleCharCountUpdate(count: number): void {
  charCount.value = count
}

function handleSave(value: string | null): void {
  emit('save', value)
}
</script>

<template>
  <SharedSection collapsible :default-open="hasContent" :test-id="testId" :title="title">
    <template #header-extra>
      <span class="notes-char-count" :data-testid="`${testId}-char-count`">
        {{ charCount }}
      </span>
    </template>

    <KanjiDetailNotesTextarea
      :model-value="notes"
      :placeholder="placeholder"
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
