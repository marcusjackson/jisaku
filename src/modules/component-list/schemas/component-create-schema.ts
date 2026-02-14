/**
 * Component Create Schema
 *
 * Zod validation schema for the create component dialog.
 *
 * @module modules/component-list
 */

import { z } from 'zod'

import { singleCharacterSchema } from '@/shared/validation'

export const componentCreateSchema = z.object({
  character: singleCharacterSchema
})

export type ComponentCreateData = z.infer<typeof componentCreateSchema>
