/**
 * use-kanji-detail-handlers
 *
 * Handler functions for kanji detail page actions.
 * Extracted from KanjiDetailRoot to reduce component size.
 */

import { useRouter } from 'vue-router'

import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import { ROUTES } from '@/router/routes'

import type { HeadlineSaveData } from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji'
import type { Ref } from 'vue'

export interface KanjiDetailHandlers {
  handleHeadlineSave: (data: HeadlineSaveData) => void
  handleDelete: () => void
}

export function useKanjiDetailHandlers(
  kanji: Ref<Kanji | null>,
  isDeleting: Ref<boolean>
): KanjiDetailHandlers {
  const router = useRouter()
  const toast = useToast()
  const kanjiRepo = useKanjiRepository()

  function handleHeadlineSave(data: HeadlineSaveData): void {
    if (!kanji.value) return

    try {
      kanjiRepo.update(kanji.value.id, data)
      kanji.value = { ...kanji.value, ...data }
      toast.success('Kanji updated successfully')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update kanji')
    }
  }

  function handleDelete(): void {
    if (!kanji.value) return

    isDeleting.value = true
    try {
      kanjiRepo.remove(kanji.value.id)
      toast.success('Kanji deleted successfully')
      void router.push(ROUTES.KANJI_LIST)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete kanji')
    } finally {
      isDeleting.value = false
    }
  }

  return {
    handleHeadlineSave,
    handleDelete
  }
}
