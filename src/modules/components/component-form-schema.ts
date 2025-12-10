/**
 * Component Form Schema
 *
 * Zod validation schema for component create/edit forms.
 */

import { z } from 'zod'

export const componentFormSchema = z.object({
  character: z
    .string()
    .min(1, 'Character is required')
    .max(1, 'Must be a single character'),

  strokeCount: z
    .number({ required_error: 'Stroke count is required' })
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(64, 'Must be at most 64'),

  shortMeaning: z.string().optional(),

  japaneseName: z.string().optional(),

  description: z.string().optional(),

  sourceKanjiId: z.number().nullable().optional(),

  // Radical-related fields (for components that can be radicals)
  canBeRadical: z.boolean().optional(),

  kangxiNumber: z
    .number()
    .int('Must be a whole number')
    .min(1, 'Must be at least 1')
    .max(214, 'Must be at most 214')
    .nullable()
    .optional(),

  kangxiMeaning: z.string().optional(),

  radicalNameJapanese: z.string().optional()
})

// Export inferred type
export type ComponentFormData = z.infer<typeof componentFormSchema>
