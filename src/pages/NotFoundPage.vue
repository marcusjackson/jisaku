<script setup lang="ts">
/**
 * NotFoundPage
 *
 * Catch-all 404 page for unmatched routes.
 */
import { useRouter } from 'vue-router'

import { BaseButton } from '@/base/components'

import { useTheme } from '@/shared/composables'

import { ROUTES } from '@/router/routes'

// Initialize theme on page load
useTheme()

const router = useRouter()

function goHome(): void {
  // void is intentional: discards the navigation promise without await
  void router.push(ROUTES.HOME) // NOSONAR
}
</script>

<template>
  <main class="not-found-page">
    <h1>Page Not Found</h1>
    <p class="not-found-page__message">
      The page you're looking for doesn't exist.
    </p>
    <BaseButton
      variant="primary"
      @click="goHome"
    >
      Go to Home
    </BaseButton>
  </main>
</template>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: var(--spacing-lg);
  text-align: center;
}

.not-found-page__message {
  margin-top: var(--spacing-md);
  color: var(--color-text-secondary);
}
</style>
