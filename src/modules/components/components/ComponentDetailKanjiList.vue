<script setup lang="ts">
/**
 * ComponentDetailKanjiList
 *
 * UI component displaying kanji that use this component with occurrence metadata.
 * Shows position, radical flag, and allows inline editing of analysis notes.
 */

import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseCheckbox from '@/base/components/BaseCheckbox.vue'
import BaseInlineTextarea from '@/base/components/BaseInlineTextarea.vue'
import BaseSelect from '@/base/components/BaseSelect.vue'

import { usePositionTypeRepository } from '../composables/use-position-type-repository'

import type { SelectOption } from '@/base/components/BaseSelect.vue'
import type {
  OccurrenceWithKanji,
  PositionType
} from '@/shared/types/database-types'

const props = defineProps<{
  occurrences: OccurrenceWithKanji[]
}>()

const emit = defineEmits<{
  'update:analysisNotes': [occurrenceId: number, analysisNotes: string | null]
  'update:position': [occurrenceId: number, positionTypeId: number | null]
  'update:isRadical': [occurrenceId: number, isRadical: boolean]
}>()

// Position types for dropdown
const { getAll: getAllPositionTypes } = usePositionTypeRepository()
const positionTypes = ref<PositionType[]>([])

onMounted(() => {
  try {
    positionTypes.value = getAllPositionTypes()
  } catch {
    // Database not initialized (e.g., in tests)
    positionTypes.value = []
  }
})

const positionOptions = computed<SelectOption[]>(() => {
  return [
    { label: 'None', value: 'none' },
    ...positionTypes.value.map((pt) => ({
      label: pt.nameJapanese ?? pt.nameEnglish ?? pt.positionName,
      value: String(pt.id)
    }))
  ]
})

// Track which occurrence's notes are being edited
const editingOccurrenceId = ref<number | null>(null)

function handleNotesUpdate(occurrenceId: number, notes: string | null) {
  emit('update:analysisNotes', occurrenceId, notes)
  editingOccurrenceId.value = null
}

function handlePositionChange(
  occurrenceId: number,
  positionTypeId: string | null | undefined
) {
  const numericId =
    !positionTypeId || positionTypeId === 'none' ? null : Number(positionTypeId)
  emit('update:position', occurrenceId, numericId)
}

function handleRadicalChange(occurrenceId: number, isRadical: boolean) {
  emit('update:isRadical', occurrenceId, isRadical)
}
</script>

<template>
  <section class="component-detail-kanji-list">
    <h3 class="component-detail-kanji-list-title">
      Kanji Using This Component
    </h3>

    <div
      v-if="props.occurrences.length > 0"
      class="component-detail-kanji-list-items"
    >
      <div
        v-for="occurrence in props.occurrences"
        :key="occurrence.id"
        class="component-detail-kanji-list-item"
      >
        <div class="component-detail-kanji-list-item-header">
          <RouterLink
            class="component-detail-kanji-list-kanji-link"
            :to="`/kanji/${occurrence.kanji.id}`"
          >
            {{ occurrence.kanji.character }}
          </RouterLink>
        </div>

        <div class="component-detail-kanji-list-item-controls">
          <div class="component-detail-kanji-list-control-group">
            <BaseSelect
              label="Position"
              :model-value="
                occurrence.positionTypeId
                  ? String(occurrence.positionTypeId)
                  : 'none'
              "
              :name="`position-${occurrence.id}`"
              :options="positionOptions"
              @update:model-value="
                (value: string | null | undefined) =>
                  handlePositionChange(occurrence.id, value)
              "
            />
          </div>

          <div class="component-detail-kanji-list-control-group">
            <BaseCheckbox
              label="Is Radical"
              :model-value="occurrence.isRadical"
              :name="`radical-${occurrence.id}`"
              @update:model-value="
                (value: boolean | 'indeterminate') =>
                  handleRadicalChange(occurrence.id, value as boolean)
              "
            />
          </div>
        </div>

        <div class="component-detail-kanji-list-item-notes">
          <BaseInlineTextarea
            :model-value="occurrence.analysisNotes || ''"
            placeholder="Add analysis notes..."
            @update:model-value="
              (value: string) => handleNotesUpdate(occurrence.id, value || null)
            "
          />
        </div>
      </div>
    </div>

    <p
      v-else
      class="component-detail-kanji-list-empty"
    >
      No kanji are currently linked to this component.
    </p>
  </section>
</template>

<style scoped>
.component-detail-kanji-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-kanji-list-title {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-kanji-list-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-kanji-list-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.component-detail-kanji-list-item-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-md);
}

.component-detail-kanji-list-kanji-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-raised);
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.component-detail-kanji-list-kanji-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.component-detail-kanji-list-kanji-link:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.component-detail-kanji-list-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-detail-kanji-list-radical-badge {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: help;
}

.component-detail-kanji-list-item-notes {
  margin-top: var(--spacing-xs);
}

.component-detail-kanji-list-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}
</style>
