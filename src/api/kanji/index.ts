/**
 * Kanji API Module
 *
 * Exports for kanji and related child entity repositories:
 * - Kanji (main entity)
 * - On/Kun Readings (child of kanji)
 * - Meanings (child of kanji)
 */

// Main entity
export type {
  CreateKanjiInput,
  Kanji,
  KanjiFilters,
  UpdateKanjiInput
} from './kanji-repository'
export { useKanjiRepository } from './kanji-repository'
export type {
  AnalysisFieldFilter,
  AnalysisFieldName,
  AnalysisLengthThreshold,
  JlptLevel,
  JoyoLevel,
  KanjiKenteiLevel,
  KanjiSortField,
  KanjiSortOptions,
  SortDirection,
  StrokeOrderFilterValue
} from './kanji-types'

// Readings
export { useKunReadingRepository } from './kun-reading-repository'
export { useOnReadingRepository } from './on-reading-repository'
export type {
  CreateKunReadingInput,
  CreateOnReadingInput,
  KunReading,
  OnReading,
  ReadingLevel,
  UpdateKunReadingInput,
  UpdateOnReadingInput
} from './reading-types'

// Meanings
export { useKanjiMeaningRepository } from './meaning-repository'
export type {
  CreateKanjiMeaningInput,
  KanjiMeaning,
  UpdateKanjiMeaningInput
} from './meaning-types'

// Reading Groups (for organizing meanings)
export { useReadingGroupRepository } from './reading-group-repository'
export type {
  CreateReadingGroupInput,
  KanjiMeaningReadingGroup,
  UpdateReadingGroupInput
} from './reading-group-types'

// Group Members (junction table)
export { useGroupMemberRepository } from './group-member-repository'
export type {
  CreateGroupMemberInput,
  KanjiMeaningGroupMember
} from './group-member-types'
