<!--
KanjiDetailReadingGroupsList

List component for managing reading groups in the meanings dialog.
Extracted from KanjiDetailDialogMeanings to keep file size under limit.
-->

<script setup lang="ts">
import { BaseButton, BaseInput, BaseSelect } from '@/base/components'

import type { EditMeaning, EditReadingGroup } from '../kanji-detail-types'

defineProps<{
  groups: EditReadingGroup[]
  destructiveMode?: boolean
  unassignedMeanings: EditMeaning[]
}>()

const emit = defineEmits<{
  add: []
  'update:readingText': [index: number, value: string]
  move: [index: number, direction: -1 | 1]
  delete: [index: number]
  'assign-meaning': [groupId: number, meaningId: number]
  'remove-from-group': [groupId: number, meaningId: number]
  'move-in-group': [groupId: number, index: number, direction: -1 | 1]
  'get-meanings-in-group': [groupId: number]
}>()

function getMeaningLabel(meaning: EditMeaning): string {
  return meaning.meaningText.length > 50
    ? meaning.meaningText.substring(0, 50) + '...'
    : meaning.meaningText
}
</script>

<template>
  <div class="reading-groups-section">
    <div class="reading-groups-header">
      <h4 class="reading-groups-title">Reading Groups</h4>
      <BaseButton
        size="sm"
        variant="ghost"
        @click="emit('add')"
      >
        + Add Group
      </BaseButton>
    </div>

    <div
      v-if="groups.length === 0"
      class="reading-groups-empty"
    >
      No reading groups. Click "+ Add Group" to create one.
    </div>

    <div
      v-else
      class="reading-groups-list"
    >
      <div
        v-for="(group, groupIndex) in groups"
        :key="group.id"
        class="reading-group"
      >
        <div class="reading-group-header">
          <BaseInput
            class="reading-group-input"
            :model-value="group.readingText"
            placeholder="Reading (e.g., メイ, あか.り)"
            @update:model-value="
              emit('update:readingText', groupIndex, String($event ?? ''))
            "
          />

          <div class="reading-group-actions">
            <BaseButton
              aria-label="Move group up"
              :disabled="groupIndex === 0"
              size="sm"
              variant="ghost"
              @click="emit('move', groupIndex, -1)"
            >
              ↑
            </BaseButton>
            <BaseButton
              aria-label="Move group down"
              :disabled="groupIndex === groups.length - 1"
              size="sm"
              variant="ghost"
              @click="emit('move', groupIndex, 1)"
            >
              ↓
            </BaseButton>
            <BaseButton
              v-if="destructiveMode"
              aria-label="Delete group"
              size="sm"
              variant="ghost"
              @click="emit('delete', groupIndex)"
            >
              ×
            </BaseButton>
          </div>
        </div>

        <div class="reading-group-content">
          <slot
            :group-id="group.id"
            name="group-meanings"
          />

          <!-- Assign meaning dropdown -->
          <div
            v-if="unassignedMeanings.length > 0"
            class="assign-meaning"
          >
            <BaseSelect
              label="Assign meaning to group"
              model-value=""
              :options="
                unassignedMeanings.map((m) => ({
                  label: getMeaningLabel(m),
                  value: String(m.id)
                }))
              "
              placeholder="Select a meaning…"
              @update:model-value="
                $event && emit('assign-meaning', group.id, Number($event))
              "
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-groups-section,
.reading-groups-list,
.reading-group,
.reading-group-content {
  display: flex;
  flex-direction: column;
}

.reading-groups-section,
.reading-groups-list {
  gap: var(--spacing-md);
}

.reading-group,
.reading-group-content {
  gap: var(--spacing-sm);
}

.reading-groups-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reading-groups-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.reading-groups-empty {
  padding: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.reading-group {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
}

.reading-group-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-sm);
}

.reading-group-input {
  flex: 1;
  min-width: 0;
  max-width: 12rem;
}

.reading-group-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-xs);
}

.reading-group-content {
  padding-left: var(--spacing-sm);
}

.assign-meaning {
  margin-top: var(--spacing-sm);
}

@media (width <= 480px) {
  .reading-group-header {
    flex-direction: column;
    align-items: stretch;
  }

  .reading-group-input {
    max-width: 100%;
  }

  .reading-group-actions {
    justify-content: flex-end;
  }
}
</style>
