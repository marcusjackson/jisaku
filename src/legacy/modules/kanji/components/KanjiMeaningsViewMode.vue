<script setup lang="ts">
/**
 * KanjiMeaningsViewMode
 *
 * UI component: Display kanji meanings in view mode (flat list or grouped by reading).
 */

import { computed } from 'vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/legacy/shared/types/database-types'

const props = defineProps<{
  /** All meanings for this kanji */
  meanings: KanjiMeaning[]
  /** Reading groups for this kanji (empty if grouping disabled) */
  readingGroups: KanjiMeaningReadingGroup[]
  /** Group member assignments */
  groupMembers: KanjiMeaningGroupMember[]
}>()

// Check if grouping is enabled (has groups)
const isGroupingEnabled = computed(() => props.readingGroups.length > 0)

// Get meanings in a specific group
function getMeaningsInGroup(groupId: number): KanjiMeaning[] {
  const memberIds = props.groupMembers
    .filter((gm) => gm.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((gm) => gm.meaningId)

  return props.meanings.filter((m) => memberIds.includes(m.id))
}

// Get unassigned meanings (not in any group)
const unassignedMeanings = computed(() => {
  if (!isGroupingEnabled.value) return []

  const assignedIds = props.groupMembers.map((gm) => gm.meaningId)
  return props.meanings.filter((m) => !assignedIds.includes(m.id))
})
</script>

<template>
  <div class="kanji-meanings-view">
    <!-- Empty state -->
    <div
      v-if="meanings.length === 0"
      class="kanji-meanings-empty"
    >
      No meanings added yet.
    </div>

    <!-- Ungrouped display (flat list) -->
    <template v-else-if="!isGroupingEnabled">
      <ol class="kanji-meanings-list">
        <li
          v-for="meaning in meanings"
          :key="meaning.id"
          class="kanji-meanings-item"
        >
          <div class="kanji-meanings-text">
            {{ meaning.meaningText }}
          </div>
          <div
            v-if="meaning.additionalInfo"
            class="kanji-meanings-additional"
          >
            {{ meaning.additionalInfo }}
          </div>
        </li>
      </ol>
    </template>

    <!-- Grouped display (by reading) -->
    <template v-else>
      <div class="kanji-meanings-grouped">
        <div
          v-for="group in readingGroups"
          :key="group.id"
          class="kanji-meanings-group"
        >
          <div class="kanji-meanings-group-header">
            {{ group.readingText }}
          </div>
          <ol class="kanji-meanings-group-list">
            <li
              v-for="meaning in getMeaningsInGroup(group.id)"
              :key="meaning.id"
              class="kanji-meanings-item"
            >
              <div class="kanji-meanings-text">
                {{ meaning.meaningText }}
              </div>
              <div
                v-if="meaning.additionalInfo"
                class="kanji-meanings-additional"
              >
                {{ meaning.additionalInfo }}
              </div>
            </li>
          </ol>
        </div>

        <!-- Unassigned meanings section -->
        <div
          v-if="unassignedMeanings.length > 0"
          class="kanji-meanings-group"
        >
          <div
            class="kanji-meanings-group-header kanji-meanings-unassigned-header"
          >
            (Unassigned)
          </div>
          <ol class="kanji-meanings-group-list">
            <li
              v-for="meaning in unassignedMeanings"
              :key="meaning.id"
              class="kanji-meanings-item"
            >
              <div class="kanji-meanings-text">
                {{ meaning.meaningText }}
              </div>
              <div
                v-if="meaning.additionalInfo"
                class="kanji-meanings-additional"
              >
                {{ meaning.additionalInfo }}
              </div>
            </li>
          </ol>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.kanji-meanings-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-meanings-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.kanji-meanings-list {
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-lg);
  list-style: decimal;
}

.kanji-meanings-item {
  padding: var(--spacing-xs) 0;
}

.kanji-meanings-text {
  font-size: var(--font-size-base);
}

.kanji-meanings-additional {
  margin-top: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
}

.kanji-meanings-grouped {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.kanji-meanings-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-meanings-group-header {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-meanings-unassigned-header {
  color: var(--color-text-muted);
  font-style: italic;
}

.kanji-meanings-group-list {
  margin: 0;
  padding: 0;
  padding-left: var(--spacing-lg);
  list-style: decimal;
}
</style>
