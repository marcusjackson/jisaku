<script setup lang="ts">
/**
 * ComponentDetailRoot
 *
 * Root component for component detail page. Orchestrates data fetching
 * and coordinates section components.
 */

import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { BaseSpinner } from '@/base/components'

import { useComponentDetailData } from '../composables/use-component-detail-data'
import { useComponentDetailFormHandlers } from '../composables/use-component-detail-form-handlers'
import { useComponentDetailGroupingHandlers } from '../composables/use-component-detail-grouping-handlers'
import { useComponentDetailOccurrenceHandlers } from '../composables/use-component-detail-occurrence-handlers'
import { useComponentDetailRootHandlers } from '../composables/use-component-detail-root-handlers'

import ComponentDetailSectionActions from './ComponentDetailSectionActions.vue'
import ComponentDetailSectionBasicInfo from './ComponentDetailSectionBasicInfo.vue'
import ComponentDetailSectionDescription from './ComponentDetailSectionDescription.vue'
import ComponentDetailSectionForms from './ComponentDetailSectionForms.vue'
import ComponentDetailSectionGroupings from './ComponentDetailSectionGroupings.vue'
import ComponentDetailSectionHeadline from './ComponentDetailSectionHeadline.vue'
import ComponentDetailSectionOccurrences from './ComponentDetailSectionOccurrences.vue'

import type { ComponentGroupingMember } from '@/api/component'

const router = useRouter()

const {
  allGroupingMembers,
  component,
  forms,
  groupings,
  isLoading,
  kanjiOptions,
  loadError,
  occurrences,
  positionTypes,
  sourceKanji
} = useComponentDetailData()

const managingGroupingId = ref<number | null>(null)
const managingGroupingMembers = ref<ComponentGroupingMember[]>([])
const isDestructiveMode = ref(false)
const isDeleting = ref(false)

const componentIdForHandlers = computed(() =>
  component.value ? component.value.id : null
)

// ============================================================================
// Extracted Handler Composables
// ============================================================================

const { handleFormAdd, handleFormRemove, handleFormReorder, handleFormUpdate } =
  useComponentDetailFormHandlers({
    componentId: componentIdForHandlers,
    forms
  })

const {
  handleOccurrenceAdd,
  handleOccurrenceCreate,
  handleOccurrenceRemove,
  handleOccurrenceReorder,
  handleOccurrenceUpdate
} = useComponentDetailOccurrenceHandlers({
  componentId: componentIdForHandlers,
  occurrences,
  kanjiOptions
})

const {
  handleGroupingAdd,
  handleGroupingRemove,
  handleGroupingReorder,
  handleGroupingUpdate,
  handleManageMembersOpen,
  handleMemberAdd,
  handleMemberRemove,
  handleMemberReorder
} = useComponentDetailGroupingHandlers({
  componentId: componentIdForHandlers,
  groupings,
  allGroupingMembers,
  managingGroupingId,
  managingGroupingMembers
})

const {
  handleBasicInfoSave,
  handleDelete,
  handleDescriptionSave,
  handleHeadlineSave
} = useComponentDetailRootHandlers({
  component,
  sourceKanji,
  isDeleting,
  router
})
</script>

<template>
  <div class="component-detail-root">
    <div class="component-detail-root-container">
      <div
        v-if="isLoading"
        class="component-detail-root-loading"
      >
        <BaseSpinner size="lg" />
      </div>

      <div
        v-else-if="loadError"
        class="component-detail-root-error"
      >
        <p>{{ loadError }}</p>
      </div>

      <template v-else-if="component">
        <ComponentDetailSectionHeadline
          :component="component"
          @save="handleHeadlineSave"
        />

        <ComponentDetailSectionBasicInfo
          :component="component"
          :kanji-options="kanjiOptions"
          :source-kanji="sourceKanji"
          @save="handleBasicInfoSave"
        />

        <ComponentDetailSectionDescription
          :description="component.description"
          @save="handleDescriptionSave"
        />

        <ComponentDetailSectionForms
          :component-id="component.id"
          :forms="forms"
          :is-destructive-mode="isDestructiveMode"
          @add="handleFormAdd"
          @remove="handleFormRemove"
          @reorder="handleFormReorder"
          @update="handleFormUpdate"
        />

        <ComponentDetailSectionOccurrences
          :all-kanji="kanjiOptions"
          :component-id="component.id"
          :forms="forms"
          :is-destructive-mode="isDestructiveMode"
          :occurrences="occurrences"
          :position-types="positionTypes"
          @add="handleOccurrenceAdd"
          @create="handleOccurrenceCreate"
          @remove="handleOccurrenceRemove"
          @reorder="handleOccurrenceReorder"
          @update="handleOccurrenceUpdate"
        />

        <ComponentDetailSectionGroupings
          :all-grouping-members="allGroupingMembers"
          :component-id="component.id"
          :groupings="groupings"
          :is-destructive-mode="isDestructiveMode"
          :managing-grouping-members="managingGroupingMembers"
          :occurrences="occurrences"
          @add="handleGroupingAdd"
          @add-member="handleMemberAdd"
          @manage-members="handleManageMembersOpen"
          @remove="handleGroupingRemove"
          @remove-member="handleMemberRemove"
          @reorder="handleGroupingReorder"
          @reorder-members="handleMemberReorder"
          @update="handleGroupingUpdate"
        />

        <ComponentDetailSectionActions
          v-model:destructive-mode="isDestructiveMode"
          :is-deleting="isDeleting"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.component-detail-root {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.component-detail-root-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: var(--content-max-width);
}

.component-detail-root-loading,
.component-detail-root-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: var(--content-min-height);
}
</style>
