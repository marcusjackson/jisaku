<script setup lang="ts">
import { RouterView } from 'vue-router'

import BaseToast from '@/base/components/BaseToast.vue'

import SharedHeader from '@/shared/components/SharedHeader.vue'
import SharedUpdatePrompt from '@/shared/components/SharedUpdatePrompt.vue'
import { useTheme } from '@/shared/composables/use-theme'

// Initialize theme on app startup (applies saved or system preference)
useTheme()
</script>

<template>
  <div class="app">
    <SharedHeader />
    <main class="app-main">
      <RouterView />
    </main>
    <BaseToast />
    <SharedUpdatePrompt />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>
