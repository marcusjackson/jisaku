<script setup lang="ts">
/**
 * ComponentSectionDetail
 *
 * Section component for component detail layout.
 * Arranges UI components and coordinates actions between them.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import ComponentDetailHeader from './ComponentDetailHeader.vue'
import ComponentDetailInfo from './ComponentDetailInfo.vue'
import ComponentDetailKanjiList from './ComponentDetailKanjiList.vue'

import type { Component, Kanji } from '@/shared/types/database-types'

interface Props {
  component: Component
  sourceKanji?: Kanji | null
  linkedKanji?: Kanji[]
  linkedKanjiCount?: number
  isDeleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
  linkedKanji: () => [],
  linkedKanjiCount: 0,
  sourceKanji: null
})

const emit = defineEmits<{
  delete: []
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

// Warning message if component is linked to kanji
const deleteWarning = computed(() => {
  if (props.linkedKanjiCount > 0) {
    return `This component is linked to ${String(props.linkedKanjiCount)} kanji. Deleting it will remove those links.`
  }
  return undefined
})

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
</script>

<template>
  <article class="component-section-detail">
    <ComponentDetailHeader :component="props.component" />

    <div class="component-section-detail-content">
      <ComponentDetailInfo
        :component="props.component"
        :source-kanji="props.sourceKanji"
      />

      <ComponentDetailKanjiList :kanji-list="props.linkedKanji" />
    </div>

    <div class="component-section-detail-actions">
      <RouterLink :to="`/components/${props.component.id}/edit`">
        <BaseButton variant="secondary">Edit</BaseButton>
      </RouterLink>
      <BaseButton
        :disabled="deleteDisabled"
        variant="danger"
        @click="handleDeleteClick"
      >
        {{ deleteDisabled ? 'Deleting...' : 'Delete' }}
      </BaseButton>
    </div>

    <SharedConfirmDialog
      confirm-label="Delete"
      :description="
        deleteWarning
          ? `${deleteWarning} Are you sure you want to delete this component? This action cannot be undone.`
          : 'Are you sure you want to delete this component? This action cannot be undone.'
      "
      :is-open="showDeleteDialog"
      title="Delete Component"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </article>
</template>

<style scoped>
.component-section-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.component-section-detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.component-section-detail-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
