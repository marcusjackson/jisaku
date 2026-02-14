/**
 * Kanji List Data Composable
 *
 * Handles data fetching for the kanji list.
 * Loads kanji list, reference data, and primary classifications.
 *
 * @module modules/kanji-list/composables
 */

import { ref } from 'vue'

import {
  useClassificationTypeRepository,
  useKanjiClassificationRepository
} from '@/api/classification'
import { useComponentRepository } from '@/api/component'
import { useKanjiRepository } from '@/api/kanji'

import type { KanjiListFilters } from '../kanji-list-types'
import type {
  ClassificationType,
  KanjiClassification
} from '@/api/classification'
import type { Component } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { Ref } from 'vue'

export interface UseKanjiListData {
  kanjiList: Ref<Kanji[]>
  components: Ref<Component[]>
  radicals: Ref<Component[]>
  classificationTypes: Ref<ClassificationType[]>
  primaryClassifications: Ref<Map<number, KanjiClassification | null>>
  fetchError: Ref<Error | null>
  loadKanji: (filters: KanjiListFilters) => void
  loadReferenceData: () => void
}

/**
 * Convert KanjiListFilters to API repository format
 */
function convertFiltersToApi(f: KanjiListFilters): Record<string, unknown> {
  return {
    character: f.character,
    searchKeywords: f.searchKeywords,
    meanings: f.meanings,
    onYomi: f.onYomi,
    kunYomi: f.kunYomi,
    jlptLevels: f.jlptLevels,
    joyoLevels: f.joyoLevels,
    kenteiLevels: f.kenteiLevels,
    strokeCountMin: f.strokeCountMin,
    strokeCountMax: f.strokeCountMax,
    radicalId: f.radicalId,
    componentIds: f.componentIds,
    classificationTypeIds: f.classificationTypeIds,
    strokeOrderDiagram: f.strokeOrderDiagram,
    strokeOrderAnimation: f.strokeOrderAnimation,
    analysisFilters: f.analysisFilters
  }
}

export function useKanjiListData(): UseKanjiListData {
  const kanjiList = ref<Kanji[]>([])
  const components = ref<Component[]>([])
  const radicals = ref<Component[]>([])
  const classificationTypes = ref<ClassificationType[]>([])
  const primaryClassifications = ref<Map<number, KanjiClassification | null>>(
    new Map()
  )
  const fetchError = ref<Error | null>(null)

  function loadKanji(filters: KanjiListFilters): void {
    try {
      const repo = useKanjiRepository()
      const classRepo = useKanjiClassificationRepository()
      kanjiList.value = repo.search(convertFiltersToApi(filters))

      const map = new Map<number, KanjiClassification | null>()
      for (const kanji of kanjiList.value) {
        const classifications = classRepo.getByKanjiIdWithType(kanji.id)
        map.set(kanji.id, classifications[0] ?? null)
      }
      primaryClassifications.value = map
    } catch (err) {
      fetchError.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  function loadReferenceData(): void {
    try {
      const compRepo = useComponentRepository()
      components.value = compRepo.getAll()
      radicals.value = compRepo.getRadicals()

      const typeRepo = useClassificationTypeRepository()
      classificationTypes.value = typeRepo.getAll()
    } catch (err) {
      fetchError.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  return {
    kanjiList,
    components,
    radicals,
    classificationTypes,
    primaryClassifications,
    fetchError,
    loadKanji,
    loadReferenceData
  }
}
