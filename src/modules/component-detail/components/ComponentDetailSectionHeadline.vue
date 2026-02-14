<script setup lang="ts">
/**
 * ComponentDetailSectionHeadline
 *
 * Section component for the component headline (top of detail page).
 * Shows: back button, component character, short meaning, search keywords.
 * Edit button opens dialog for editing character, short meaning, and keywords.
 */

import { ref } from 'vue'

import { BaseButton } from '@/base/components'

import {
  SharedBackButton,
  SharedSearchKeywordsIndicator
} from '@/shared/components'

import { ROUTES } from '@/router/routes'

import ComponentDetailDialogHeadline from './ComponentDetailDialogHeadline.vue'

import type { HeadlineSaveData } from '../component-detail-types'
import type { Component } from '@/api/component/component-types'

defineProps<{
  component: Component
}>()

const emit = defineEmits<{
  save: [data: HeadlineSaveData]
}>()

const isDialogOpen = ref(false)

function handleSave(data: HeadlineSaveData): void {
  emit('save', data)
  isDialogOpen.value = false
}
</script>

<template>
  <section
    class="component-detail-section-headline"
    data-testid="component-detail-headline"
  >
    <SharedBackButton
      label="Back to Component List"
      :to="ROUTES.COMPONENT_LIST"
    />

    <div class="component-detail-section-headline-content">
      <div class="component-detail-section-headline-main">
        <span
          class="component-detail-section-headline-character"
          data-testid="component-character"
        >
          {{ component.character }}
        </span>
        <div class="component-detail-section-headline-info">
          <div class="component-detail-section-headline-top">
            <span
              v-if="component.shortMeaning"
              class="component-detail-section-headline-display"
              data-testid="component-short-meaning"
            >
              {{ component.shortMeaning }}
            </span>
            <SharedSearchKeywordsIndicator
              :search-keywords="component.searchKeywords"
            />
          </div>
        </div>
      </div>
      <div class="component-detail-section-headline-actions">
        <BaseButton
          data-testid="headline-edit-button"
          size="sm"
          variant="secondary"
          @click="isDialogOpen = true"
        >
          Edit
        </BaseButton>
      </div>
    </div>

    <ComponentDetailDialogHeadline
      v-model:open="isDialogOpen"
      :character="component.character"
      :search-keywords="component.searchKeywords"
      :short-meaning="component.shortMeaning"
      @save="handleSave"
    />
  </section>
</template>

<style scoped>
.component-detail-section-headline {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-section-headline-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.component-detail-section-headline-main {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.component-detail-section-headline-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-tight);
}

.component-detail-section-headline-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-section-headline-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-detail-section-headline-display {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.component-detail-section-headline-actions {
  flex-shrink: 0;
}
</style>
