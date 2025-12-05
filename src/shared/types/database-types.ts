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
  radicalId: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  strokeDiagramImage: Uint8Array | null
  strokeGifImage: Uint8Array | null
  notesEtymology: string | null
  notesCultural: string | null
  notesPersonal: string | null
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
  sourceKanjiId: number | null
  descriptionShort: string | null
  japaneseName: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Radical entity — Kangxi radicals for kanji classification
 */
export interface Radical {
  id: number
  character: string
  strokeCount: number
  number: number // Kangxi radical number (1-214)
  meaning: string | null
  japaneseName: string | null
  createdAt: string
  updatedAt: string
}

/**
 * KanjiComponent junction — Links kanji to their components
 */
export interface KanjiComponent {
  kanjiId: number
  componentId: number
  position: number | null // Optional ordering for display
}

// =============================================================================
// Input Types (for create/update operations)
// =============================================================================

export interface CreateKanjiInput {
  character: string
  strokeCount: number
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  strokeDiagramImage?: Uint8Array | null
  strokeGifImage?: Uint8Array | null
  notesEtymology?: string | null
  notesCultural?: string | null
  notesPersonal?: string | null
}

export interface UpdateKanjiInput {
  character?: string
  strokeCount?: number
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  strokeDiagramImage?: Uint8Array | null
  strokeGifImage?: Uint8Array | null
  notesEtymology?: string | null
  notesCultural?: string | null
  notesPersonal?: string | null
}

export interface CreateComponentInput {
  character: string
  strokeCount: number
  sourceKanjiId?: number | null
  descriptionShort?: string | null
  japaneseName?: string | null
  description?: string | null
}

export interface UpdateComponentInput {
  character?: string
  strokeCount?: number
  sourceKanjiId?: number | null
  descriptionShort?: string | null
  japaneseName?: string | null
  description?: string | null
}

export interface CreateRadicalInput {
  character: string
  strokeCount: number
  number: number
  meaning?: string | null
  japaneseName?: string | null
}

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
  radical: Radical | null
  components: Component[]
}

/**
 * Component with resolved source kanji
 */
export interface ComponentWithSource extends Component {
  sourceKanji: Kanji | null
}
