/**
 * Kanji Create Schema
 *
 * Zod validation schema for the create kanji dialog.
 *
 * @module modules/kanji-list
 */

import { z } from 'zod'

import { singleCharacterSchema } from '@/shared/validation'

export const kanjiCreateSchema = z.object({
  character: singleCharacterSchema
})

export type KanjiCreateData = z.infer<typeof kanjiCreateSchema>
