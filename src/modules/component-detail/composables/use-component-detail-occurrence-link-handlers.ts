/**
 * Use Component Detail Occurrence Link Handlers
 *
 * Handles the "link" operations for occurrences:
 * - add existing kanji → occurrence (handleOccurrenceAdd)
 * - create new kanji then link (handleOccurrenceCreate)
 *
 * Extracted from use-component-detail-occurrence-handlers.ts
 * to stay within file size limits.
 */

import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import type { useComponentOccurrenceRepository } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { QuickCreateKanjiData } from '@/shared/validation'
import type { Ref } from 'vue'

interface UseOccurrenceLinkHandlersDeps {
  componentId: Ref<number | null>
  kanjiOptions: Ref<Kanji[]>
  reloadOccurrences: () => void
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
}

interface UseOccurrenceLinkHandlersReturn {
  handleOccurrenceAdd: (kanjiId: number) => void
  handleOccurrenceCreate: (data: QuickCreateKanjiData) => void
}

function createAddHandler(params: {
  componentId: Ref<number | null>
  reloadOccurrences: () => void
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  toast: ReturnType<typeof useToast>
}): (kanjiId: number) => void {
  const { componentId, occurrenceRepo, reloadOccurrences, toast } = params
  return (kanjiId: number): void => {
    if (componentId.value === null) return
    try {
      occurrenceRepo.create({ kanjiId, componentId: componentId.value })
      reloadOccurrences()
      toast.success('Kanji linked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link kanji')
    }
  }
}

function createCreateAndLinkHandler(params: {
  componentId: Ref<number | null>
  kanjiOptions: Ref<Kanji[]>
  reloadOccurrences: () => void
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  kanjiRepo: ReturnType<typeof useKanjiRepository>
  toast: ReturnType<typeof useToast>
}): (data: QuickCreateKanjiData) => void {
  const {
    componentId,
    kanjiOptions,
    kanjiRepo,
    occurrenceRepo,
    reloadOccurrences,
    toast
  } = params
  return (data: QuickCreateKanjiData): void => {
    if (componentId.value === null) return
    try {
      const newKanji = kanjiRepo.create({
        character: data.character,
        shortMeaning: data.shortMeaning ?? null
      })
      occurrenceRepo.create({
        kanjiId: newKanji.id,
        componentId: componentId.value
      })
      reloadOccurrences()
      kanjiOptions.value = kanjiRepo.getAll()
      toast.success('Kanji created and linked')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to create and link kanji'
      )
    }
  }
}

/**
 * Provides handlers for linking and unlinking kanji occurrences on the component detail page.
 *
 * @param deps - Component ID, occurrence list, kanji options, and reload callback
 * @returns Handlers for adding and removing occurrence–kanji links
 */
export function useComponentDetailOccurrenceLinkHandlers(
  deps: UseOccurrenceLinkHandlersDeps
): UseOccurrenceLinkHandlersReturn {
  const kanjiRepo = useKanjiRepository()
  const toast = useToast()
  return {
    handleOccurrenceAdd: createAddHandler({
      componentId: deps.componentId,
      reloadOccurrences: deps.reloadOccurrences,
      occurrenceRepo: deps.occurrenceRepo,
      toast
    }),
    handleOccurrenceCreate: createCreateAndLinkHandler({
      componentId: deps.componentId,
      kanjiOptions: deps.kanjiOptions,
      reloadOccurrences: deps.reloadOccurrences,
      occurrenceRepo: deps.occurrenceRepo,
      kanjiRepo,
      toast
    })
  }
}
