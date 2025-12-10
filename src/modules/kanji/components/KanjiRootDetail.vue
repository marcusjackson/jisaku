<script setup lang="ts">
/**
 * KanjiRootDetail
 *
 * Root component for the kanji detail feature.
 * Handles database initialization, data fetching by ID, and loading/error states.
 * Passes data down to KanjiSectionDetail.
 */

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseSpinner from '@/base/components/BaseSpinner.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'
import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

import { useComponentOccurrenceRepository } from '@/modules/components/composables/use-component-occurrence-repository'
import { useComponentRepository } from '@/modules/components/composables/use-component-repository'
import { useKanjiRepository } from '@/modules/kanji-list/composables/use-kanji-repository'
import { useRadicalRepository } from '../composables/use-radical-repository'

import KanjiSectionDetail from './KanjiSectionDetail.vue'

import type {
  Component,
  Kanji,
  OccurrenceWithComponent
} from '@/shared/types/database-types'

// Router
const route = useRoute()
const router = useRouter()

// Database initialization
const { initError, initialize, isInitialized, isInitializing } = useDatabase()

// Repository for data access
const { getById, remove } = useKanjiRepository()
const { getById: getRadicalById } = useRadicalRepository()
const { getByKanjiIdWithPosition } = useComponentOccurrenceRepository()
const { getById: getComponentById } = useComponentRepository()

// Toast notifications
const { success } = useToast()

// Local state
const kanji = ref<Kanji | null>(null)
const radical = ref<Component | null>(null)
const occurrences = ref<OccurrenceWithComponent[]>([])
const fetchError = ref<Error | null>(null)
const isDeleting = ref(false)

// Computed kanji ID from route params
const kanjiId = computed(() => {
  const id = route.params['id']
  return typeof id === 'string' ? parseInt(id, 10) : NaN
})

// Fetch kanji by ID
function loadKanji() {
  if (Number.isNaN(kanjiId.value)) {
    fetchError.value = new Error('Invalid kanji ID')
    return
  }

  try {
    kanji.value = getById(kanjiId.value)
    if (!kanji.value) {
      fetchError.value = new Error('Kanji not found')
      return
    }

    // Load radical if kanji has one
    if (kanji.value.radicalId) {
      radical.value = getRadicalById(kanji.value.radicalId)
    } else {
      radical.value = null
    }

    // Load component occurrences with position data
    const rawOccurrences = getByKanjiIdWithPosition(kanji.value.id)
    occurrences.value = rawOccurrences.map((occurrence) => {
      const component = getComponentById(occurrence.componentId)
      if (!component) {
        throw new Error(
          `Component with id ${String(occurrence.componentId)} not found`
        )
      }
      return {
        ...occurrence,
        component
      }
    })
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
  }
}

// Handle delete action
async function handleDelete() {
  const kanjiToDelete = kanji.value
  if (!kanjiToDelete) return

  isDeleting.value = true
  try {
    remove(kanjiToDelete.id)
    success(`Kanji "${kanjiToDelete.character}" deleted`)
    await router.push({ name: 'kanji-list' })
  } catch (err) {
    fetchError.value = err instanceof Error ? err : new Error(String(err))
    isDeleting.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  try {
    await initialize()
    loadKanji()
  } catch {
    // Error is already captured in initError
  }
})

// Reload when ID changes (for navigation between kanji)
watch(kanjiId, () => {
  if (isInitialized.value) {
    fetchError.value = null
    loadKanji()
  }
})
</script>

<template>
  <!-- Loading state -->
  <SharedPageContainer
    v-if="isInitializing"
    class="kanji-root-detail-loading"
  >
    <BaseSpinner
      label="Loading kanji..."
      size="lg"
    />
    <p class="kanji-root-detail-loading-text">Loading kanji...</p>
  </SharedPageContainer>

  <!-- Error state -->
  <SharedPageContainer
    v-else-if="initError || fetchError"
    class="kanji-root-detail-error"
  >
    <p class="kanji-root-detail-error-title">Failed to load</p>
    <p class="kanji-root-detail-error-message">
      {{ initError?.message || fetchError?.message }}
    </p>
  </SharedPageContainer>

  <!-- Content -->
  <KanjiSectionDetail
    v-else-if="isInitialized && kanji"
    :is-deleting="isDeleting"
    :kanji="kanji"
    :occurrences="occurrences"
    :radical="radical"
    @delete="handleDelete"
  />
</template>

<style scoped>
.kanji-root-detail-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  min-height: 50vh;
}

.kanji-root-detail-loading-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-root-detail-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  min-height: 50vh;
  text-align: center;
}

.kanji-root-detail-error-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-root-detail-error-message {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}
</style>
