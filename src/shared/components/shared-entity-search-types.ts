/**
 * Shared Entity Search Types
 *
 * Types for the SharedEntitySearch component, kept in a separate file
 * so that TypeScript tools (including ESLint's type-aware rules) can
 * resolve them without SFC-specific quirks.
 */

/** Entity type for entity search */
export type EntityType = 'kanji' | 'component'

/** Entity option for entity search */
export interface EntityOption {
  id: number
  character: string
  shortMeaning: string | null
  strokeCount: number | null
}
