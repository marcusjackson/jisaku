/**
 * use-kanji-repos - Instantiates all repositories needed for the kanji detail module.
 */
import {
  useClassificationTypeRepository,
  useKanjiClassificationRepository
} from '@/api/classification'
import {
  useComponentFormRepository,
  useComponentOccurrenceRepository,
  useComponentRepository
} from '@/api/component'
import {
  useGroupMemberRepository,
  useKanjiMeaningRepository,
  useKanjiRepository,
  useKunReadingRepository,
  useOnReadingRepository,
  useReadingGroupRepository
} from '@/api/kanji'
import { usePositionTypeRepository } from '@/api/position'
import { useVocabKanjiRepository } from '@/api/vocabulary'

export interface KanjiRepos {
  kanjiRepo: ReturnType<typeof useKanjiRepository>
  componentRepo: ReturnType<typeof useComponentRepository>
  componentOccurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  componentFormRepo: ReturnType<typeof useComponentFormRepository>
  positionTypeRepo: ReturnType<typeof usePositionTypeRepository>
  classificationTypeRepo: ReturnType<typeof useClassificationTypeRepository>
  kanjiClassificationRepo: ReturnType<typeof useKanjiClassificationRepository>
  onReadingRepo: ReturnType<typeof useOnReadingRepository>
  kunReadingRepo: ReturnType<typeof useKunReadingRepository>
  meaningRepo: ReturnType<typeof useKanjiMeaningRepository>
  readingGroupRepo: ReturnType<typeof useReadingGroupRepository>
  groupMemberRepo: ReturnType<typeof useGroupMemberRepository>
  vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>
}

/**
 * Instantiates all repositories required by the kanji detail module.
 *
 * @returns All kanji-detail repository instances
 */
export function useKanjiRepos(): KanjiRepos {
  return {
    kanjiRepo: useKanjiRepository(),
    componentRepo: useComponentRepository(),
    componentOccurrenceRepo: useComponentOccurrenceRepository(),
    componentFormRepo: useComponentFormRepository(),
    positionTypeRepo: usePositionTypeRepository(),
    classificationTypeRepo: useClassificationTypeRepository(),
    kanjiClassificationRepo: useKanjiClassificationRepository(),
    onReadingRepo: useOnReadingRepository(),
    kunReadingRepo: useKunReadingRepository(),
    meaningRepo: useKanjiMeaningRepository(),
    readingGroupRepo: useReadingGroupRepository(),
    groupMemberRepo: useGroupMemberRepository(),
    vocabKanjiRepo: useVocabKanjiRepository()
  }
}
