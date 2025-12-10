/**
 * Kanji Form Schema
 *
 * Zod validation schema for kanji create/edit forms.
 */

import { z } from 'zod'

export const kanjiFormSchema = z.object({
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

  jlptLevel: z.enum(['N5', 'N4', 'N3', 'N2', 'N1']).nullable().optional(),

  joyoLevel: z
    .enum([
      'elementary1',
      'elementary2',
      'elementary3',
      'elementary4',
      'elementary5',
      'elementary6',
      'secondary'
    ])
    .nullable()
    .optional(),

  kenteiLevel: z.string().nullable().optional(),

  notesEtymology: z.string().optional(),
  notesSemantic: z.string().optional(),
  notesEducationMnemonics: z.string().optional(),
  notesPersonal: z.string().optional(),

  strokeDiagramImage: z.instanceof(Uint8Array).nullable().optional(),
  strokeGifImage: z.instanceof(Uint8Array).nullable().optional(),

  /** Component IDs linked to this kanji (for form submission) */
  componentIds: z.array(z.number()).optional()
})

// Export inferred type
export type KanjiFormData = z.infer<typeof kanjiFormSchema>
