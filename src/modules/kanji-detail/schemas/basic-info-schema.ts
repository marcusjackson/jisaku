/**
 * Validation schema for kanji basic info edit form
 *
 * @module modules/kanji-detail
 */

import { z } from 'zod'

// ============================================================================
// Constants
// ============================================================================

export const JLPT_VALUES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
export const JOYO_VALUES = [
  'elementary1',
  'elementary2',
  'elementary3',
  'elementary4',
  'elementary5',
  'elementary6',
  'secondary'
] as const
export const KENTEI_VALUES = [
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  'pre2',
  '2',
  'pre1',
  '1'
] as const

// ============================================================================
// Schema
// ============================================================================

const strokeCountSchema = z
  .number()
  .int()
  .min(1, 'Minimum 1 stroke')
  .max(64, 'Maximum 64 strokes')
  .nullable()

const jlptSchema = z.enum(JLPT_VALUES).nullable()
const joyoSchema = z.enum(JOYO_VALUES).nullable()
const kenteiSchema = z.enum(KENTEI_VALUES).nullable()

/**
 * Classification item in the form
 */
export const classificationItemSchema = z.object({
  id: z.number().or(z.undefined()),
  classificationTypeId: z.number(),
  displayOrder: z.number()
})

export const kanjiBasicInfoSchema = z.object({
  strokeCount: strokeCountSchema,
  jlptLevel: jlptSchema,
  joyoLevel: joyoSchema,
  kanjiKenteiLevel: kenteiSchema,
  radicalId: z.number().nullable(),
  /** Character to create as new radical if not found in existing components */
  newRadicalCharacter: z.string().optional(),
  classifications: z.array(classificationItemSchema)
})

// ============================================================================
// Types
// ============================================================================

export type KanjiBasicInfoFormData = z.infer<typeof kanjiBasicInfoSchema>
export type ClassificationItem = z.infer<typeof classificationItemSchema>
