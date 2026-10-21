/**
 * Use Kanji Detail Basic Info Handlers
 *
 * Handles save operations for basic info section.
 *
 * @module modules/kanji-detail
 */

import { useDatabase } from '@/shared/composables/use-database';

import type { BasicInfoSaveData, ClassificationChange } from '../kanji-detail-types';
import type { useKanjiClassificationRepository } from '@/api/classification';
import type { KanjiClassification } from '@/api/classification/classification-types';
import type { useComponentRepository } from '@/api/component';
import type { Component as RadicalComponent } from '@/api/component/component-types';
import type { useKanjiRepository } from '@/api/kanji';
import type { Kanji } from '@/api/kanji/kanji-types';
import type { Ref } from 'vue';

interface Repositories {
  kanjiRepository: ReturnType<typeof useKanjiRepository>;
  componentRepository: ReturnType<typeof useComponentRepository>;
  classificationRepository: ReturnType<typeof useKanjiClassificationRepository>;
}

interface State {
  kanji: Ref<Kanji | null>;
  radical: Ref<RadicalComponent | null>;
  allComponents: Ref<RadicalComponent[]>;
  classifications: Ref<KanjiClassification[]>;
}

function syncClassifications(
  kanjiId: number,
  current: KanjiClassification[],
  updated: ClassificationChange[],
  repo: ReturnType<typeof useKanjiClassificationRepository>
): void {
  const currentById = new Map(current.map((c) => [c.id, c]));
  // The repository can't update a row's type, so a saved row whose type
  // changed is replaced: removed here, created again below.
  const kept = updated.filter(
    (c) =>
      c.id !== undefined && currentById.get(c.id)?.classificationTypeId === c.classificationTypeId
  );
  const keptIds = new Set(kept.map((c) => c.id));

  // Remove deleted and replaced
  for (const c of current) {
    if (!keptIds.has(c.id)) repo.remove(c.id);
  }

  // Add new and replaced, then number every row in dialog order
  const orderedIds = updated.map((c) =>
    c.id !== undefined && keptIds.has(c.id)
      ? c.id
      : repo.create({
          kanjiId,
          classificationTypeId: c.classificationTypeId,
          displayOrder: c.displayOrder,
        }).id
  );
  if (orderedIds.length > 0) repo.reorder(orderedIds);
}

/** Every write of a basic-info save, in one transaction. Returns the radical id. */
function writeBasicInfo(
  state: State,
  repos: Repositories,

  kanjiId: number,
  data: BasicInfoSaveData
): number | null {
  let radicalId = data.radicalId;

  // Create new radical component if specified
  if (data.newRadicalCharacter) {
    radicalId = repos.componentRepository.create({
      character: data.newRadicalCharacter,
      canBeRadical: true,
    }).id;
  } else if (radicalId) {
    // Ensure selected component can be radical
    const comp = repos.componentRepository.getById(radicalId);
    if (comp && !comp.canBeRadical) {
      repos.componentRepository.update(radicalId, { canBeRadical: true });
    }
  }

  repos.kanjiRepository.update(kanjiId, {
    strokeCount: data.strokeCount,
    jlptLevel: data.jlptLevel,
    joyoLevel: data.joyoLevel,
    kanjiKenteiLevel: data.kanjiKenteiLevel,
    radicalId,
  });

  syncClassifications(
    kanjiId,
    state.classifications.value,
    data.classifications,
    repos.classificationRepository
  );
  return radicalId;
}

interface UseKanjiDetailBasicInfoHandlersReturn {
  handleSave: (data: BasicInfoSaveData) => void;
}

/**
 * Provides a save handler for the kanji basic-info section.
 * Updates kanji fields, syncs classifications, and refreshes state.
 *
 * @param state - Reactive kanji detail state
 * @param repos - Kanji, component, and classification repositories
 * @returns Save handler for basic info data
 */
export function useKanjiDetailBasicInfoHandlers(
  state: State,
  repos: Repositories
): UseKanjiDetailBasicInfoHandlersReturn {
  const { transaction } = useDatabase();

  function handleSave(data: BasicInfoSaveData): void {
    const kanjiVal = state.kanji.value;
    if (!kanjiVal) return;

    // State is refreshed only after the commit, so a rollback leaves the page as it was.
    const radicalId = transaction(() => writeBasicInfo(state, repos, kanjiVal.id, data));

    if (data.newRadicalCharacter) {
      state.allComponents.value = repos.componentRepository.getAll();
    }
    state.kanji.value = repos.kanjiRepository.getById(kanjiVal.id);
    state.radical.value = radicalId ? repos.componentRepository.getById(radicalId) : null;
    state.classifications.value = repos.classificationRepository.getByKanjiIdWithType(kanjiVal.id);
  }

  return { handleSave };
}
