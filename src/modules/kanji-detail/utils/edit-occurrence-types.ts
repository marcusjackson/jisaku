/**
 * Types for component occurrence editing in dialog state
 */

/**
 * Local edit state for component occurrence
 *
 * Used in KanjiDetailDialogComponents to manage changes before saving.
 * Combines occurrence data with component details for display.
 */
export interface EditOccurrence {
  /** Occurrence ID, null for newly added */
  id: number | null
  /** Component ID */
  componentId: number
  /** Position type ID */
  positionTypeId: number | null
  /** Component form ID */
  componentFormId: number | null
  /** Whether this is a radical component */
  isRadical: boolean
  /** Whether marked for deletion */
  markedForDeletion?: boolean

  // Populated fields for display
  /** Component details */
  component: {
    id: number
    character: string
    shortMeaning: string | null
  }
  /** Position type name */
  position: string | null
  /** Component form details */
  form: {
    id: number
    formCharacter: string
    formName: string | null
  } | null
}
