<script setup lang="ts">
/**
 * ComponentDetailInfo
 *
 * UI component displaying component metadata and descriptions.
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import type { Component, Kanji } from '@/shared/types/database-types'

const props = defineProps<{
  component: Component
  sourceKanji?: Kanji | null
}>()

const hasDescription = computed(
  () =>
    Boolean(props.component.description) ||
    Boolean(props.component.descriptionShort)
)
</script>

<template>
  <div class="component-detail-info">
    <dl class="component-detail-info-list">
      <div
        v-if="component.japaneseName"
        class="component-detail-info-item"
      >
        <dt class="component-detail-info-label">Japanese Name</dt>
        <dd class="component-detail-info-value">
          {{ component.japaneseName }}
        </dd>
      </div>

      <div
        v-if="component.descriptionShort"
        class="component-detail-info-item"
      >
        <dt class="component-detail-info-label">Short Description</dt>
        <dd class="component-detail-info-value">
          {{ component.descriptionShort }}
        </dd>
      </div>

      <div
        v-if="sourceKanji"
        class="component-detail-info-item"
      >
        <dt class="component-detail-info-label">Source Kanji</dt>
        <dd class="component-detail-info-value">
          <RouterLink
            class="component-detail-info-link"
            :to="`/kanji/${sourceKanji.id}`"
          >
            {{ sourceKanji.character }}
          </RouterLink>
        </dd>
      </div>
    </dl>

    <div
      v-if="component.description"
      class="component-detail-info-description"
    >
      <h3 class="component-detail-info-description-title">Description</h3>
      <p class="component-detail-info-description-text">
        {{ component.description }}
      </p>
    </div>

    <p
      v-if="!hasDescription && !component.japaneseName && !sourceKanji"
      class="component-detail-info-empty"
    >
      No additional information available for this component.
    </p>
  </div>
</template>

<style scoped>
.component-detail-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.component-detail-info-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: 0;
}

.component-detail-info-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.component-detail-info-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-info-value {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.component-detail-info-link {
  color: var(--color-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-xl);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.component-detail-info-link:hover {
  color: var(--color-primary-hover);
  text-decoration: underline;
}

.component-detail-info-description {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.component-detail-info-description-title {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-info-description-text {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
}

.component-detail-info-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}
</style>
