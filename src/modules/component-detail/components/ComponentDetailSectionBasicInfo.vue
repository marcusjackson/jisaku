<script setup lang="ts">
/**
 * ComponentDetailSectionBasicInfo
 *
 * Section component for component basic information display.
 * Shows: stroke count, source kanji, can-be-radical status,
 * and radical attributes when applicable.
 */

import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/base/components'

import { SharedSection } from '@/shared/components'

import ComponentDetailDialogBasicInfo from './ComponentDetailDialogBasicInfo.vue'

import type { BasicInfoSaveData } from '../component-detail-types'
import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji'

const props = defineProps<{
  component: Component
  /** Resolved source kanji entity for display and linking */
  sourceKanji: Kanji | null
  /** All kanji for source kanji selection in dialog */
  kanjiOptions: Kanji[]
}>()

const emit = defineEmits<{
  save: [data: BasicInfoSaveData]
}>()

const isDialogOpen = ref(false)

// Display helpers
const strokeCountDisplay = computed(() => {
  return props.component.strokeCount ?? '—'
})

const sourceKanjiDisplay = computed(() => {
  if (!props.sourceKanji) return '—'
  const meaning = props.sourceKanji.shortMeaning
    ? ` (${props.sourceKanji.shortMeaning})`
    : ''
  return `${props.sourceKanji.character}${meaning}`
})

const canBeRadicalDisplay = computed(() => {
  return props.component.canBeRadical ? 'Yes' : 'No'
})

function handleSave(data: BasicInfoSaveData): void {
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <SharedSection
    test-id="component-detail-basic-info"
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

    <div class="component-basic-info-content">
      <div class="component-basic-info-grid">
        <div class="component-basic-info-item">
          <span class="component-basic-info-label">Strokes</span>
          <span
            class="component-basic-info-value"
            data-testid="basic-info-stroke-count"
          >
            {{ strokeCountDisplay }}
          </span>
        </div>
        <div class="component-basic-info-item">
          <span class="component-basic-info-label">Source Kanji</span>
          <span
            class="component-basic-info-value"
            data-testid="basic-info-source-kanji"
          >
            <RouterLink
              v-if="sourceKanji"
              :to="`/kanji/${sourceKanji.id}`"
            >
              {{ sourceKanjiDisplay }}
            </RouterLink>
            <template v-else>—</template>
          </span>
        </div>
        <div class="component-basic-info-item">
          <span class="component-basic-info-label">Can be Radical</span>
          <span
            class="component-basic-info-value"
            data-testid="basic-info-can-be-radical"
          >
            {{ canBeRadicalDisplay }}
          </span>
        </div>
      </div>

      <!-- Radical attributes (only when canBeRadical is true) -->
      <template v-if="component.canBeRadical">
        <div class="component-basic-info-divider" />
        <div class="component-basic-info-grid">
          <div class="component-basic-info-item">
            <span class="component-basic-info-label">Kangxi Number</span>
            <span
              class="component-basic-info-value"
              data-testid="basic-info-kangxi-number"
            >
              {{ component.kangxiNumber ?? '—' }}
            </span>
          </div>
          <div class="component-basic-info-item">
            <span class="component-basic-info-label">Kangxi Meaning</span>
            <span
              class="component-basic-info-value"
              data-testid="basic-info-kangxi-meaning"
            >
              {{ component.kangxiMeaning ?? '—' }}
            </span>
          </div>
          <div class="component-basic-info-item">
            <span class="component-basic-info-label">Radical Name (JP)</span>
            <span
              class="component-basic-info-value"
              data-testid="basic-info-radical-name"
            >
              {{ component.radicalNameJapanese ?? '—' }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <ComponentDetailDialogBasicInfo
      v-model:open="isDialogOpen"
      :component="component"
      :kanji-options="kanjiOptions"
      :source-kanji="sourceKanji"
      @save="handleSave"
    />
  </SharedSection>
</template>

<style scoped>
.component-basic-info-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-basic-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm) var(--spacing-md);
}

.component-basic-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-0-5);
}

.component-basic-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.component-basic-info-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.component-basic-info-divider {
  border-top: 1px solid var(--color-border);
}
</style>
