<script setup lang="ts">
/**
 * SharedPageContainer
 *
 * Consistent page layout wrapper with max-width and padding.
 */
</script>

<template>
  <div class="shared-page-container">
    <slot />
  </div>
</template>

<style scoped>
.shared-page-container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

@media (width <= 640px) {
  .shared-page-container {
    padding: var(--spacing-md);
  }
}
</style>
