<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  void router.push('/')
}
</script>

<template>
  <main class="page">
    <h1>Page Not Found</h1>
    <p class="message">The page you're looking for doesn't exist.</p>
    <button
      class="home-button"
      type="button"
      @click="goHome"
    >
      Go to Home
    </button>
  </main>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: var(--spacing-lg);
  text-align: center;
}

.message {
  margin-top: var(--spacing-md);
  color: var(--color-text-secondary);
}

.home-button {
  margin-top: var(--spacing-lg);
  padding: var(--button-padding-md);
  border-radius: var(--radius-md);
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.home-button:hover {
  background-color: var(--button-primary-hover-bg);
}
</style>
