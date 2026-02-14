<script setup lang="ts">
/**
 * VocabDetailRoot
 *
 * Root component for vocabulary detail page. Orchestrates data fetching
 * and coordinates section components.
 */

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { BaseSpinner } from '@/base/components'

import { useVocabularyRepository } from '@/api/vocabulary'

import { useToast } from '@/shared/composables'

import { ROUTES } from '@/router/routes'

import VocabDetailSectionActions from './VocabDetailSectionActions.vue'
import VocabDetailSectionHeadline from './VocabDetailSectionHeadline.vue'

import type { HeadlineSaveData } from '../vocab-detail-types'
import type { Vocabulary } from '@/api/vocabulary'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const vocabRepo = useVocabularyRepository()

const vocab = ref<Vocabulary | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const isDestructiveMode = ref(false)
const isDeleting = ref(false)

const vocabId = computed(() => Number(route.params['id']))

function loadVocab(): void {
  isLoading.value = true
  loadError.value = null
  try {
    vocab.value = vocabRepo.getById(vocabId.value)
    if (!vocab.value) {
      loadError.value = `Vocabulary with ID ${String(vocabId.value)} not found`
      return
    }
  } catch (err) {
    loadError.value =
      err instanceof Error ? err.message : 'Failed to load vocabulary'
  } finally {
    isLoading.value = false
  }
}

watch(
  vocabId,
  () => {
    loadVocab()
  },
  { immediate: true }
)

function handleHeadlineSave(data: HeadlineSaveData): void {
  if (!vocab.value) return
  try {
    vocabRepo.update(vocab.value.id, data)
    vocab.value = { ...vocab.value, ...data }
    toast.success('Vocabulary updated successfully')
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to update vocabulary'
    )
  }
}

function handleDelete(): void {
  if (!vocab.value) return
  isDeleting.value = true
  try {
    vocabRepo.remove(vocab.value.id)
    toast.success('Vocabulary deleted successfully')
    void router.push(ROUTES.VOCABULARY_LIST)
  } catch (err) {
    toast.error(
      err instanceof Error ? err.message : 'Failed to delete vocabulary'
    )
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="vocab-detail-root">
    <div class="vocab-detail-root-container">
      <div
        v-if="isLoading"
        class="vocab-detail-root-loading"
      >
        <BaseSpinner size="lg" />
      </div>

      <div
        v-else-if="loadError"
        class="vocab-detail-root-error"
      >
        <p>{{ loadError }}</p>
      </div>

      <template v-else-if="vocab">
        <VocabDetailSectionHeadline
          :vocab="vocab"
          @save="handleHeadlineSave"
        />

        <VocabDetailSectionActions
          v-model:destructive-mode="isDestructiveMode"
          :is-deleting="isDeleting"
          @delete="handleDelete"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.vocab-detail-root {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg);
}

.vocab-detail-root-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  width: 100%;
  max-width: 768px;
}

.vocab-detail-root-loading,
.vocab-detail-root-error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.vocab-detail-root-error {
  color: var(--color-text-danger);
}
</style>
