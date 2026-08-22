<script setup lang="ts">
/**
 * ComponentDetailDialogManageMembers
 *
 * Dialog for managing grouping members — shows current members
 * and available occurrences in two panels.
 */

import { BaseButton, BaseDialog } from '@/base/components'

import { useComponentDetailManageMembers } from '../composables/use-component-detail-manage-members'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

const props = defineProps<{
  /** Whether dialog is open */
  open: boolean
  /** The grouping being managed */
  grouping: ComponentGroupingWithMembers
  /** Current members of the grouping */
  members: ComponentGroupingMember[]
  /** All occurrences for the component */
  occurrences: OccurrenceWithKanji[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'add-member': [occurrenceId: number]
  'remove-member': [occurrenceId: number]
  'reorder-members': [ids: number[]]
}>()

const { availableOccurrences, getReorderedIds, memberOccurrences } =
  useComponentDetailManageMembers({
    members: () => props.members,
    occurrences: () => props.occurrences,
    groupingName: () => props.grouping.name
  })

function handleReorder(index: number, direction: 'up' | 'down'): void {
  const ids = getReorderedIds(index, direction)
  if (ids) emit('reorder-members', ids)
}
</script>

<template>
  <BaseDialog
    :open="open"
    :title="`Manage Members — ${grouping.name}`"
    @update:open="emit('update:open', $event)"
  >
    <div class="manage-members">
      <p
        v-if="occurrences.length === 0"
        class="empty-state"
      >
        No kanji occurrences linked to this component.
      </p>

      <template v-else>
        <div class="panel">
          <h3 class="panel-title">
            Current members ({{ memberOccurrences.length }})
          </h3>
          <p
            v-if="memberOccurrences.length === 0"
            class="panel-empty"
          >
            No members yet.
          </p>
          <ul
            v-else
            class="member-list"
          >
            <li
              v-for="(entry, index) in memberOccurrences"
              :key="entry.member.id"
              class="member-item"
              data-testid="member-item"
            >
              <span class="member-kanji">{{
                entry.occurrence.kanji.character
              }}</span>
              <span class="member-meaning">{{
                entry.occurrence.kanji.shortMeaning
              }}</span>
              <div class="member-actions">
                <BaseButton
                  :data-testid="`move-up-${entry.member.occurrenceId}`"
                  :disabled="index === 0"
                  size="sm"
                  variant="ghost"
                  @click="handleReorder(index, 'up')"
                  >↑</BaseButton
                >
                <BaseButton
                  :data-testid="`move-down-${entry.member.occurrenceId}`"
                  :disabled="index === memberOccurrences.length - 1"
                  size="sm"
                  variant="ghost"
                  @click="handleReorder(index, 'down')"
                  >↓</BaseButton
                >
                <BaseButton
                  :data-testid="`remove-member-${entry.member.occurrenceId}`"
                  size="sm"
                  variant="danger"
                  @click="emit('remove-member', entry.member.occurrenceId)"
                  >Remove</BaseButton
                >
              </div>
            </li>
          </ul>
        </div>

        <div class="panel">
          <h3 class="panel-title">
            Add kanji ({{ availableOccurrences.length }})
          </h3>
          <p
            v-if="availableOccurrences.length === 0"
            class="panel-empty"
          >
            All occurrences are already members.
          </p>
          <ul
            v-else
            class="available-list"
          >
            <li
              v-for="occ in availableOccurrences"
              :key="occ.id"
              class="available-item"
              data-testid="available-item"
            >
              <span class="member-kanji">{{ occ.kanji.character }}</span>
              <span class="member-meaning">{{ occ.kanji.shortMeaning }}</span>
              <BaseButton
                :data-testid="`add-member-${occ.id}`"
                size="sm"
                variant="secondary"
                @click="emit('add-member', occ.id)"
                >Add</BaseButton
              >
            </li>
          </ul>
        </div>
      </template>
    </div>
  </BaseDialog>
</template>

<style scoped>
.manage-members {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.empty-state {
  padding: var(--spacing-lg);
  color: var(--color-text-muted);
  text-align: center;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.panel-title {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
}

.panel-empty {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.member-list,
.available-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  max-height: 240px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.member-item,
.available-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  background: var(--color-surface-secondary);
}

.member-kanji {
  min-width: 2em;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
}

.member-meaning {
  flex: 1;
  color: var(--color-text-secondary);
}

.member-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
</style>
