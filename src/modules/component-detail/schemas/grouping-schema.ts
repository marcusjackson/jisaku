/**
 * Validation schema for component grouping add/edit form
 */

import { z } from 'zod'

export const groupingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z
    .string()
    .max(500, 'Description is too long')
    .nullable()
    .optional()
    .transform((v) => (v === '' ? null : (v ?? null)))
})

export type GroupingSchemaData = z.infer<typeof groupingSchema>
