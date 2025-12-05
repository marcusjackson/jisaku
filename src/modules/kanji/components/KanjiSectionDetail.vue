<script setup lang="ts">
/**
 * KanjiSectionDetail
 *
 * Section component for kanji detail layout.
 * Arranges UI components and coordinates actions between them.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import KanjiDetailBadges from './KanjiDetailBadges.vue'
import KanjiDetailComponents from './KanjiDetailComponents.vue'
import KanjiDetailHeader from './KanjiDetailHeader.vue'
import KanjiDetailNotes from './KanjiDetailNotes.vue'
import KanjiDetailStrokeImages from './KanjiDetailStrokeImages.vue'

import type { Component, Kanji, Radical } from '@/shared/types/database-types'

interface Props {
  kanji: Kanji
  radical?: Radical | null
  components?: Component[]
  isDeleting?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  radical: null,
  components: () => [],
  isDeleting: false
})

const emit = defineEmits<{
  delete: []
}>()

// Computed to handle exactOptionalPropertyTypes
const deleteDisabled = computed(() => props.isDeleting)

// Delete confirmation dialog state
const showDeleteDialog = ref(false)

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
  <article class="kanji-section-detail">
    <KanjiDetailHeader
      :kanji="props.kanji"
      :radical="props.radical"
    />

    <div class="kanji-section-detail-content">
      <KanjiDetailBadges :kanji="props.kanji" />
      <KanjiDetailComponents :components="props.components" />
      <KanjiDetailStrokeImages
        :stroke-diagram="props.kanji.strokeDiagramImage"
        :stroke-gif="props.kanji.strokeGifImage"
      />
      <KanjiDetailNotes
        :notes-cultural="props.kanji.notesCultural"
        :notes-etymology="props.kanji.notesEtymology"
        :notes-personal="props.kanji.notesPersonal"
      />
    </div>

    <div class="kanji-section-detail-actions">
      <RouterLink :to="`/kanji/${props.kanji.id}/edit`">
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
      description="Are you sure you want to delete this kanji? This action cannot be undone."
      :is-open="showDeleteDialog"
      title="Delete Kanji"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
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
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}
</style>
