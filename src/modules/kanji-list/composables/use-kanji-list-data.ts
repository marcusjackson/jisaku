/**
 * Kanji List Data Composable
 *
 * Handles data fetching for the kanji list.
 * Loads kanji list, reference data, and primary classifications.
 *
 * @module modules/kanji-list/composables
 */

import { ref } from 'vue';

import {
  useClassificationTypeRepository,
  useKanjiClassificationRepository,
} from '@/api/classification';
import { useComponentRepository } from '@/api/component';
import { useKanjiRepository } from '@/api/kanji';

import { useToast } from '@/shared/composables';

import type { KanjiListFilters } from '../kanji-list-types';
import type { ClassificationType, KanjiClassification } from '@/api/classification';
import type { Component } from '@/api/component';
import type { Kanji } from '@/api/kanji';
import type { Ref } from 'vue';

export interface UseKanjiListDataReturn {
  kanjiList: Ref<Kanji[]>;
  components: Ref<Component[]>;
  radicals: Ref<Component[]>;
  classificationTypes: Ref<ClassificationType[]>;
  primaryClassifications: Ref<Map<number, KanjiClassification | null>>;
  fetchError: Ref<Error | null>;
  loadKanji: (filters: KanjiListFilters) => void;
  loadReferenceData: () => void;
}

/** Record a failed load in `fetchError` and toast it; the previous list stays on screen. */
function reportLoadError(
  fetchError: Ref<Error | null>,
  showError: (message: string) => void,
  err: unknown
): void {
  fetchError.value = err instanceof Error ? err : new Error(String(err));
  showError(fetchError.value.message);
}

/**
 * Fetches and manages reference data for the kanji list page.
 *
 * @returns Reactive state for kanji list data, component data, and load functions
 */
export function useKanjiListData(): UseKanjiListDataReturn {
  const kanjiList = ref<Kanji[]>([]);
  const components = ref<Component[]>([]);
  const radicals = ref<Component[]>([]);
  const classificationTypes = ref<ClassificationType[]>([]);
  const primaryClassifications = ref<Map<number, KanjiClassification | null>>(new Map());
  const fetchError = ref<Error | null>(null);
  const { error: showError } = useToast();

  function loadKanji(filters: KanjiListFilters): void {
    fetchError.value = null;
    try {
      const repo = useKanjiRepository();
      const classRepo = useKanjiClassificationRepository();
      kanjiList.value = repo.search(filters);

      const map = new Map<number, KanjiClassification | null>();
      for (const kanji of kanjiList.value) {
        const classifications = classRepo.getByKanjiIdWithType(kanji.id);
        map.set(kanji.id, classifications[0] ?? null);
      }
      primaryClassifications.value = map;
    } catch (err) {
      reportLoadError(fetchError, showError, err);
    }
  }

  function loadReferenceData(): void {
    fetchError.value = null;
    try {
      const compRepo = useComponentRepository();
      components.value = compRepo.getAll();
      radicals.value = compRepo.getRadicals();

      const typeRepo = useClassificationTypeRepository();
      classificationTypes.value = typeRepo.getAll();
    } catch (err) {
      reportLoadError(fetchError, showError, err);
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
    loadReferenceData,
  };
}
