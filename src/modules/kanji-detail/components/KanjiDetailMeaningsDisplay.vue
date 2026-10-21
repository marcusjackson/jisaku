<script setup lang="ts">
/**
 * KanjiDetailMeaningsDisplay
 *
 * Display component for kanji meanings with optional reading groupings.
 * When grouping is enabled, shows meanings organized by associated readings.
 * When disabled, shows a simple list of meanings.
 */

import { computed } from 'vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'

const props = defineProps<{
  meanings: KanjiMeaning[]
  readingGroups: KanjiMeaningReadingGroup[]
  groupMembers: KanjiMeaningGroupMember[]
}>()

// Helper functions
/** A group's meanings in member order, which the edit dialog's ↑ and ↓ set */
function getMeaningsForGroup(
  groupId: number,
  members: KanjiMeaningGroupMember[],
  meanings: KanjiMeaning[]
): KanjiMeaning[] {
  const byId = new Map(meanings.map((m) => [m.id, m]))
  return members
    .filter((m) => m.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .flatMap((m) => byId.get(m.meaningId) ?? [])
}

function getUngroupedMeanings(
  meanings: KanjiMeaning[],
  members: KanjiMeaningGroupMember[]
): KanjiMeaning[] {
  const groupedIds = new Set(members.map((m) => m.meaningId))
  return meanings.filter((m) => !groupedIds.has(m.id))
}

function formatMeaning(meaning: KanjiMeaning): string {
  if (meaning.additionalInfo) {
    return `${meaning.meaningText} (${meaning.additionalInfo})`
  }
  return meaning.meaningText
}

// Each group's meanings with the 1-based number its list starts at, built once
const groupSections = computed(() => {
  let start = 1
  return props.readingGroups.map((group) => {
    const meanings = getMeaningsForGroup(
      group.id,
      props.groupMembers,
      props.meanings
    )
    const section = { group, meanings, start }
    start += meanings.length
    return section
  })
})

const ungrouped = computed(() => ({
  meanings: getUngroupedMeanings(props.meanings, props.groupMembers),
  // Numbered after all grouped meanings
  start: groupSections.value.reduce((n, s) => n + s.meanings.length, 1)
}))
</script>

<template>
  <div v-if="meanings.length === 0" class="meanings-empty">No meanings defined</div>

  <div v-else-if="readingGroups.length > 0" class="meanings-grouped">
    <!-- Grouped meanings -->
    <div v-for="section in groupSections" :key="section.group.id" class="meaning-group">
      <div class="group-reading" lang="ja">
        {{ section.group.readingText }}
      </div>
      <ol class="group-meanings-list" :start="section.start">
        <li v-for="meaning in section.meanings" :key="meaning.id" class="group-meaning-item">
          {{ formatMeaning(meaning) }}
        </li>
      </ol>
    </div>

    <!-- Ungrouped meanings -->
    <div v-if="ungrouped.meanings.length > 0" class="meaning-group meaning-group--ungrouped">
      <div class="group-reading group-reading--ungrouped">(Ungrouped)</div>
      <ol class="group-meanings-list" :start="ungrouped.start">
        <li v-for="meaning in ungrouped.meanings" :key="meaning.id" class="group-meaning-item">
          {{ formatMeaning(meaning) }}
        </li>
      </ol>
    </div>
  </div>

  <ol v-else class="meanings-simple-list">
    <li v-for="meaning in meanings" :key="meaning.id" class="meaning-simple-item">
      {{ formatMeaning(meaning) }}
    </li>
  </ol>
</template>

<style scoped>
.meanings-empty {
  color: var(--color-text-muted);
  font-style: italic;
}

.meanings-grouped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.meaning-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.meaning-group--ungrouped {
  margin-top: var(--spacing-xs);
  padding-top: var(--spacing-md);
  border-top: 1px dashed var(--color-border);
}

.group-reading {
  color: var(--color-text-secondary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.group-reading--ungrouped {
  color: var(--color-text-muted);
  font-style: italic;
}

.group-meanings-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  list-style: decimal;
}

.group-meaning-item {
  padding: var(--spacing-xs) 0;
  color: var(--color-text-primary);
}

.meanings-simple-list {
  margin: 0;
  padding-left: var(--spacing-lg);
  color: var(--color-text-primary);
  list-style: decimal;
}

.meaning-simple-item {
  padding: var(--spacing-xs) 0;
}
</style>
