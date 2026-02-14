<script setup lang="ts">
/**
 * ComponentDetailHeader
 *
 * UI component displaying the main component character with stroke count.
 * Includes Edit button to open header edit dialog.
 */

import BaseButton from '@/legacy/base/components/BaseButton.vue'

import SharedSearchKeywordsIndicator from '@/legacy/shared/components/SharedSearchKeywordsIndicator.vue'

import type { Component } from '@/legacy/shared/types/database-types'

defineProps<{
  component: Component
}>()

const emit = defineEmits<{
  edit: []
}>()

function handleEdit() {
  emit('edit')
}
</script>

<template>
  <header class="component-detail-header">
    <div class="component-detail-header-main">
      <span class="component-detail-header-character">
        {{ component.character }}
      </span>
      <div class="component-detail-header-info">
        <div class="component-detail-header-top">
          <span
            v-if="component.shortMeaning"
            class="component-detail-header-meaning"
          >
            {{ component.shortMeaning }}
          </span>
          <SharedSearchKeywordsIndicator
            :search-keywords="component.searchKeywords"
          />
        </div>
      </div>
    </div>
    <div class="component-detail-header-actions">
      <BaseButton
        size="sm"
        variant="secondary"
        @click="handleEdit"
      >
        Edit
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.component-detail-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-header-back {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.component-detail-header-back:hover {
  color: var(--color-primary);
}

.component-detail-header-main {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.component-detail-header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.component-detail-header-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-tight);
}

.component-detail-header-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.component-detail-header-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.component-detail-header-meaning {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}
</style>
