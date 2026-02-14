/**
 * Database Types
 *
 * TypeScript interfaces matching the SQLite schema.
 * Column names use snake_case in SQL, camelCase in TypeScript.
 */

// =============================================================================
// Enum Types
// =============================================================================

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'non-jlpt'

export type JoyoLevel =
  | 'elementary1'
  | 'elementary2'
  | 'elementary3'
  | 'elementary4'
  | 'elementary5'
  | 'elementary6'
  | 'secondary'
  | 'non-joyo'

export type KanjiKenteiLevel =
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | 'pre2'
  | '2'
  | 'pre1'
  | '1'

/** Kentei level display labels */
export const KENTEI_LABELS: Record<KanjiKenteiLevel, string> = {
  '10': '10級',
  '9': '9級',
  '8': '8級',
  '7': '7級',
  '6': '6級',
  '5': '5級',
  '4': '4級',
  '3': '3級',
  pre2: '準2級',
  '2': '2級',
  pre1: '準1級',
  '1': '1級'
}

// =============================================================================
// Entity Types
// =============================================================================

/**
 * Kanji entity — Primary table storing kanji entries
 */
export interface Kanji {
  id: number
  character: string
  strokeCount: number | null
  shortMeaning: string | null
  searchKeywords: string | null
  radicalId: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  kenteiLevel: KanjiKenteiLevel | null
  strokeDiagramImage: Uint8Array | null
  strokeGifImage: Uint8Array | null
  notesEtymology: string | null
  notesSemantic: string | null
  notesEducationMnemonics: string | null
  notesPersonal: string | null
  identifier: number | null
  radicalStrokeCount: number | null
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

/**
 * Component entity — Building blocks of kanji (radicals and sub-components)
 */
export interface Component {
  id: number
  character: string
  strokeCount: number | null
  shortMeaning: string | null
  sourceKanjiId: number | null
  searchKeywords: string | null
  description: string | null
  canBeRadical: boolean
  kangxiNumber: number | null
  kangxiMeaning: string | null
  radicalNameJapanese: string | null
  createdAt: string
  updatedAt: string
}

/**
 * ComponentOccurrence — Per-occurrence data for kanji-component relationships
 * Replaces the old KanjiComponent junction table
 */
export interface ComponentOccurrence {
  id: number
  kanjiId: number
  componentId: number
  componentFormId: number | null
  positionTypeId: number | null
  isRadical: boolean
  displayOrder: number
  analysisNotes: string | null
  createdAt: string
  updatedAt: string
}

/**
 * OccurrenceWithComponent — Component occurrence with full component data
 */
export interface OccurrenceWithComponent extends ComponentOccurrence {
  component: Component
  position: PositionType | null
}

/**
 * OccurrenceWithKanji — Component occurrence with full kanji data
 */
export interface OccurrenceWithKanji extends ComponentOccurrence {
  kanji: Kanji
  position: PositionType | null
}

/**
 * PositionType — Reference table for component positions in kanji
 */
export interface PositionType {
  id: number
  positionName: string
  nameJapanese: string | null
  nameEnglish: string | null
  description: string | null
  descriptionShort: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * ClassificationType — Reference table for kanji classification types (Rikusho)
 */
export interface ClassificationType {
  id: number
  typeName: string
  nameJapanese: string | null
  nameEnglish: string | null
  description: string | null
  descriptionShort: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * ComponentForm — Different visual forms of the same semantic component
 */
export interface ComponentForm {
  id: number
  componentId: number
  formCharacter: string
  formName: string | null
  strokeCount: number | null
  usageNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Input type for creating a component form
 */
export interface CreateComponentFormInput {
  componentId: number
  formCharacter: string
  formName?: string | null
  strokeCount?: number | null
  usageNotes?: string | null
  displayOrder?: number
}

/**
 * Input type for updating a component form
 */
export interface UpdateComponentFormInput {
  formName?: string | null
  strokeCount?: number | null
  usageNotes?: string | null
  displayOrder?: number
}

/**
 * ComponentGrouping — User-created groups for pattern analysis
 */
export interface ComponentGrouping {
  id: number
  componentId: number
  name: string
  description: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * ComponentGroupingWithMembers — Grouping with count of members
 */
export interface ComponentGroupingWithMembers extends ComponentGrouping {
  occurrenceCount: number
}

/**
 * ComponentGroupingMember — Junction table linking occurrences to groupings
 */
export interface ComponentGroupingMember {
  id: number
  groupingId: number
  occurrenceId: number
  displayOrder: number
}

/**
 * Input type for creating a component grouping
 */
export interface CreateComponentGroupingInput {
  componentId: number
  name: string
  description?: string | null
  displayOrder?: number
}

/**
 * Input type for updating a component grouping
 */
export interface UpdateComponentGroupingInput {
  name?: string
  description?: string | null
  displayOrder?: number
}

/**
 * KanjiClassification — Links kanji to classification types
 * Primary classification is determined by display_order (first = primary)
 */
export interface KanjiClassification {
  id: number
  kanjiId: number
  classificationTypeId: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * KanjiClassificationWithType — Classification with joined type data
 */
export interface KanjiClassificationWithType extends KanjiClassification {
  typeName: string
  nameJapanese: string | null
  nameEnglish: string | null
  description: string | null
  descriptionShort: string | null
}

/**
 * Input type for creating a kanji classification
 */
export interface CreateKanjiClassificationInput {
  kanjiId: number
  classificationTypeId: number
  displayOrder?: number
}

/**
 * Input type for updating a kanji classification
 */
export interface UpdateKanjiClassificationInput {
  classificationTypeId?: number
  displayOrder?: number
}

// =============================================================================
// Reading Types
// =============================================================================

/**
 * Reading level for on-yomi and kun-yomi
 * - '小' - Elementary school (default)
 * - '中' - Junior high school
 * - '高' - High school
 * - '外' - 表外音訓 (non-standard reading)
 */
export type ReadingLevel = '小' | '中' | '高' | '外'

/**
 * OnReading — On-yomi reading for a kanji
 */
export interface OnReading {
  id: number
  kanjiId: number
  reading: string
  readingLevel: ReadingLevel
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * KunReading — Kun-yomi reading for a kanji (with optional okurigana)
 */
export interface KunReading {
  id: number
  kanjiId: number
  reading: string
  okurigana: string | null
  readingLevel: ReadingLevel
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Input type for creating an on-yomi reading
 */
export interface CreateOnReadingInput {
  kanjiId: number
  reading: string
  readingLevel?: ReadingLevel
  displayOrder?: number
}

/**
 * Input type for updating an on-yomi reading
 */
export interface UpdateOnReadingInput {
  reading?: string
  readingLevel?: ReadingLevel
  displayOrder?: number
}

/**
 * Input type for creating a kun-yomi reading
 */
export interface CreateKunReadingInput {
  kanjiId: number
  reading: string
  okurigana?: string | null
  readingLevel?: ReadingLevel
  displayOrder?: number
}

/**
 * Input type for updating a kun-yomi reading
 */
export interface UpdateKunReadingInput {
  reading?: string
  okurigana?: string | null
  readingLevel?: ReadingLevel
  displayOrder?: number
}

// =============================================================================
// Meaning Types
// =============================================================================

/**
 * KanjiMeaning — Core meaning entry for a kanji
 */
export interface KanjiMeaning {
  id: number
  kanjiId: number
  meaningText: string
  additionalInfo: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * KanjiMeaningReadingGroup — Optional reading grouping for meanings
 */
export interface KanjiMeaningReadingGroup {
  id: number
  kanjiId: number
  readingText: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * KanjiMeaningGroupMember — Junction table linking meanings to reading groups
 */
export interface KanjiMeaningGroupMember {
  id: number
  readingGroupId: number
  meaningId: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Input type for creating a kanji meaning
 */
export interface CreateKanjiMeaningInput {
  kanjiId: number
  meaningText: string
  additionalInfo?: string | null
  displayOrder?: number
}

/**
 * Input type for updating a kanji meaning
 */
export interface UpdateKanjiMeaningInput {
  meaningText?: string
  additionalInfo?: string | null
  displayOrder?: number
}

/**
 * Input type for creating a reading group
 */
export interface CreateReadingGroupInput {
  kanjiId: number
  readingText: string
  displayOrder?: number
}

/**
 * Input type for updating a reading group
 */
export interface UpdateReadingGroupInput {
  readingText?: string
  displayOrder?: number
}

/**
 * Input type for creating a group member assignment
 */
export interface CreateGroupMemberInput {
  readingGroupId: number
  meaningId: number
  displayOrder?: number
}

/**
 * MeaningWithGroup — Meaning with its group assignment info for display
 */
export interface MeaningWithGroup extends KanjiMeaning {
  readingGroupId: number | null
  orderInGroup: number | null
}

/**
 * @deprecated Use ComponentOccurrence instead. Kept for migration compatibility.
 */
export interface KanjiComponent {
  kanjiId: number
  componentId: number
  position: number | null
}

// =============================================================================
// Input Types (for create/update operations)
// =============================================================================

export interface CreateKanjiInput {
  character: string
  strokeCount: number | null
  shortMeaning?: string | null
  searchKeywords?: string | null
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  kenteiLevel?: KanjiKenteiLevel | null
  strokeDiagramImage?: Uint8Array | null
  strokeGifImage?: Uint8Array | null
  notesEtymology?: string | null
  notesSemantic?: string | null
  notesEducationMnemonics?: string | null
  notesPersonal?: string | null
  identifier?: number | null
  radicalStrokeCount?: number | null
}

export interface UpdateKanjiInput {
  character?: string
  strokeCount?: number | null
  shortMeaning?: string | null
  searchKeywords?: string | null
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  kenteiLevel?: KanjiKenteiLevel | null
  strokeDiagramImage?: Uint8Array | null
  strokeGifImage?: Uint8Array | null
  notesEtymology?: string | null
  notesSemantic?: string | null
  notesEducationMnemonics?: string | null
  notesPersonal?: string | null
  identifier?: number | null
  radicalStrokeCount?: number | null
}

export interface CreateComponentInput {
  character: string
  strokeCount?: number | null
  shortMeaning?: string | null
  sourceKanjiId?: number | null
  searchKeywords?: string | null
  description?: string | null
  canBeRadical?: boolean
  kangxiNumber?: number | null
  kangxiMeaning?: string | null
  radicalNameJapanese?: string | null
}

export interface UpdateComponentInput {
  character?: string
  strokeCount?: number | null
  shortMeaning?: string | null
  sourceKanjiId?: number | null
  searchKeywords?: string | null
  description?: string | null
  canBeRadical?: boolean
  kangxiNumber?: number | null
  kangxiMeaning?: string | null
  radicalNameJapanese?: string | null
}

export interface CreateComponentOccurrenceInput {
  kanjiId: number
  componentId: number
  componentFormId?: number | null
  positionTypeId?: number | null
  isRadical?: boolean
  displayOrder: number
  analysisNotes?: string | null
}

export interface UpdateComponentOccurrenceInput {
  componentFormId?: number | null
  positionTypeId?: number | null
  isRadical?: boolean
  displayOrder?: number
  analysisNotes?: string | null
}

/**
 * @deprecated Radicals table no longer exists. Radical data is now in components table.
 */
export interface CreateRadicalInput {
  character: string
  strokeCount: number
  number: number
  meaning?: string | null
  japaneseName?: string | null
}

/**
 * @deprecated Radicals table no longer exists. Radical data is now in components table.
 */
export interface UpdateRadicalInput {
  character?: string
  strokeCount?: number
  number?: number
  meaning?: string | null
  japaneseName?: string | null
}

// =============================================================================
// Query/Filter Types
// =============================================================================

export interface KanjiFilters {
  character?: string
  searchKeywords?: string
  strokeCountMin?: number
  strokeCountMax?: number
  jlptLevels?: JlptLevel[]
  joyoLevels?: JoyoLevel[]
  kenteiLevels?: KanjiKenteiLevel[]
  radicalId?: number
  componentId?: number
  /** Filter kanji that have a matching on-yomi reading */
  onYomi?: string
  /** Filter kanji that have a matching kun-yomi reading */
  kunYomi?: string
}

export interface ComponentFilters {
  character?: string
  searchKeywords?: string
  strokeCountMin?: number
  strokeCountMax?: number
  sourceKanjiId?: number
}

// =============================================================================
// Vocabulary Types
// =============================================================================

/**
 * Vocabulary entity — Stores vocabulary words with readings and meanings
 */
export interface Vocabulary {
  id: number
  word: string
  kana: string | null
  shortMeaning: string | null
  searchKeywords: string | null
  jlptLevel: JlptLevel | null
  isCommon: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

/**
 * VocabKanji — Junction table linking vocabulary to constituent kanji
 */
export interface VocabKanji {
  id: number
  vocabId: number
  kanjiId: number
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * VocabKanjiWithKanji — Junction with full kanji data joined
 */
export interface VocabKanjiWithKanji extends VocabKanji {
  kanji: Kanji
}

/**
 * VocabKanjiWithVocab — Junction with full vocabulary data joined
 */
export interface VocabKanjiWithVocab extends VocabKanji {
  vocabulary: Vocabulary
}

/**
 * Input type for creating vocabulary
 */
export interface CreateVocabularyInput {
  word: string
  kana?: string | null
  shortMeaning?: string | null
  searchKeywords?: string | null
  jlptLevel?: JlptLevel | null
  isCommon?: boolean
  description?: string | null
}

/**
 * Input type for updating vocabulary header fields
 */
export interface UpdateVocabularyHeaderInput {
  word?: string
  kana?: string | null
  shortMeaning?: string | null
  searchKeywords?: string | null
}

/**
 * Input type for updating vocabulary basic info fields
 */
export interface UpdateVocabularyBasicInfoInput {
  jlptLevel?: JlptLevel | null
  isCommon?: boolean
  description?: string | null
}

/**
 * Filters for vocabulary search
 */
export interface VocabularyFilters {
  searchText?: string
  jlptLevels?: JlptLevel[]
  isCommon?: boolean
  containsKanjiId?: number
}

// =============================================================================
// View Types (with joined data)
// =============================================================================

/**
 * Kanji with resolved relationships for display
 */
export interface KanjiWithRelations extends Kanji {
  radical: Component | null
  components: Component[]
}

/**
 * Component with resolved source kanji
 */
export interface ComponentWithSource extends Component {
  sourceKanji: Kanji | null
}
