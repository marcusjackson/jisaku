/**
 * Shared component types
 *
 * Types used across shared components that are exported
 * for external consumption.
 */

/**
 * Entity type for entity search
 */
export type EntityType = 'kanji' | 'component'

/**
 * Entity option for entity search
 */
export interface EntityOption {
  id: number
  character: string
  shortMeaning: string | null
  strokeCount: number | null
}
