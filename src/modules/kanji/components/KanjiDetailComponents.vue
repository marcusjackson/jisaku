<script setup lang="ts">
/**
 * KanjiDetailComponents
 *
 * UI component displaying linked components for a kanji.
 * Shows basic info: character, short_meaning, position badge, radical indicator.
 * Includes "Add Component" button to link new components.
 * Users can navigate to component page for detailed occurrence editing.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedEntitySearch from '@/shared/components/SharedEntitySearch.vue'
import SharedPositionBadge from '@/shared/components/SharedPositionBadge.vue'
import SharedQuickCreateComponent from '@/shared/components/SharedQuickCreateComponent.vue'

import type {
  Component,
  OccurrenceWithComponent
} from '@/shared/types/database-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

// Local interface matching SharedEntitySearch.EntityOption
interface EntitySearchOption {
  id: number
  character: string
  shortMeaning: string | null
  strokeCount: number | null
}

const props = defineProps<{
  occurrences: OccurrenceWithComponent[]
  kanjiId: number
  /** Available components for search */
  allComponents: Component[]
  /** Whether destructive mode is enabled (shows delete buttons) */
  isDestructiveMode?: boolean
}>()

const emit = defineEmits<{
  addComponent: [componentId: number]
  createComponent: [data: QuickCreateComponentData]
  removeComponent: [occurrenceId: number]
}>()

// IDs of components already linked to this kanji
const excludedComponentIds = computed(() =>
  props.occurrences.map((o) => o.componentId)
)

// Convert components to EntityOption format for search
const componentOptions = computed<EntitySearchOption[]>(() =>
  props.allComponents.map((c) => ({
    id: c.id,
    character: c.character,
    shortMeaning: c.shortMeaning,
    strokeCount: c.strokeCount
  }))
)

// State for showing/hiding add component UI
const showAddComponent = ref(false)
const showQuickCreate = ref(false)
const quickCreateSearchTerm = ref('')

function handleToggleAddComponent() {
  showAddComponent.value = !showAddComponent.value
}

function handleSelectComponent(entity: EntitySearchOption) {
  emit('addComponent', entity.id)
  showAddComponent.value = false
}

function handleCreateNewComponent(searchTerm: string) {
  quickCreateSearchTerm.value = searchTerm
  showQuickCreate.value = true
}

function handleQuickCreate(data: QuickCreateComponentData) {
  emit('createComponent', data)
  showQuickCreate.value = false
  showAddComponent.value = false
}

function handleQuickCreateCancel() {
  showQuickCreate.value = false
}
</script>

<template>
  <div class="kanji-detail-components">
    <div class="kanji-detail-components-header">
      <BaseButton
        size="sm"
        variant="secondary"
        @click="handleToggleAddComponent"
      >
        {{ showAddComponent ? 'Cancel' : '+ Add' }}
      </BaseButton>
    </div>

    <!-- Add Component Search -->
    <div
      v-if="showAddComponent"
      class="kanji-detail-components-add"
    >
      <SharedEntitySearch
        entity-type="component"
        :exclude-ids="excludedComponentIds"
        label="Search and add component"
        :options="componentOptions"
        placeholder="Search by character or meaning..."
        @create-new="handleCreateNewComponent"
        @select="handleSelectComponent"
      />
    </div>

    <p
      v-if="occurrences.length > 0"
      class="kanji-detail-components-hint"
    >
      Click → to view component page for occurrence details
    </p>
    <ul
      v-if="occurrences.length > 0"
      class="kanji-detail-components-list"
    >
      <li
        v-for="occurrence in occurrences"
        :key="occurrence.id"
        class="kanji-detail-components-item"
      >
        <div class="kanji-detail-components-content">
          <div class="kanji-detail-components-info">
            <span class="kanji-detail-components-character">
              {{ occurrence.component.character }}
            </span>
            <div class="kanji-detail-components-details">
              <span
                v-if="occurrence.component.shortMeaning"
                class="kanji-detail-components-meaning"
              >
                {{ occurrence.component.shortMeaning }}
              </span>
              <div
                v-if="occurrence.position || occurrence.isRadical"
                class="kanji-detail-components-metadata"
              >
                <SharedPositionBadge
                  v-if="occurrence.position"
                  :position="occurrence.position"
                />
                <span
                  v-if="occurrence.isRadical"
                  class="kanji-detail-components-radical-badge"
                  title="This is the radical for this kanji"
                >
                  🔶 Radical
                </span>
              </div>
            </div>
          </div>
          <div class="kanji-detail-components-actions">
            <button
              v-if="props.isDestructiveMode"
              class="kanji-detail-components-delete-button"
              title="Remove component from kanji"
              @click="emit('removeComponent', occurrence.id)"
            >
              ✕
            </button>
            <RouterLink
              class="kanji-detail-components-view-link"
              title="View component page"
              :to="`/components/${occurrence.component.id}`"
            >
              →
            </RouterLink>
          </div>
        </div>
      </li>
    </ul>

    <p
      v-else-if="!showAddComponent"
      class="kanji-detail-components-empty"
    >
      No components linked. Click "+ Add" to add components.
    </p>

    <!-- Quick Create Component Dialog -->
    <SharedQuickCreateComponent
      v-model:open="showQuickCreate"
      v-bind="
        quickCreateSearchTerm.length === 1
          ? { initialCharacter: quickCreateSearchTerm }
          : {}
      "
      @cancel="handleQuickCreateCancel"
      @create="handleQuickCreate"
    />
  </div>
</template>

<style scoped>
.kanji-detail-components {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-components-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.kanji-detail-components-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.kanji-detail-components-item {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-detail-components-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.kanji-detail-components-info {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-detail-components-character {
  flex-shrink: 0;
  padding: var(--spacing-xs);
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-components-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.kanji-detail-components-meaning {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.kanji-detail-components-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-detail-components-radical-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: help;
}

.kanji-detail-components-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-xs);
}

.kanji-detail-components-delete-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-raised);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.kanji-detail-components-delete-button:hover {
  border-color: var(--color-danger);
  background-color: var(--color-danger-subtle);
  color: var(--color-danger);
}

.kanji-detail-components-delete-button:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.kanji-detail-components-view-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-raised);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.kanji-detail-components-view-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.kanji-detail-components-view-link:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.kanji-detail-components-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.kanji-detail-components-add {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-detail-components-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}
</style>
