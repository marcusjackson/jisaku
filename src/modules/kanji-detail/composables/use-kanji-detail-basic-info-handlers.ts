/**
 * Use Kanji Detail Basic Info Handlers
 *
 * Handles save operations for basic info section.
 *
 * @module modules/kanji-detail
 */

import type {
  BasicInfoSaveData,
  ClassificationChange
} from '../kanji-detail-types'
import type { useKanjiClassificationRepository } from '@/api/classification'
import type { KanjiClassification } from '@/api/classification/classification-types'
import type { useComponentRepository } from '@/api/component'
import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { useKanjiRepository } from '@/api/kanji'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { Ref } from 'vue'

interface Repositories {
  kanjiRepository: ReturnType<typeof useKanjiRepository>
  componentRepository: ReturnType<typeof useComponentRepository>
  classificationRepository: ReturnType<typeof useKanjiClassificationRepository>
}

interface State {
  kanji: Ref<Kanji | null>
  radical: Ref<RadicalComponent | null>
  allComponents: Ref<RadicalComponent[]>
  classifications: Ref<KanjiClassification[]>
}

function syncClassifications(
  kanjiId: number,
  current: KanjiClassification[],
  updated: ClassificationChange[],
  repo: ReturnType<typeof useKanjiClassificationRepository>
): void {
  const currentIds = new Set(current.map((c) => c.id))
  const updatedIds = new Set(updated.filter((c) => c.id).map((c) => c.id))

  // Remove deleted
  for (const c of current) {
    if (!updatedIds.has(c.id)) repo.remove(c.id)
  }

  // Add new
  for (const c of updated) {
    if (!c.id) {
      repo.create({
        kanjiId,
        classificationTypeId: c.classificationTypeId,
        displayOrder: c.displayOrder
      })
    }
  }

  // Reorder existing
  const reorderIds = updated
    .filter(
      (c): c is ClassificationChange & { id: number } =>
        c.id !== undefined && currentIds.has(c.id)
    )
    .map((c) => c.id)
  if (reorderIds.length > 0) repo.reorder(reorderIds)
}

export function useKanjiDetailBasicInfoHandlers(
  state: State,
  repos: Repositories
) {
  function handleSave(data: BasicInfoSaveData): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) return

    let radicalId = data.radicalId

    // Create new radical component if specified
    if (data.newRadicalCharacter) {
      const newComp = repos.componentRepository.create({
        character: data.newRadicalCharacter,
        canBeRadical: true
      })
      radicalId = newComp.id
      state.allComponents.value = repos.componentRepository.getAll()
    } else if (radicalId) {
      // Ensure selected component can be radical
      const comp = repos.componentRepository.getById(radicalId)
      if (comp && !comp.canBeRadical) {
        repos.componentRepository.update(radicalId, { canBeRadical: true })
      }
    }

    // Update kanji fields
    repos.kanjiRepository.update(kanjiVal.id, {
      strokeCount: data.strokeCount,
      jlptLevel: data.jlptLevel,
      joyoLevel: data.joyoLevel,
      kanjiKenteiLevel: data.kanjiKenteiLevel,
      radicalId
    })

    // Sync classifications
    syncClassifications(
      kanjiVal.id,
      state.classifications.value,
      data.classifications,
      repos.classificationRepository
    )

    // Refresh state
    state.kanji.value = repos.kanjiRepository.getById(kanjiVal.id)
    state.radical.value = radicalId
      ? repos.componentRepository.getById(radicalId)
      : null
    state.classifications.value =
      repos.classificationRepository.getByKanjiIdWithType(kanjiVal.id)
  }

  return { handleSave }
}
