/**
 * Database Types
 *
 * TypeScript interfaces matching the SQLite schema.
 * Column names use snake_case in SQL, camelCase in TypeScript.
 */

// =============================================================================
// Enum Types
// =============================================================================

export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

export type JoyoLevel =
  | 'elementary1'
  | 'elementary2'
  | 'elementary3'
  | 'elementary4'
  | 'elementary5'
  | 'elementary6'
  | 'secondary'

// =============================================================================
// Entity Types
// =============================================================================

/**
 * Kanji entity — Primary table storing kanji entries
 */
export interface Kanji {
  id: number
  character: string
  strokeCount: number
  shortMeaning: string | null
  radicalId: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  kenteiLevel: string | null
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
  strokeCount: number
  shortMeaning: string | null
  sourceKanjiId: number | null
  japaneseName: string | null
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
  description: string | null
  isPrimary: boolean
  strokeCount: number | null
  createdAt: string
  updatedAt: string
}

/**
 * ComponentGrouping — User-created groups for pattern analysis
 */
export interface ComponentGrouping {
  id: number
  componentId: number
  componentFormId: number | null
  name: string
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * KanjiClassification — Links kanji to classification types
 */
export interface KanjiClassification {
  id: number
  kanjiId: number
  classificationTypeId: number
  isPrimary: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
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
  strokeCount: number
  shortMeaning?: string | null
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  kenteiLevel?: string | null
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
  strokeCount?: number
  shortMeaning?: string | null
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  kenteiLevel?: string | null
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
  strokeCount: number
  shortMeaning?: string | null
  sourceKanjiId?: number | null
  japaneseName?: string | null
  description?: string | null
  canBeRadical?: boolean
  kangxiNumber?: number | null
  kangxiMeaning?: string | null
  radicalNameJapanese?: string | null
}

export interface UpdateComponentInput {
  character?: string
  strokeCount?: number
  shortMeaning?: string | null
  sourceKanjiId?: number | null
  japaneseName?: string | null
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
  strokeCountMin?: number
  strokeCountMax?: number
  jlptLevels?: JlptLevel[]
  joyoLevels?: JoyoLevel[]
  kenteiLevels?: string[]
  radicalId?: number
  componentId?: number
}

export interface ComponentFilters {
  character?: string
  strokeCountMin?: number
  strokeCountMax?: number
  sourceKanjiId?: number
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
