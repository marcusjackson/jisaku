<script setup lang="ts">
/**
 * KanjiSectionDetail
 *
 * Section component for kanji detail layout.
 * Uses SharedSection for each content area with inline editing support.
 * Coordinates actions between UI components and parent Root component.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseSwitch from '@/base/components/BaseSwitch.vue'

import SharedBackButton from '@/shared/components/SharedBackButton.vue'
import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

import KanjiDetailBasicInfo from './KanjiDetailBasicInfo.vue'
import KanjiDetailComponents from './KanjiDetailComponents.vue'
import KanjiDetailHeader from './KanjiDetailHeader.vue'
import KanjiDetailNotesEducation from './KanjiDetailNotesEducation.vue'
import KanjiDetailNotesEtymology from './KanjiDetailNotesEtymology.vue'
import KanjiDetailNotesPersonal from './KanjiDetailNotesPersonal.vue'
import KanjiDetailNotesSemantic from './KanjiDetailNotesSemantic.vue'
import KanjiDetailStrokeOrder from './KanjiDetailStrokeOrder.vue'
import KanjiHeaderEditDialog from './KanjiHeaderEditDialog.vue'

import type {
  Kanji,
  OccurrenceWithComponent
} from '@/shared/types/database-types'
import type { Component } from '@/shared/types/database-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

interface Props {
  kanji: Kanji
  isDeleting?: boolean
  isDestructiveMode?: boolean
  occurrences?: OccurrenceWithComponent[]
  radical?: Component | null
  allComponents?: Component[]
  radicalOptions?: Component[]
}

const props = withDefaults(defineProps<Props>(), {
  radical: null,
  occurrences: () => [],
  isDeleting: false,
  isDestructiveMode: false,
  allComponents: () => [],
  radicalOptions: () => []
})

const emit = defineEmits<{
  delete: []
  addComponent: [componentId: number]
  createComponent: [data: QuickCreateComponentData]
  removeComponent: [occurrenceId: number]
  updateDestructiveMode: [enabled: boolean]
  updateHeader: [
    data: {
      character: string
      shortMeaning: string | null
      searchKeywords: string | null
    }
  ]
  updateBasicInfo: [field: string, value: string | number | null]
  updateNotesEtymology: [notes: string | null]
  updateNotesSemantic: [notes: string | null]
  updateNotesEducation: [notes: string | null]
  updateNotesPersonal: [notes: string | null]
  updateStrokeDiagram: [data: Uint8Array | null]
  updateStrokeGif: [data: Uint8Array | null]
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Computed writable for destructive mode (emits to parent)
const destructiveMode = computed({
  get: () => props.isDestructiveMode || false,
  set: (value: boolean) => {
    emit('updateDestructiveMode', value)
  }
})

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

// Remove component confirmation dialog state
const showRemoveComponentDialog = ref(false)
const componentToRemove = ref<number | null>(null)

// Header edit dialog state
const showHeaderEditDialog = ref(false)

function handleDeleteClick() {
  showDeleteDialog.value = true
}

function handleDeleteConfirm() {
  showDeleteDialog.value = false
  emit('delete')
}

function handleDeleteCancel() {
  showDeleteDialog.value = false
}

function handleAddComponent(componentId: number) {
  emit('addComponent', componentId)
}

function handleCreateComponent(data: QuickCreateComponentData) {
  emit('createComponent', data)
}

function handleRemoveComponentClick(occurrenceId: number) {
  componentToRemove.value = occurrenceId
  showRemoveComponentDialog.value = true
}

function handleRemoveComponentConfirm() {
  if (componentToRemove.value !== null) {
    emit('removeComponent', componentToRemove.value)
  }
  showRemoveComponentDialog.value = false
  componentToRemove.value = null
}

function handleRemoveComponentCancel() {
  showRemoveComponentDialog.value = false
  componentToRemove.value = null
}

function handleOpenHeaderEdit() {
  showHeaderEditDialog.value = true
}

function handleSaveHeader(data: {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}) {
  emit('updateHeader', data)
}

function handleBasicInfoUpdate(field: string, value: string | number | null) {
  emit('updateBasicInfo', field, value)
}
</script>

<template>
  <article class="kanji-section-detail">
    <!-- Top back button -->
    <SharedBackButton
      label="Back to Kanji List"
      to="/kanji"
    />

    <!-- Header with character, short_meaning, search_keywords -->
    <KanjiDetailHeader
      :kanji="props.kanji"
      :radical="props.radical"
      @edit="handleOpenHeaderEdit"
    />

    <!-- Main content sections -->
    <div class="kanji-section-detail-content">
      <!-- Basic Information (not collapsible) -->
      <SharedSection title="Basic Information">
        <KanjiDetailBasicInfo
          :kanji="props.kanji"
          :radical="props.radical"
          :radical-options="props.radicalOptions"
          @update="handleBasicInfoUpdate"
        />
      </SharedSection>

      <!-- Components (not collapsible) -->
      <SharedSection title="Components">
        <KanjiDetailComponents
          :all-components="props.allComponents"
          :is-destructive-mode="props.isDestructiveMode"
          :kanji-id="props.kanji.id"
          :occurrences="props.occurrences"
          @add-component="handleAddComponent"
          @create-component="handleCreateComponent"
          @remove-component="handleRemoveComponentClick"
        />
      </SharedSection>

      <!-- Stroke Order (collapsible) -->
      <SharedSection
        collapsible
        default-open
        title="Stroke Order"
      >
        <KanjiDetailStrokeOrder
          :stroke-diagram="props.kanji.strokeDiagramImage"
          :stroke-gif="props.kanji.strokeGifImage"
          @update-diagram="emit('updateStrokeDiagram', $event)"
          @update-gif="emit('updateStrokeGif', $event)"
        />
      </SharedSection>

      <!-- Etymology Notes (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesEtymology)"
        title="Etymology Notes"
      >
        <KanjiDetailNotesEtymology
          :notes="props.kanji.notesEtymology"
          @update="emit('updateNotesEtymology', $event)"
        />
      </SharedSection>

      <!-- Semantic Analysis (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesSemantic)"
        title="Semantic Analysis"
      >
        <KanjiDetailNotesSemantic
          :notes="props.kanji.notesSemantic"
          @update="emit('updateNotesSemantic', $event)"
        />
      </SharedSection>

      <!-- Education & Mnemonics (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesEducationMnemonics)"
        title="Education & Mnemonics"
      >
        <KanjiDetailNotesEducation
          :notes="props.kanji.notesEducationMnemonics"
          @update="emit('updateNotesEducation', $event)"
        />
      </SharedSection>

      <!-- Personal Notes (collapsible) -->
      <SharedSection
        collapsible
        :default-open="Boolean(props.kanji.notesPersonal)"
        title="Personal Notes"
      >
        <KanjiDetailNotesPersonal
          :notes="props.kanji.notesPersonal"
          @update="emit('updateNotesPersonal', $event)"
        />
      </SharedSection>
    </div>

    <!-- Bottom actions -->
    <div class="kanji-section-detail-actions">
      <!-- Destructive Mode Toggle -->
      <div class="destructive-mode-toggle">
        <label
          class="destructive-mode-label"
          for="destructive-mode-switch"
        >
          Destructive Mode
        </label>
        <BaseSwitch
          id="destructive-mode-switch"
          v-model="destructiveMode"
        />
      </div>

      <!-- Delete Button (only enabled in destructive mode) -->
      <BaseButton
        :disabled="deleteDisabled || !props.isDestructiveMode"
        variant="ghost"
        @click="handleDeleteClick"
      >
        {{ deleteDisabled ? 'Deleting...' : 'Delete' }}
      </BaseButton>
    </div>

    <!-- Delete confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Delete"
      description="Are you sure you want to delete this kanji? This action cannot be undone."
      :is-open="showDeleteDialog"
      title="Delete Kanji"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />

    <!-- Header edit dialog -->
    <KanjiHeaderEditDialog
      :character="props.kanji.character"
      :open="showHeaderEditDialog"
      :search-keywords="props.kanji.searchKeywords"
      :short-meaning="props.kanji.shortMeaning"
      @save="handleSaveHeader"
      @update:open="showHeaderEditDialog = $event"
    />

    <!-- Remove component confirmation dialog -->
    <SharedConfirmDialog
      confirm-label="Remove"
      description="Are you sure you want to remove this component from the kanji? Occurrence analysis notes will be lost."
      :is-open="showRemoveComponentDialog"
      title="Remove Component"
      variant="danger"
      @cancel="handleRemoveComponentCancel"
      @confirm="handleRemoveComponentConfirm"
    />

    <!-- Bottom back button -->
    <SharedBackButton
      label="Back to Kanji List"
      to="/kanji"
    />
  </article>
</template>

<style scoped>
.kanji-section-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.kanji-section-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-section-detail-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.destructive-mode-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.destructive-mode-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
