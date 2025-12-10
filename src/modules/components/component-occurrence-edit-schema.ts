/**
 * Component Occurrence Edit Schema
 *
 * Zod validation schema for editing component occurrence metadata.
 */

import { z } from 'zod'

export const componentOccurrenceEditSchema = z.object({
  positionTypeId: z.number().nullable(),

  isRadical: z.boolean(),

  analysisNotes: z.string().optional()
})

// Export inferred type
export type ComponentOccurrenceEditData = z.infer<
  typeof componentOccurrenceEditSchema
>
