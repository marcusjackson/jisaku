<script setup lang="ts">
/**
 * SettingsSectionClassificationTypes
 *
 * Placeholder for classification types management.
 * Will be implemented in future task.
 */

import SharedSection from '@/shared/components/SharedSection.vue'
</script>

<template>
  <SharedSection
    collapsible
    :default-open="false"
    test-id="settings-classification-types"
    title="Classification Types"
  >
    <p class="description">
      Manage classification types for kanji (pictograph, ideograph, etc.).
    </p>

    <div class="coming-soon">
      <p class="coming-soon-text">Coming soon...</p>
    </div>
  </SharedSection>
</template>

<style scoped>
.description {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.coming-soon {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  text-align: center;
}

.coming-soon-text {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  font-style: italic;
}
</style>
