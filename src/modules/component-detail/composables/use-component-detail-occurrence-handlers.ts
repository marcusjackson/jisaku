/**
 * Use Component Detail Occurrence Handlers
 *
 * Handles occurrence CRUD operations for the component detail page.
 */

import { useComponentOccurrenceRepository } from '@/api/component'
import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import type { OccurrenceUpdateData } from '../component-detail-types'
import type { OccurrenceWithKanji } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { QuickCreateKanjiData } from '@/shared/validation'
import type { Ref } from 'vue'

/** Dependencies for the composable */
interface UseComponentDetailOccurrenceHandlersDeps {
  /** Component ID ref */
  componentId: Ref<number | null>
  /** Occurrences list ref to update */
  occurrences: Ref<OccurrenceWithKanji[]>
  /** Kanji options ref to update after creating new kanji */
  kanjiOptions: Ref<Kanji[]>
}

/** Return type of the composable */
interface UseComponentDetailOccurrenceHandlersReturn {
  handleOccurrenceAdd: (kanjiId: number) => void
  handleOccurrenceCreate: (data: QuickCreateKanjiData) => void
  handleOccurrenceUpdate: (id: number, data: OccurrenceUpdateData) => void
  handleOccurrenceRemove: (id: number) => void
  handleOccurrenceReorder: (ids: number[]) => void
}

// Helper to reload occurrences from repository
function createOccurrencesReloader(
  componentId: Ref<number | null>,
  occurrences: Ref<OccurrenceWithKanji[]>,
  repo: ReturnType<typeof useComponentOccurrenceRepository>
) {
  return (): void => {
    if (componentId.value === null) return
    occurrences.value = repo.getByComponentIdWithKanji(componentId.value)
  }
}

// Helper to create add handler
function createAddOccurrenceHandler(
  componentId: Ref<number | null>,
  reloadOccurrences: () => void,
  repo: ReturnType<typeof useComponentOccurrenceRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (kanjiId: number): void => {
    if (componentId.value === null) return
    try {
      repo.create({
        kanjiId,
        componentId: componentId.value
      })
      reloadOccurrences()
      toast.success('Kanji linked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link kanji')
    }
  }
}

// Helper to create create-and-link handler
function createCreateOccurrenceHandler(deps: {
  componentId: Ref<number | null>
  reloadOccurrences: () => void
  kanjiOptions: Ref<Kanji[]>
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  kanjiRepo: ReturnType<typeof useKanjiRepository>
  toast: ReturnType<typeof useToast>
}) {
  return (data: QuickCreateKanjiData): void => {
    if (deps.componentId.value === null) return
    try {
      const newKanji = deps.kanjiRepo.create({
        character: data.character,
        shortMeaning: data.shortMeaning ?? null
      })
      deps.occurrenceRepo.create({
        kanjiId: newKanji.id,
        componentId: deps.componentId.value
      })
      deps.reloadOccurrences()
      deps.kanjiOptions.value = deps.kanjiRepo.getAll()
      deps.toast.success('Kanji created and linked')
    } catch (err) {
      deps.toast.error(
        err instanceof Error ? err.message : 'Failed to create and link kanji'
      )
    }
  }
}

// Helper to create update handler
function createUpdateOccurrenceHandler(
  reloadOccurrences: () => void,
  repo: ReturnType<typeof useComponentOccurrenceRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (id: number, data: OccurrenceUpdateData): void => {
    try {
      repo.update(id, data)
      reloadOccurrences()
      toast.success('Occurrence updated')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update occurrence'
      )
    }
  }
}

// Helper to create remove handler
function createRemoveOccurrenceHandler(
  componentId: Ref<number | null>,
  reloadOccurrences: () => void,
  repo: ReturnType<typeof useComponentOccurrenceRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (id: number): void => {
    if (componentId.value === null) return
    try {
      repo.remove(id)
      reloadOccurrences()
      toast.success('Kanji unlinked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlink kanji')
    }
  }
}

// Helper to create reorder handler
function createReorderOccurrenceHandler(
  componentId: Ref<number | null>,
  reloadOccurrences: () => void,
  repo: ReturnType<typeof useComponentOccurrenceRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (ids: number[]): void => {
    if (componentId.value === null) return
    try {
      repo.reorder(ids)
      reloadOccurrences()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to reorder occurrences'
      )
    }
  }
}

// Helper to initialize all handlers
function createAllOccurrenceHandlers(deps: {
  componentId: Ref<number | null>
  occurrences: Ref<OccurrenceWithKanji[]>
  kanjiOptions: Ref<Kanji[]>
  componentOccurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  kanjiRepo: ReturnType<typeof useKanjiRepository>
  toast: ReturnType<typeof useToast>
}): UseComponentDetailOccurrenceHandlersReturn {
  const reloadOccurrences = createOccurrencesReloader(
    deps.componentId,
    deps.occurrences,
    deps.componentOccurrenceRepo
  )
  return {
    handleOccurrenceAdd: createAddOccurrenceHandler(
      deps.componentId,
      reloadOccurrences,
      deps.componentOccurrenceRepo,
      deps.toast
    ),
    handleOccurrenceCreate: createCreateOccurrenceHandler({
      componentId: deps.componentId,
      reloadOccurrences,
      kanjiOptions: deps.kanjiOptions,
      occurrenceRepo: deps.componentOccurrenceRepo,
      kanjiRepo: deps.kanjiRepo,
      toast: deps.toast
    }),
    handleOccurrenceUpdate: createUpdateOccurrenceHandler(
      reloadOccurrences,
      deps.componentOccurrenceRepo,
      deps.toast
    ),
    handleOccurrenceRemove: createRemoveOccurrenceHandler(
      deps.componentId,
      reloadOccurrences,
      deps.componentOccurrenceRepo,
      deps.toast
    ),
    handleOccurrenceReorder: createReorderOccurrenceHandler(
      deps.componentId,
      reloadOccurrences,
      deps.componentOccurrenceRepo,
      deps.toast
    )
  }
}

export function useComponentDetailOccurrenceHandlers(
  deps: UseComponentDetailOccurrenceHandlersDeps
): UseComponentDetailOccurrenceHandlersReturn {
  return createAllOccurrenceHandlers({
    componentId: deps.componentId,
    occurrences: deps.occurrences,
    kanjiOptions: deps.kanjiOptions,
    componentOccurrenceRepo: useComponentOccurrenceRepository(),
    kanjiRepo: useKanjiRepository(),
    toast: useToast()
  })
}
