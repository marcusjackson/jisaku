/**
 * Kanji Detail Meanings Handlers
 *
 * Composable for handling meaning operations in the kanji detail page.
 * Manages meanings, reading groups, and group member assignments.
 */

import {
  processGroupMembers,
  processMeanings,
  processReadingGroups
} from '../utils/meaning-processing'

import type { MeaningsSaveData } from '../kanji-detail-types'
import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'
import type { useGroupMemberRepository } from '@/api/kanji/group-member-repository'
import type { useKanjiMeaningRepository } from '@/api/kanji/meaning-repository'
import type { useReadingGroupRepository } from '@/api/kanji/reading-group-repository'
import type { Ref } from 'vue'

interface Repositories {
  groupMemberRepo: ReturnType<typeof useGroupMemberRepository>
  meaningRepo: ReturnType<typeof useKanjiMeaningRepository>
  readingGroupRepo: ReturnType<typeof useReadingGroupRepository>
}

interface State {
  groupMembers: Ref<KanjiMeaningGroupMember[]>
  kanjiId: Ref<number>
  meanings: Ref<KanjiMeaning[]>
  readingGroups: Ref<KanjiMeaningReadingGroup[]>
}

export function useKanjiDetailMeaningsHandlers(
  state: State,
  repos: Repositories
) {
  const { groupMembers, kanjiId, meanings, readingGroups } = state
  const { groupMemberRepo, meaningRepo, readingGroupRepo } = repos

  function handleSaveMeanings(data: MeaningsSaveData): void {
    if (data.groupingDisabled) disableGrouping()
    processMeanings(data.meanings, meanings.value, kanjiId.value, meaningRepo)

    if (!data.groupingDisabled) {
      processReadingGroups(
        data.readingGroups,
        readingGroups.value,
        kanjiId.value,
        readingGroupRepo,
        groupMemberRepo
      )
      const freshGroups = readingGroupRepo.getByParentId(kanjiId.value)
      processGroupMembers(
        data.groupMembers,
        data.readingGroups,
        groupMembers.value,
        freshGroups,
        groupMemberRepo
      )
    }
    reloadMeanings()
  }

  function disableGrouping(): void {
    for (const m of groupMembers.value) groupMemberRepo.remove(m.id)
    for (const g of readingGroups.value) readingGroupRepo.remove(g.id)
  }

  function reloadMeanings(): void {
    groupMembers.value = groupMemberRepo.getByKanjiId(kanjiId.value)
    meanings.value = meaningRepo.getByParentId(kanjiId.value)
    readingGroups.value = readingGroupRepo.getByParentId(kanjiId.value)
  }

  return { handleSaveMeanings, reloadMeanings }
}
