<script setup lang="ts">
/**
 * VocabDetailSectionBasicInfo
 *
 * Section component for vocabulary basic information display.
 * Shows: JLPT level, common-word status, and description.
 * Edit button opens dialog for editing these fields.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import VocabDetailDialogBasicInfo from './VocabDetailDialogBasicInfo.vue'

import type { BasicInfoSaveData } from '../vocab-detail-types'
import type { Vocabulary } from '@/api/vocabulary'
import type { VocabJlptLevel } from '@/api/vocabulary/vocabulary-types'

defineProps<{
  vocab: Vocabulary
}>()

const emit = defineEmits<{
  save: [data: BasicInfoSaveData]
}>()

const isDialogOpen = ref(false)

const jlptDisplayMap: Record<VocabJlptLevel, string> = {
  N5: 'N5',
  N4: 'N4',
  N3: 'N3',
  N2: 'N2',
  N1: 'N1',
  'non-jlpt': 'Non-JLPT'
}

function handleSave(data: BasicInfoSaveData): void {
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <SharedSection
    test-id="vocab-detail-basic-info"
    title="Basic Information"
  >
    <template #actions>
      <BaseButton
        data-testid="basic-info-edit-button"
        size="sm"
        variant="secondary"
        @click="isDialogOpen = true"
      >
        Edit
      </BaseButton>
    </template>

    <div class="vocab-basic-info-content">
      <div class="vocab-basic-info-grid">
        <div class="vocab-basic-info-item">
          <span class="vocab-basic-info-label">JLPT Level</span>
          <span
            class="vocab-basic-info-value"
            data-testid="basic-info-jlpt"
          >
            {{ vocab.jlptLevel ? jlptDisplayMap[vocab.jlptLevel] : '—' }}
          </span>
        </div>
        <div class="vocab-basic-info-item">
          <span class="vocab-basic-info-label">Common Word</span>
          <span
            class="vocab-basic-info-value"
            data-testid="basic-info-common"
          >
            {{ vocab.isCommon ? 'Yes' : 'No' }}
          </span>
        </div>
      </div>

      <div class="vocab-basic-info-item vocab-basic-info-description-item">
        <span class="vocab-basic-info-label">Description</span>
        <span
          class="vocab-basic-info-value vocab-basic-info-description"
          data-testid="basic-info-description"
        >
          {{ vocab.description ?? '—' }}
        </span>
      </div>
    </div>

    <VocabDetailDialogBasicInfo
      v-model:open="isDialogOpen"
      :vocab="vocab"
      @save="handleSave"
    />
  </SharedSection>
</template>

<style scoped>
.vocab-basic-info-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.vocab-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-item-min-sm), 1fr));
  gap: var(--spacing-sm) var(--spacing-md);
}

.vocab-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
}

.vocab-basic-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.vocab-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.vocab-basic-info-description {
  white-space: pre-wrap;
}
</style>
