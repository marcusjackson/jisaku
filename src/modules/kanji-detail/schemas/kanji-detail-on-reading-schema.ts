/**
 * Validation schema for on-yomi (Chinese) reading form
 */

import { z } from 'zod'

import type { ReadingLevel } from '@/api/kanji'

/** Valid reading levels for readings */
export const readingLevels = ['小', '中', '高', '外'] as const

export const kanjiDetailOnReadingSchema = z.object({
  reading: z.string().min(1, 'Reading is required'),
  readingLevel: z.enum(readingLevels)
})

export type KanjiDetailOnReadingFormData = z.infer<
  typeof kanjiDetailOnReadingSchema
>

/** Default values for new on-reading */
export const defaultOnReadingValues: KanjiDetailOnReadingFormData = {
  reading: '',
  readingLevel: '小'
}

/** Type guard for reading level */
export function isReadingLevel(value: string): value is ReadingLevel {
  return readingLevels.includes(value as ReadingLevel)
}
