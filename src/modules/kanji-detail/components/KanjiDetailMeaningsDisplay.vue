<script setup lang="ts">
/**
 * KanjiDetailMeaningsDisplay
 *
 * Display component for kanji meanings with optional reading groupings.
 * When grouping is enabled, shows meanings organized by associated readings.
 * When disabled, shows a simple list of meanings.
 */

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
function getMeaningsForGroup(
  groupId: number,
  members: KanjiMeaningGroupMember[],
  meanings: KanjiMeaning[]
): KanjiMeaning[] {
  const memberMeaningIds = members
    .filter((m) => m.readingGroupId === groupId)
    .map((m) => m.meaningId)
  return meanings
    .filter((m) => memberMeaningIds.includes(m.id))
    .sort((a, b) => a.displayOrder - b.displayOrder)
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

function getMeaningStartNumber(groupId: number): number {
  // Calculate the 1-based start number for this group
  let count = 1
  for (const group of props.readingGroups) {
    if (group.id === groupId) break
    count += getMeaningsForGroup(
      group.id,
      props.groupMembers,
      props.meanings
    ).length
  }
  return count
}

function getUngroupedStartNumber(): number {
  // Start number after all grouped meanings
  let count = 1
  for (const group of props.readingGroups) {
    count += getMeaningsForGroup(
      group.id,
      props.groupMembers,
      props.meanings
    ).length
  }
  return count
}
</script>

<template>
  <div
    v-if="meanings.length === 0"
    class="meanings-empty"
  >
    No meanings defined
  </div>

  <div
    v-else-if="readingGroups.length > 0"
    class="meanings-grouped"
  >
    <!-- Grouped meanings -->
    <div
      v-for="group in readingGroups"
      :key="group.id"
      class="meaning-group"
    >
      <div class="group-reading">{{ group.readingText }}</div>
      <ol
        class="group-meanings-list"
        :start="getMeaningStartNumber(group.id)"
      >
        <li
          v-for="meaning in getMeaningsForGroup(
            group.id,
            groupMembers,
            meanings
          )"
          :key="meaning.id"
          class="group-meaning-item"
        >
          {{ formatMeaning(meaning) }}
        </li>
      </ol>
    </div>

    <!-- Ungrouped meanings -->
    <div
      v-if="getUngroupedMeanings(meanings, groupMembers).length > 0"
      class="meaning-group meaning-group--ungrouped"
    >
      <div class="group-reading group-reading--ungrouped">(Ungrouped)</div>
      <ol
        class="group-meanings-list"
        :start="getUngroupedStartNumber()"
      >
        <li
          v-for="meaning in getUngroupedMeanings(meanings, groupMembers)"
          :key="meaning.id"
          class="group-meaning-item"
        >
          {{ formatMeaning(meaning) }}
        </li>
      </ol>
    </div>
  </div>

  <ol
    v-else
    class="meanings-simple-list"
  >
    <li
      v-for="meaning in meanings"
      :key="meaning.id"
      class="meaning-simple-item"
    >
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
